import { memo, useMemo } from "react";
import { RoundedBox, Text } from "@react-three/drei";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

import { type WebsiteItem } from "../model/types";
import { findPresentationActivationFrame, getActivatedPresentationProgress } from "../scene/camera-presentation";
import { milestones, sequenceCompleteFrame, type SteleRenderMode } from "../scene/scene-logic";
import { Favicon } from "./Favicon";
import { assembleScramble, formatVisits, getVisitsSecondaryLabel, rollCounterValue } from "./dashboard-helpers";
import {
    DATA_PANEL_HEIGHT,
    DATA_PANEL_POS_Y,
    DOMAIN_Y,
    RANK_Y,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
    STELE_DASHBOARD_FLOAT_AMPLITUDE,
    STELE_DASHBOARD_PRESENCE_FADE_FRAMES,
    STELE_DASHBOARD_REVEAL_FRAMES,
    TYPE_BADGE_Y,
    VISITS_LABEL_Y,
    VISITS_VALUE_Y,
    getSteleDashboardWorldMetrics,
} from "./stele-dashboard-layout";

/* ---------- layout constants ---------- */

/* ---------- reusable sub-components ---------- */

const VisitsMetric = ({ value, fillOpacity, counterProgress }: { value: string; fillOpacity?: number; counterProgress?: number }) => {
    const displayValue = counterProgress !== undefined && counterProgress < 1
        ? rollCounterValue(value, counterProgress)
        : value;
    return (
    <>
        {/* Цвет значения визитов насыщенный */}
        <Text position={[0, VISITS_VALUE_Y, 0.3]} color="#0284C7" fontSize={3.6} anchorX="center" anchorY="middle" fontWeight="bold" fillOpacity={fillOpacity}>
            {displayValue}
        </Text>
        <Text position={[0, VISITS_LABEL_Y, 0.3]} color="#475569" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold" fillOpacity={fillOpacity === undefined ? 0.72 : fillOpacity * 0.72} letterSpacing={0.03}>
            {getVisitsSecondaryLabel()}
        </Text>
    </>
    );
};

const ScreenBox = ({ opacity = 1 }: { opacity?: number }) => (
    <>
        <RoundedBox args={[SCREEN_WIDTH + 1, SCREEN_HEIGHT + 1, 0.5]} position={[0, 3, 0]} radius={0.8} smoothness={2}>
            {/* transparent={opacity < 1} убирает прозрачность когда карточка полностью проявлена, фикс блендинга */}
            <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.7} transparent={opacity < 1} opacity={opacity} />
        </RoundedBox>
        <RoundedBox args={[SCREEN_WIDTH + 1.6, SCREEN_HEIGHT + 1.6, 0.3]} position={[0, 3, -0.15]} radius={1.0} smoothness={2}>
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.4} transparent opacity={opacity * 0.5} />
        </RoundedBox>
    </>
);

const DataPanel = ({ opacity = 1 }: { opacity?: number }) => (
    <RoundedBox args={[SCREEN_WIDTH + 1, DATA_PANEL_HEIGHT, 0.4]} position={[0, DATA_PANEL_POS_Y, 0]} radius={0.6} smoothness={2}>
        {/* Добавляем emissive, чтобы панель всегда была светлой, даже в темный шторм. */}
        <meshStandardMaterial color="#F8FAFC" emissive="#F8FAFC" emissiveIntensity={0.8} roughness={0.6} transparent={opacity < 1} opacity={opacity} />
    </RoundedBox>
);

const TypeBadge = ({ label, width, opacity = 1 }: { label: string; width: number; opacity?: number }) => {
    // Адаптивный fontSize: при длинных типах уменьшаем
    const badgeFontSize = Math.min(1.3, (width - 1.0) / (label.length * 0.65));
    return (
        <group position={[0, TYPE_BADGE_Y, 0.3]}>
            <RoundedBox args={[width, 2.6, 0.2]} radius={0.3}>
                <meshStandardMaterial color="#0EA5E9" transparent={opacity < 1} opacity={opacity} />
            </RoundedBox>
            <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={badgeFontSize} anchorX="center" anchorY="middle" fontWeight="bold" fillOpacity={opacity}>
                {label}
            </Text>
        </group>
    );
};

const RankText = ({ text, opacity = 1, posY = RANK_Y }: { text: string; opacity?: number; posY?: number }) => (
    <Text 
        position={[0, posY, 0.3]} 
        color="#F8FAFC" 
        fontSize={3.5} 
        anchorX="center" 
        anchorY="middle" 
        fontWeight="bold" 
        fillOpacity={opacity}
        outlineWidth={0.06}
        outlineColor="#0F172A"
    >
        {text}
    </Text>
);

const DomainText = ({ text, fontSize, opacity = 1, color = "#0F172A", scrambleProgress, seed = "dom" }: { text: string; fontSize: number; opacity?: number; color?: string; scrambleProgress?: number; seed?: string }) => {
    const displayText = scrambleProgress !== undefined && scrambleProgress < 1
        ? assembleScramble(text, scrambleProgress, seed)
        : text;
    return (
        <Text position={[0, DOMAIN_Y, 0.3]} color={color} fontSize={fontSize} anchorX="center" anchorY="middle" fontWeight="bold" fillOpacity={opacity}>
            {displayText}
        </Text>
    );
};

/* ---------- full static card ---------- */

const FullCard = memo(({
    item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, opacity = 1,
}: {
    item: WebsiteItem; rank: number; domainFontSize: number; formattedVisits: string; typeLabel: string; typeBadgeWidth: number; opacity?: number;
}) => (
    <>
        <ScreenBox opacity={opacity} />
        <RankText text={`#${rank}`} opacity={opacity} />
        <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={opacity * 0.95} size={9} />
        <DataPanel opacity={opacity} />
        <DomainText text={item.domain} fontSize={domainFontSize} opacity={opacity} />
        <VisitsMetric value={formattedVisits} fillOpacity={opacity} />
        <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={opacity} />
    </>
));
FullCard.displayName = "FullCard";

/* ============================================================
   10 NEW ANIMATION FAMILIES
   ============================================================ */

/* --- 0. Glitch Teleport ---
   RGB-shifted copies flicker, position jitters, then snaps clean */
const EffectGlitchTeleport = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, fps, counterProgress }: EffectProps) => {
    const stabilize = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 10)), config: { damping: 8, mass: 0.6 } });
    const jitterX = stabilize < 0.95 ? Math.sin(animFrame * 7.3) * (1 - stabilize) * 4 : 0;
    const jitterY = stabilize < 0.95 ? Math.cos(animFrame * 5.1) * (1 - stabilize) * 3 : 0;
    const glitchOpacity = stabilize < 0.8 ? (Math.sin(animFrame * 11) > 0 ? 0.7 : 0.3) : 1;
    const rgbSplit = (1 - stabilize) * 2.5;

    return (
        <>
            {/* Red ghost */}
            {rgbSplit > 0.1 && (
                <group position={[-rgbSplit, rgbSplit * 0.5, -0.3]}>
                    <ScreenBox opacity={0.15} />
                </group>
            )}
            {/* Blue ghost */}
            {rgbSplit > 0.1 && (
                <group position={[rgbSplit, -rgbSplit * 0.3, -0.2]}>
                    <ScreenBox opacity={0.15} />
                </group>
            )}
            <group position={[jitterX, jitterY, 0]}>
                <ScreenBox opacity={glitchOpacity} />
                {stabilize > 0.3 && <RankText text={`#${rank}`} opacity={glitchOpacity} />}
                {stabilize > 0.5 && <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={glitchOpacity * 0.95} size={9} />}
                <DataPanel opacity={glitchOpacity} />
                {stabilize > 0.4 && <DomainText text={item.domain} fontSize={domainFontSize} opacity={glitchOpacity} scrambleProgress={counterProgress} seed={`${rank}-domain`} />}
                {stabilize > 0.6 && <VisitsMetric value={formattedVisits} fillOpacity={glitchOpacity} counterProgress={counterProgress} />}
                {stabilize > 0.7 && <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={glitchOpacity} />}
            </group>
        </>
    );
};

/* --- 1. Gravity Drop ---
   Each element drops from above with staggered spring bounces */
const EffectGravityDrop = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, fps, counterProgress }: EffectProps) => {
    const dropScreen = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 10, mass: 1.2 } });
    const dropRank = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 8)), config: { damping: 10, mass: 1.0 } });
    const dropFav = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 16)), config: { damping: 12, mass: 0.8 } });
    const dropPanel = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 24)), config: { damping: 10, mass: 1.4 } });
    const dropDomain = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 32)), config: { damping: 14 } });
    const dropVisits = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 40)), config: { damping: 14 } });
    const dropBadge = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 48)), config: { damping: 14 } });
    const fallH = 60;

    return (
        <>
            <group position={[0, (1 - dropScreen) * fallH, 0]}><ScreenBox opacity={dropScreen} /></group>
            <group position={[0, (1 - dropRank) * (fallH + 20), 0]}><RankText text={`#${rank}`} opacity={dropRank} /></group>
            <group position={[0, (1 - dropFav) * (fallH + 10), 0]}>
                {dropFav > 0.01 && <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={dropFav * 0.95} size={9} />}
            </group>
            <group position={[0, (1 - dropPanel) * fallH, 0]}><DataPanel opacity={dropPanel} /></group>
            <group position={[0, (1 - dropDomain) * 30, 0]}><DomainText text={item.domain} fontSize={domainFontSize} opacity={dropDomain} scrambleProgress={counterProgress} seed={`${rank}-domain`} /></group>
            <group position={[0, (1 - dropVisits) * 25, 0]}><VisitsMetric value={formattedVisits} fillOpacity={dropVisits} counterProgress={counterProgress} /></group>
            <group position={[0, (1 - dropBadge) * 20, 0]}><TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={dropBadge} /></group>
        </>
    );
};

/* --- 2. Vortex Assembly ---
   Elements spin inward from scattered positions */
const EffectVortexAssembly = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, fps, counterProgress }: EffectProps) => {
    const converge = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 12, mass: 1.5 } });
    const angle = (1 - converge) * Math.PI * 4;
    const radius = (1 - converge) * 35;
    const scatter = (i: number) => ({
        x: Math.cos(angle + i * 1.2) * radius,
        y: Math.sin(angle + i * 0.9) * radius * 0.6,
        z: Math.sin(angle + i * 1.5) * radius * 0.3,
    });
    const opacity = interpolate(animFrame, [5, 20], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

    const s0 = scatter(0); const s1 = scatter(1); const s2 = scatter(2);
    const s3 = scatter(3); const s4 = scatter(4); const s5 = scatter(5);

    return (
        <>
            <group position={[s0.x, s0.y, s0.z]}><ScreenBox opacity={opacity} /></group>
            <group position={[s1.x, s1.y + RANK_Y, s1.z]}><RankText text={`#${rank}`} opacity={opacity} posY={0} /></group>
            <group position={[s2.x, s2.y, s2.z]}>
                {opacity > 0.3 && <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={opacity * 0.95} size={9} />}
            </group>
            <group position={[s3.x, s3.y, s3.z]}><DataPanel opacity={opacity} /></group>
            <group position={[s4.x, s4.y, s4.z]}>
                <DomainText text={item.domain} fontSize={domainFontSize} opacity={opacity} scrambleProgress={counterProgress} seed={`${rank}-domain`} />
                <VisitsMetric value={formattedVisits} fillOpacity={opacity} counterProgress={counterProgress} />
            </group>
            <group position={[s5.x, s5.y, s5.z]}><TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={opacity} /></group>
        </>
    );
};

/* --- 3. Digital Rain ---
   Vertical cascade of characters crystallizes into final content */
const EffectDigitalRain = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, index, counterProgress }: EffectProps) => {
    const revealProgress = interpolate(animFrame, [0, 80], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const opacity = interpolate(animFrame, [0, 10], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const rainY = interpolate(animFrame, [0, 40], [30, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const decodedDomain = assembleScramble(item.domain, revealProgress, `${index}-rain-d`);
    const decodedVisits = assembleScramble(formattedVisits, revealProgress, `${index}-rain-v`);
    const decodedRank = assembleScramble(`#${rank}`, revealProgress, `${index}-rain-r`);

    return (
        <>
            {/* Rain streams */}
            {animFrame < 50 && Array.from({ length: 6 }).map((_, i) => {
                const streamX = -6 + i * 2.4;
                const streamY = rainY + 15 - (animFrame * 0.8 + i * 3);
                const streamOpacity = interpolate(animFrame, [i * 3, i * 3 + 15, 40, 50], [0, 0.6, 0.3, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                return (
                    <mesh key={i} position={[streamX, streamY, 0.4]}>
                        <boxGeometry args={[0.3, 8, 0.1]} />
                        <meshBasicMaterial color="#00E5FF" transparent opacity={streamOpacity} />
                    </mesh>
                );
            })}
            <group position={[0, rainY * 0.3, 0]}>
                <ScreenBox opacity={opacity} />
                <RankText text={decodedRank} opacity={opacity} />
                {revealProgress > 0.3 && <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={revealProgress * 0.95} size={9} />}
                <DataPanel opacity={opacity} />
                <DomainText text={decodedDomain} fontSize={domainFontSize} opacity={opacity} color="#0284C7" />
                <VisitsMetric value={decodedVisits} fillOpacity={opacity} counterProgress={counterProgress} />
                {revealProgress > 0.6 && <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={revealProgress} />}
            </group>
        </>
    );
};

/* --- 4. Flip Reveal ---
   Card rotates from back-face like a tarot card flip */
const EffectFlipReveal = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, fps, counterProgress }: EffectProps) => {
    const flip = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 14, mass: 1.8 } });
    const rotationY = (1 - flip) * Math.PI;
    const showFront = flip > 0.5;
    const scaleX = Math.abs(Math.cos(rotationY));
    const fadeIn = interpolate(animFrame, [30, 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

    return (
        <group rotation={[0, rotationY, 0]} scale={[Math.max(0.01, scaleX), 1, 1]}>
            {!showFront ? (
                <>
                    {/* Back face — cyan glow slab */}
                    <RoundedBox args={[SCREEN_WIDTH + 1, SCREEN_HEIGHT + DATA_PANEL_HEIGHT + 2, 0.5]} position={[0, -2, 0]} radius={0.8} smoothness={2}>
                        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.6} />
                    </RoundedBox>
                </>
            ) : (
                <>
                    <ScreenBox />
                    <RankText text={`#${rank}`} opacity={fadeIn} />
                    {fadeIn > 0.2 && <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={fadeIn * 0.95} size={9} />}
                    <DataPanel />
                    <DomainText text={item.domain} fontSize={domainFontSize} opacity={fadeIn} scrambleProgress={counterProgress} seed={`${rank}-domain`} />
                    {fadeIn > 0.3 && <VisitsMetric value={formattedVisits} fillOpacity={fadeIn} counterProgress={counterProgress} />}
                    {fadeIn > 0.5 && <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={fadeIn} />}
                </>
            )}
        </group>
    );
};

/* --- 5. Shatter In ---
   Fragments fly in from all directions and assemble */
const EffectShatterIn = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, fps, counterProgress }: EffectProps) => {
    const assemble = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 11, mass: 1.2 } });
    const spread = (1 - assemble) * 50;
    const rotZ = (1 - assemble) * Math.PI * 2;

    const shardPositions = [
        [spread * 0.8, spread * 0.6, spread * 0.2],
        [-spread * 0.9, spread * 0.4, -spread * 0.3],
        [spread * 0.5, -spread * 0.7, spread * 0.4],
        [-spread * 0.6, -spread * 0.5, -spread * 0.2],
        [spread * 0.3, spread * 0.9, -spread * 0.1],
        [-spread * 0.7, -spread * 0.3, spread * 0.5],
    ];

    return (
        <>
            {/* Flying shards before assembly */}
            {assemble < 0.9 && shardPositions.map((pos, i) => (
                <mesh key={i} position={[pos[0], pos[1], pos[2]]} rotation={[rotZ * (i + 1) * 0.3, rotZ * 0.5, rotZ * (i + 1) * 0.2]}>
                    <boxGeometry args={[3 + i, 2 + i * 0.5, 0.3]} />
                    <meshStandardMaterial color={i % 2 === 0 ? "#1E293B" : "#00E5FF"} transparent opacity={(1 - assemble) * 0.6} />
                </mesh>
            ))}
            <group scale={assemble}>
                <ScreenBox opacity={assemble} />
                <RankText text={`#${rank}`} opacity={assemble} />
                {assemble > 0.6 && <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={assemble * 0.95} size={9} />}
                <DataPanel opacity={assemble} />
                <DomainText text={item.domain} fontSize={domainFontSize} opacity={assemble} scrambleProgress={counterProgress} seed={`${rank}-domain`} />
                {assemble > 0.7 && <VisitsMetric value={formattedVisits} fillOpacity={assemble} counterProgress={counterProgress} />}
                {assemble > 0.8 && <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={assemble} />}
            </group>
        </>
    );
};

/* --- 6. Pulse Scan ---
   Horizontal energy pulse sweeps bottom-to-top, revealing layers */
const EffectPulseScan = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, counterProgress }: EffectProps) => {
    const scanProgress = interpolate(animFrame, [0, 70], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const scanY = interpolate(scanProgress, [0, 1], [-15, 18]);
    const pulseOpacity = interpolate(animFrame, [60, 75], [0.9, 0], { extrapolateRight: "clamp" });
    const badgeShow = scanProgress > 0.15;
    const dataShow = scanProgress > 0.35;
    const visitsShow = scanProgress > 0.5;
    const screenShow = scanProgress > 0.65;
    const favShow = scanProgress > 0.75;
    const rankShow = scanProgress > 0.85;

    return (
        <>
            {/* Scan pulse line */}
            {scanProgress < 1 && (
                <mesh position={[0, scanY, 0.5]}>
                    <boxGeometry args={[SCREEN_WIDTH + 6, 0.6, 1.5]} />
                    <meshBasicMaterial color="#00E5FF" transparent opacity={pulseOpacity} />
                </mesh>
            )}
            {/* Glow trail behind pulse */}
            {scanProgress < 1 && (
                <mesh position={[0, scanY - 3, 0.4]}>
                    <boxGeometry args={[SCREEN_WIDTH + 4, 5, 0.5]} />
                    <meshBasicMaterial color="#00E5FF" transparent opacity={pulseOpacity * 0.15} />
                </mesh>
            )}
            {badgeShow && <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={scanProgress} />}
            {dataShow && (
                <>
                    <DataPanel opacity={scanProgress} />
                    <DomainText text={item.domain} fontSize={domainFontSize} opacity={scanProgress} scrambleProgress={counterProgress} seed={`${rank}-domain`} />
                </>
            )}
            {visitsShow && <VisitsMetric value={formattedVisits} fillOpacity={scanProgress} counterProgress={counterProgress} />}
            {screenShow && <ScreenBox opacity={scanProgress} />}
            {favShow && <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={scanProgress * 0.95} size={9} />}
            {rankShow && <RankText text={`#${rank}`} opacity={scanProgress} />}
        </>
    );
};

/* --- 7. Zoom Tunnel ---
   Card rushes forward from extreme depth */
const EffectZoomTunnel = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, fps, counterProgress }: EffectProps) => {
    const zoom = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 14, mass: 2.0 } });
    const zPos = interpolate(zoom, [0, 1], [-200, 0]);
    const scale = interpolate(zoom, [0, 1], [0.05, 1]);
    const opacity = interpolate(zoom, [0, 0.3, 1], [0, 0.5, 1]);
    const detailOpacity = interpolate(animFrame, [35, 55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

    return (
        <>
            {/* Speed lines */}
            {zoom < 0.8 && Array.from({ length: 4 }).map((_, i) => {
                const lineX = -4 + i * 2.5;
                const lineLength = (1 - zoom) * 80;
                return (
                    <mesh key={i} position={[lineX, 3, zPos - lineLength / 2]}>
                        <boxGeometry args={[0.15, 0.15, lineLength]} />
                        <meshBasicMaterial color="#00E5FF" transparent opacity={(1 - zoom) * 0.4} />
                    </mesh>
                );
            })}
            <group position={[0, 0, zPos]} scale={scale}>
                <ScreenBox opacity={opacity} />
                {detailOpacity > 0.1 && <RankText text={`#${rank}`} opacity={detailOpacity} />}
                {detailOpacity > 0.2 && <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={detailOpacity * 0.95} size={9} />}
                <DataPanel opacity={opacity} />
                {detailOpacity > 0.3 && <DomainText text={item.domain} fontSize={domainFontSize} opacity={detailOpacity} scrambleProgress={counterProgress} seed={`${rank}-domain`} />}
                {detailOpacity > 0.5 && <VisitsMetric value={formattedVisits} fillOpacity={detailOpacity} counterProgress={counterProgress} />}
                {detailOpacity > 0.7 && <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={detailOpacity} />}
            </group>
        </>
    );
};

/* --- 8. Swing Door ---
   Card swings open like a door on a side hinge */
const EffectSwingDoor = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, fps, counterProgress }: EffectProps) => {
    const swing = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 13, mass: 1.5 } });
    const rotationY = (1 - swing) * (-Math.PI / 2);
    const contentFade = interpolate(animFrame, [25, 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

    return (
        <group position={[-(SCREEN_WIDTH / 2 + 0.5), 0, 0]}>
            <group position={[(SCREEN_WIDTH / 2 + 0.5), 0, 0]} rotation={[0, rotationY, 0]}>
                <ScreenBox />
                <DataPanel />
                {contentFade > 0.1 && <RankText text={`#${rank}`} opacity={contentFade} />}
                {contentFade > 0.2 && <Favicon domain={item.domain} yPos={3} zPos={0.3} opacity={contentFade * 0.95} size={9} />}
                {contentFade > 0.3 && <DomainText text={item.domain} fontSize={domainFontSize} opacity={contentFade} scrambleProgress={counterProgress} seed={`${rank}-domain`} />}
                {contentFade > 0.5 && <VisitsMetric value={formattedVisits} fillOpacity={contentFade} counterProgress={counterProgress} />}
                {contentFade > 0.7 && <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={contentFade} />}
            </group>
        </group>
    );
};

/* --- 9. Hologram Flicker ---
   Holographic projection stutters, then locks in */
const EffectHologramFlicker = ({ item, rank, domainFontSize, formattedVisits, typeLabel, typeBadgeWidth, animFrame, fps, counterProgress }: EffectProps) => {
    const lockIn = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 30)), config: { damping: 20 } });
    const flickerPhase = animFrame < 30;
    const isVisible = flickerPhase
        ? (Math.sin(animFrame * 4.5) > -0.3 || animFrame > 20)
        : true;
    const flickerOpacity = flickerPhase
        ? interpolate(Math.sin(animFrame * 6), [-1, 1], [0.2, 0.8])
        : lockIn;
    const hueShift = flickerPhase ? Math.sin(animFrame * 3) * 0.3 : 0;
    const yJitter = flickerPhase ? Math.sin(animFrame * 8.7) * (1 - animFrame / 30) * 2 : 0;

    if (!isVisible) return null;

    return (
        <group position={[0, yJitter, 0]}>
            {/* Hologram base ring */}
            {flickerPhase && (
                <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[7, 8, 32]} />
                    <meshBasicMaterial color="#00E5FF" transparent opacity={flickerOpacity * 0.3} />
                </mesh>
            )}
            {/* Vertical scan lines during flicker */}
            {flickerPhase && (
                <mesh position={[(animFrame % 14) - 7, 0, 0.4]}>
                    <boxGeometry args={[0.2, 30, 0.1]} />
                    <meshBasicMaterial color="#00E5FF" transparent opacity={0.4} />
                </mesh>
            )}
            <ScreenBox opacity={flickerOpacity} />
            <RankText text={`#${rank}`} opacity={flickerOpacity} />
            {flickerOpacity > 0.4 && <Favicon domain={item.domain} yPos={3} zPos={0.3 + hueShift} opacity={flickerOpacity * 0.95} size={9} />}
            <DataPanel opacity={flickerOpacity} />
            <DomainText text={item.domain} fontSize={domainFontSize} opacity={flickerOpacity} scrambleProgress={counterProgress} seed={`${rank}-domain`} />
            {flickerOpacity > 0.5 && <VisitsMetric value={formattedVisits} fillOpacity={flickerOpacity} counterProgress={counterProgress} />}
            {flickerOpacity > 0.6 && <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={flickerOpacity} />}
        </group>
    );
};

/* ============================================================ */

type EffectProps = {
    item: WebsiteItem;
    rank: number;
    domainFontSize: number;
    formattedVisits: string;
    typeLabel: string;
    typeBadgeWidth: number;
    animFrame: number;
    fps: number;
    index: number;
    counterProgress: number;
};

const EFFECTS = [
    EffectGlitchTeleport,
    EffectGravityDrop,
    EffectVortexAssembly,
    EffectDigitalRain,
    EffectFlipReveal,
    EffectShatterIn,
    EffectPulseScan,
    EffectZoomTunnel,
    EffectSwingDoor,
    EffectHologramFlicker,
];

/* ============================================================
   MAIN EXPORT
   ============================================================ */

export const SteleDashboard = ({
    item, dashboardBaseY, worldX, worldZ, rank, index, renderMode,
}: {
    item: WebsiteItem;
    dashboardBaseY: number;
    worldX: number;
    worldZ: number;
    rank: number;
    index: number;
    renderMode: SteleRenderMode;
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    // Гарантируем что домен влезает в панель: maxTextWidth = SCREEN_WIDTH (~13)
    // Каждый символ при fontSize F занимает ~0.55*F, поэтому F <= 13 / (length * 0.55)
    const domainFontSize = Math.min(2.0, (SCREEN_WIDTH - 1) / (item.domain.length * 0.55));
    const formattedVisits = formatVisits(item.monthlyVisits);
    const isCinematic = frame > sequenceCompleteFrame;
    const typeLabel = item.type.toUpperCase();
    const typeBadgeWidth = Math.min(SCREEN_WIDTH, Math.max(6, item.type.length * 1.1 + 2.0));
    const floatY = Math.sin(frame * 0.05 + dashboardBaseY) * STELE_DASHBOARD_FLOAT_AMPLITUDE;
    const milestone = milestones[index];
    const staticDashboardMetrics = useMemo(() => getSteleDashboardWorldMetrics({
        worldX,
        worldZ,
        dashboardBaseY,
        floatY: 0,
    }), [dashboardBaseY, worldX, worldZ]);
    const presentationActivationFrame = useMemo(() => findPresentationActivationFrame({
        searchStartFrame: 0,
        searchEndFrame: Math.min(sequenceCompleteFrame, milestone.leaveFrame + STELE_DASHBOARD_REVEAL_FRAMES),
        subject: staticDashboardMetrics,
        width,
        height,
    }), [height, milestone.leaveFrame, staticDashboardMetrics, width]);
    const presentationProgress = isCinematic ? 1 : getActivatedPresentationProgress({
        frame,
        activationFrame: presentationActivationFrame,
        revealFrames: STELE_DASHBOARD_PRESENCE_FADE_FRAMES,
    });
    const animFrame = presentationActivationFrame === null
        ? 0
        : Math.max(0, Math.min(STELE_DASHBOARD_REVEAL_FRAMES, frame - presentationActivationFrame));
    const liveDashboardMetrics = getSteleDashboardWorldMetrics({
            worldX,
            worldZ,
            dashboardBaseY,
            floatY,
        });

    if (presentationProgress <= 0.001 && !isCinematic) return null;

    /* standby / cinematic — static card */
    if (isCinematic || renderMode === "standby") {
        return (
            <group position={[0, liveDashboardMetrics.rootWorld[1], 0]}>
                <FullCard
                    item={item}
                    rank={rank}
                    domainFontSize={domainFontSize}
                    formattedVisits={formattedVisits}
                    typeLabel={typeLabel}
                    typeBadgeWidth={typeBadgeWidth}
                    opacity={presentationProgress}
                />
            </group>
        );
    }

    /* full mode — animated reveal driven by the reusable camera presentation preset */
    const counterProgress = interpolate(animFrame, [15, 105], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const effectIndex = index % EFFECTS.length;
    const Effect = EFFECTS[effectIndex];

    return (
        <group position={[0, liveDashboardMetrics.rootWorld[1], 0]}>
            <Effect
                item={item}
                rank={rank}
                domainFontSize={domainFontSize}
                formattedVisits={formattedVisits}
                typeLabel={typeLabel}
                typeBadgeWidth={typeBadgeWidth}
                animFrame={animFrame}
                fps={fps}
                index={index}
                counterProgress={counterProgress}
            />
        </group>
    );
};
