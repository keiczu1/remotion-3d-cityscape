import { RoundedBox } from "@react-three/drei";
import { interpolate, random, spring } from "remotion";
import { type ReactNode } from "react";

export const CARD_REVEAL_EFFECT_IDS = [
    "glitch-teleport",
    "gravity-drop",
    "vortex-assembly",
    "digital-rain",
    "flip-reveal",
    "shatter-in",
    "pulse-scan",
    "zoom-tunnel",
    "swing-door",
    "hologram-flicker",
] as const;

export type CardRevealEffectId = (typeof CARD_REVEAL_EFFECT_IDS)[number];

export type CardRevealLayout = {
    screenWidth: number;
    screenHeight: number;
    dataPanelHeight: number;
    rankY: number;
};

export type CardRevealTheme = {
    accentColor: string;
    shellColor: string;
};

export type CardRevealRenderers = {
    renderScreenBox: (options?: { opacity?: number }) => ReactNode;
    renderDataPanel: (options?: { opacity?: number }) => ReactNode;
    renderRankText: (options?: { text?: string; opacity?: number; posY?: number }) => ReactNode;
    renderMedia: (options?: { opacity?: number; zPos?: number; size?: number }) => ReactNode;
    renderDomain: (options?: {
        text?: string;
        opacity?: number;
        color?: string;
        scrambleProgress?: number;
        seed?: string;
    }) => ReactNode;
    renderVisits: (options?: {
        text?: string;
        fillOpacity?: number;
        counterProgress?: number;
    }) => ReactNode;
    renderBadge: (options?: { opacity?: number }) => ReactNode;
};

export type CardRevealEffectProps = {
    rank: number;
    index: number;
    animFrame: number;
    fps: number;
    counterProgress: number;
    visitsText: string;
    renderers: CardRevealRenderers;
    layout: CardRevealLayout;
    theme: CardRevealTheme;
};

type CardRevealEffectComponent = (props: CardRevealEffectProps) => ReactNode;

export const scrambleRevealText = (text: string, progress: number, seed: string) => {
    if (progress >= 1) {
        return text;
    }

    if (progress <= 0) {
        return "";
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&*0123456789";

    return text
        .split("")
        .map((char, i) => {
            if (char === " " || char === ".") {
                return char;
            }

            const charProgress = i / text.length;
            if (progress > charProgress + 0.15) {
                return text[i];
            }

            return chars[Math.floor(random(`${seed}-${i}-${Math.floor(progress * 20)}`) * chars.length)];
        })
        .join("");
};

const EffectGlitchTeleport = ({
    rank,
    animFrame,
    fps,
    counterProgress,
    renderers,
}: CardRevealEffectProps) => {
    const stabilize = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 10)), config: { damping: 8, mass: 0.6 } });
    const jitterX = stabilize < 0.95 ? Math.sin(animFrame * 7.3) * (1 - stabilize) * 4 : 0;
    const jitterY = stabilize < 0.95 ? Math.cos(animFrame * 5.1) * (1 - stabilize) * 3 : 0;
    const glitchOpacity = stabilize < 0.8 ? (Math.sin(animFrame * 11) > 0 ? 0.7 : 0.3) : 1;
    const rgbSplit = (1 - stabilize) * 2.5;

    return (
        <>
            {rgbSplit > 0.1 && (
                <group position={[-rgbSplit, rgbSplit * 0.5, -0.3]}>
                    {renderers.renderScreenBox({ opacity: 0.15 })}
                </group>
            )}
            {rgbSplit > 0.1 && (
                <group position={[rgbSplit, -rgbSplit * 0.3, -0.2]}>
                    {renderers.renderScreenBox({ opacity: 0.15 })}
                </group>
            )}
            <group position={[jitterX, jitterY, 0]}>
                {renderers.renderScreenBox({ opacity: glitchOpacity })}
                {stabilize > 0.3 && renderers.renderRankText({ text: `#${rank}`, opacity: glitchOpacity })}
                {stabilize > 0.5 && renderers.renderMedia({ opacity: glitchOpacity * 0.95, zPos: 0.3, size: 9 })}
                {renderers.renderDataPanel({ opacity: glitchOpacity })}
                {stabilize > 0.4 &&
                    renderers.renderDomain({
                        opacity: glitchOpacity,
                        scrambleProgress: counterProgress,
                        seed: `${rank}-domain`,
                    })}
                {stabilize > 0.6 &&
                    renderers.renderVisits({
                        fillOpacity: glitchOpacity,
                        counterProgress,
                    })}
                {stabilize > 0.7 && renderers.renderBadge({ opacity: glitchOpacity })}
            </group>
        </>
    );
};

const EffectGravityDrop = ({
    rank,
    animFrame,
    fps,
    counterProgress,
    renderers,
}: CardRevealEffectProps) => {
    const dropScreen = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 10, mass: 1.2 } });
    const dropRank = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 8)), config: { damping: 10, mass: 1.0 } });
    const dropMedia = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 16)), config: { damping: 12, mass: 0.8 } });
    const dropPanel = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 24)), config: { damping: 10, mass: 1.4 } });
    const dropDomain = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 32)), config: { damping: 14 } });
    const dropVisits = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 40)), config: { damping: 14 } });
    const dropBadge = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 48)), config: { damping: 14 } });
    const fallHeight = 60;

    return (
        <>
            <group position={[0, (1 - dropScreen) * fallHeight, 0]}>{renderers.renderScreenBox({ opacity: dropScreen })}</group>
            <group position={[0, (1 - dropRank) * (fallHeight + 20), 0]}>
                {renderers.renderRankText({ text: `#${rank}`, opacity: dropRank })}
            </group>
            <group position={[0, (1 - dropMedia) * (fallHeight + 10), 0]}>
                {dropMedia > 0.01 && renderers.renderMedia({ opacity: dropMedia * 0.95, zPos: 0.3, size: 9 })}
            </group>
            <group position={[0, (1 - dropPanel) * fallHeight, 0]}>{renderers.renderDataPanel({ opacity: dropPanel })}</group>
            <group position={[0, (1 - dropDomain) * 30, 0]}>
                {renderers.renderDomain({
                    opacity: dropDomain,
                    scrambleProgress: counterProgress,
                    seed: `${rank}-domain`,
                })}
            </group>
            <group position={[0, (1 - dropVisits) * 25, 0]}>
                {renderers.renderVisits({
                    fillOpacity: dropVisits,
                    counterProgress,
                })}
            </group>
            <group position={[0, (1 - dropBadge) * 20, 0]}>{renderers.renderBadge({ opacity: dropBadge })}</group>
        </>
    );
};

const EffectVortexAssembly = ({
    rank,
    animFrame,
    fps,
    counterProgress,
    renderers,
}: CardRevealEffectProps) => {
    const converge = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 12, mass: 1.5 } });
    const angle = (1 - converge) * Math.PI * 4;
    const radius = (1 - converge) * 35;
    const opacity = interpolate(animFrame, [5, 20], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });
    const scatter = (i: number) => ({
        x: Math.cos(angle + i * 1.2) * radius,
        y: Math.sin(angle + i * 0.9) * radius * 0.6,
        z: Math.sin(angle + i * 1.5) * radius * 0.3,
    });

    const s0 = scatter(0);
    const s1 = scatter(1);
    const s2 = scatter(2);
    const s3 = scatter(3);
    const s4 = scatter(4);
    const s5 = scatter(5);

    return (
        <>
            <group position={[s0.x, s0.y, s0.z]}>{renderers.renderScreenBox({ opacity })}</group>
            <group position={[s1.x, s1.y, s1.z]}>
                {renderers.renderRankText({ text: `#${rank}`, opacity, posY: 0 })}
            </group>
            <group position={[s2.x, s2.y, s2.z]}>
                {opacity > 0.3 && renderers.renderMedia({ opacity: opacity * 0.95, zPos: 0.3, size: 9 })}
            </group>
            <group position={[s3.x, s3.y, s3.z]}>{renderers.renderDataPanel({ opacity })}</group>
            <group position={[s4.x, s4.y, s4.z]}>
                {renderers.renderDomain({
                    opacity,
                    scrambleProgress: counterProgress,
                    seed: `${rank}-domain`,
                })}
                {renderers.renderVisits({ fillOpacity: opacity, counterProgress })}
            </group>
            <group position={[s5.x, s5.y, s5.z]}>{renderers.renderBadge({ opacity })}</group>
        </>
    );
};

const EffectDigitalRain = ({
    rank,
    index,
    animFrame,
    visitsText,
    renderers,
    theme,
    layout,
}: CardRevealEffectProps) => {
    const revealProgress = interpolate(animFrame, [0, 80], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });
    const opacity = interpolate(animFrame, [0, 10], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });
    const rainY = interpolate(animFrame, [0, 40], [30, 0], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });
    const decodedRank = scrambleRevealText(`#${rank}`, revealProgress, `${index}-rain-r`);
    const decodedVisits = scrambleRevealText(visitsText, revealProgress, `${index}-rain-v`);

    return (
        <>
            {animFrame < 50 &&
                Array.from({ length: 6 }).map((_, i) => {
                    const streamX = -6 + i * 2.4;
                    const streamY = rainY + 15 - (animFrame * 0.8 + i * 3);
                    const streamOpacity = interpolate(
                        animFrame,
                        [i * 3, i * 3 + 15, 40, 50],
                        [0, 0.6, 0.3, 0],
                        { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
                    );

                    return (
                        <mesh key={i} position={[streamX, streamY, 0.4]}>
                            <boxGeometry args={[0.3, Math.max(8, layout.screenHeight * 0.62), 0.1]} />
                            <meshBasicMaterial color={theme.accentColor} transparent opacity={streamOpacity} />
                        </mesh>
                    );
                })}
            <group position={[0, rainY * 0.3, 0]}>
                {renderers.renderScreenBox({ opacity })}
                {renderers.renderRankText({
                    text: decodedRank,
                    opacity,
                })}
                {revealProgress > 0.3 && renderers.renderMedia({ opacity: revealProgress * 0.95, zPos: 0.3, size: 9 })}
                {renderers.renderDataPanel({ opacity })}
                {renderers.renderDomain({
                    opacity,
                    color: "#0284C7",
                    scrambleProgress: revealProgress,
                    seed: `${index}-rain-d`,
                })}
                {renderers.renderVisits({
                    text: decodedVisits,
                    fillOpacity: opacity,
                })}
                {revealProgress > 0.6 && renderers.renderBadge({ opacity: revealProgress })}
            </group>
        </>
    );
};

const EffectFlipReveal = ({
    rank,
    animFrame,
    fps,
    counterProgress,
    renderers,
    layout,
    theme,
}: CardRevealEffectProps) => {
    const flip = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 14, mass: 1.8 } });
    const rotationY = (1 - flip) * Math.PI;
    const showFront = flip > 0.5;
    const scaleX = Math.abs(Math.cos(rotationY));
    const fadeIn = interpolate(animFrame, [30, 50], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });

    return (
        <group rotation={[0, rotationY, 0]} scale={[Math.max(0.01, scaleX), 1, 1]}>
            {!showFront ? (
                <RoundedBox
                    args={[layout.screenWidth + 1, layout.screenHeight + layout.dataPanelHeight + 2, 0.5]}
                    position={[0, -2, 0]}
                    radius={0.8}
                    smoothness={2}
                >
                    <meshStandardMaterial color={theme.accentColor} emissive={theme.accentColor} emissiveIntensity={0.6} />
                </RoundedBox>
            ) : (
                <>
                    {renderers.renderScreenBox()}
                    {renderers.renderRankText({ text: `#${rank}`, opacity: fadeIn })}
                    {fadeIn > 0.2 && renderers.renderMedia({ opacity: fadeIn * 0.95, zPos: 0.3, size: 9 })}
                    {renderers.renderDataPanel()}
                    {renderers.renderDomain({
                        opacity: fadeIn,
                        scrambleProgress: counterProgress,
                        seed: `${rank}-domain`,
                    })}
                    {fadeIn > 0.3 && renderers.renderVisits({ fillOpacity: fadeIn, counterProgress })}
                    {fadeIn > 0.5 && renderers.renderBadge({ opacity: fadeIn })}
                </>
            )}
        </group>
    );
};

const EffectShatterIn = ({
    rank,
    animFrame,
    fps,
    counterProgress,
    renderers,
    theme,
}: CardRevealEffectProps) => {
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
    ] as const;

    return (
        <>
            {assemble < 0.9 &&
                shardPositions.map((position, i) => (
                    <mesh
                        key={i}
                        position={[position[0], position[1], position[2]]}
                        rotation={[rotZ * (i + 1) * 0.3, rotZ * 0.5, rotZ * (i + 1) * 0.2]}
                    >
                        <boxGeometry args={[3 + i, 2 + i * 0.5, 0.3]} />
                        <meshStandardMaterial
                            color={i % 2 === 0 ? theme.shellColor : theme.accentColor}
                            transparent
                            opacity={(1 - assemble) * 0.6}
                        />
                    </mesh>
                ))}
            <group scale={assemble}>
                {renderers.renderScreenBox({ opacity: assemble })}
                {renderers.renderRankText({ text: `#${rank}`, opacity: assemble })}
                {assemble > 0.6 && renderers.renderMedia({ opacity: assemble * 0.95, zPos: 0.3, size: 9 })}
                {renderers.renderDataPanel({ opacity: assemble })}
                {renderers.renderDomain({
                    opacity: assemble,
                    scrambleProgress: counterProgress,
                    seed: `${rank}-domain`,
                })}
                {assemble > 0.7 && renderers.renderVisits({ fillOpacity: assemble, counterProgress })}
                {assemble > 0.8 && renderers.renderBadge({ opacity: assemble })}
            </group>
        </>
    );
};

const EffectPulseScan = ({
    rank,
    animFrame,
    counterProgress,
    renderers,
    layout,
    theme,
}: CardRevealEffectProps) => {
    const scanProgress = interpolate(animFrame, [0, 70], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });
    const scanY = interpolate(scanProgress, [0, 1], [-15, 18]);
    const pulseOpacity = interpolate(animFrame, [60, 75], [0.9, 0], { extrapolateRight: "clamp" });
    const badgeShow = scanProgress > 0.15;
    const dataShow = scanProgress > 0.35;
    const visitsShow = scanProgress > 0.5;
    const screenShow = scanProgress > 0.65;
    const mediaShow = scanProgress > 0.75;
    const rankShow = scanProgress > 0.85;

    return (
        <>
            {scanProgress < 1 && (
                <mesh position={[0, scanY, 0.5]}>
                    <boxGeometry args={[layout.screenWidth + 6, 0.6, 1.5]} />
                    <meshBasicMaterial color={theme.accentColor} transparent opacity={pulseOpacity} />
                </mesh>
            )}
            {scanProgress < 1 && (
                <mesh position={[0, scanY - 3, 0.4]}>
                    <boxGeometry args={[layout.screenWidth + 4, 5, 0.5]} />
                    <meshBasicMaterial color={theme.accentColor} transparent opacity={pulseOpacity * 0.15} />
                </mesh>
            )}
            {badgeShow && renderers.renderBadge({ opacity: scanProgress })}
            {dataShow && (
                <>
                    {renderers.renderDataPanel({ opacity: scanProgress })}
                    {renderers.renderDomain({
                        opacity: scanProgress,
                        scrambleProgress: counterProgress,
                        seed: `${rank}-domain`,
                    })}
                </>
            )}
            {visitsShow && renderers.renderVisits({ fillOpacity: scanProgress, counterProgress })}
            {screenShow && renderers.renderScreenBox({ opacity: scanProgress })}
            {mediaShow && renderers.renderMedia({ opacity: scanProgress * 0.95, zPos: 0.3, size: 9 })}
            {rankShow && renderers.renderRankText({ text: `#${rank}`, opacity: scanProgress })}
        </>
    );
};

const EffectZoomTunnel = ({
    rank,
    animFrame,
    fps,
    counterProgress,
    renderers,
    theme,
}: CardRevealEffectProps) => {
    const zoom = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 14, mass: 2.0 } });
    const zPos = interpolate(zoom, [0, 1], [-200, 0]);
    const scale = interpolate(zoom, [0, 1], [0.05, 1]);
    const opacity = interpolate(zoom, [0, 0.3, 1], [0, 0.5, 1]);
    const detailOpacity = interpolate(animFrame, [35, 55], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });

    return (
        <>
            {zoom < 0.8 &&
                Array.from({ length: 4 }).map((_, i) => {
                    const lineX = -4 + i * 2.5;
                    const lineLength = (1 - zoom) * 80;

                    return (
                        <mesh key={i} position={[lineX, 3, zPos - lineLength / 2]}>
                            <boxGeometry args={[0.15, 0.15, lineLength]} />
                            <meshBasicMaterial color={theme.accentColor} transparent opacity={(1 - zoom) * 0.4} />
                        </mesh>
                    );
                })}
            <group position={[0, 0, zPos]} scale={scale}>
                {renderers.renderScreenBox({ opacity })}
                {detailOpacity > 0.1 && renderers.renderRankText({ text: `#${rank}`, opacity: detailOpacity })}
                {detailOpacity > 0.2 && renderers.renderMedia({ opacity: detailOpacity * 0.95, zPos: 0.3, size: 9 })}
                {renderers.renderDataPanel({ opacity })}
                {detailOpacity > 0.3 &&
                    renderers.renderDomain({
                        opacity: detailOpacity,
                        scrambleProgress: counterProgress,
                        seed: `${rank}-domain`,
                    })}
                {detailOpacity > 0.5 && renderers.renderVisits({ fillOpacity: detailOpacity, counterProgress })}
                {detailOpacity > 0.7 && renderers.renderBadge({ opacity: detailOpacity })}
            </group>
        </>
    );
};

const EffectSwingDoor = ({
    rank,
    animFrame,
    fps,
    counterProgress,
    renderers,
    layout,
}: CardRevealEffectProps) => {
    const swing = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 13, mass: 1.5 } });
    const rotationY = (1 - swing) * (-Math.PI / 2);
    const contentFade = interpolate(animFrame, [25, 50], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });

    return (
        <group position={[-(layout.screenWidth / 2 + 0.5), 0, 0]}>
            <group position={[layout.screenWidth / 2 + 0.5, 0, 0]} rotation={[0, rotationY, 0]}>
                {renderers.renderScreenBox()}
                {renderers.renderDataPanel()}
                {contentFade > 0.1 && renderers.renderRankText({ text: `#${rank}`, opacity: contentFade })}
                {contentFade > 0.2 && renderers.renderMedia({ opacity: contentFade * 0.95, zPos: 0.3, size: 9 })}
                {contentFade > 0.3 &&
                    renderers.renderDomain({
                        opacity: contentFade,
                        scrambleProgress: counterProgress,
                        seed: `${rank}-domain`,
                    })}
                {contentFade > 0.5 && renderers.renderVisits({ fillOpacity: contentFade, counterProgress })}
                {contentFade > 0.7 && renderers.renderBadge({ opacity: contentFade })}
            </group>
        </group>
    );
};

const EffectHologramFlicker = ({
    rank,
    animFrame,
    fps,
    counterProgress,
    renderers,
    theme,
}: CardRevealEffectProps) => {
    const lockIn = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 30)), config: { damping: 20 } });
    const flickerPhase = animFrame < 30;
    const isVisible = flickerPhase ? Math.sin(animFrame * 4.5) > -0.3 || animFrame > 20 : true;
    const flickerOpacity = flickerPhase
        ? interpolate(Math.sin(animFrame * 6), [-1, 1], [0.2, 0.8])
        : lockIn;
    const hueShift = flickerPhase ? Math.sin(animFrame * 3) * 0.3 : 0;
    const yJitter = flickerPhase ? Math.sin(animFrame * 8.7) * (1 - animFrame / 30) * 2 : 0;

    if (!isVisible) {
        return null;
    }

    return (
        <group position={[0, yJitter, 0]}>
            {flickerPhase && (
                <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[7, 8, 32]} />
                    <meshBasicMaterial color={theme.accentColor} transparent opacity={flickerOpacity * 0.3} />
                </mesh>
            )}
            {flickerPhase && (
                <mesh position={[(animFrame % 14) - 7, 0, 0.4]}>
                    <boxGeometry args={[0.2, 30, 0.1]} />
                    <meshBasicMaterial color={theme.accentColor} transparent opacity={0.4} />
                </mesh>
            )}
            {renderers.renderScreenBox({ opacity: flickerOpacity })}
            {renderers.renderRankText({ text: `#${rank}`, opacity: flickerOpacity })}
            {flickerOpacity > 0.4 &&
                renderers.renderMedia({ opacity: flickerOpacity * 0.95, zPos: 0.3 + hueShift, size: 9 })}
            {renderers.renderDataPanel({ opacity: flickerOpacity })}
            {renderers.renderDomain({
                opacity: flickerOpacity,
                scrambleProgress: counterProgress,
                seed: `${rank}-domain`,
            })}
            {flickerOpacity > 0.5 &&
                renderers.renderVisits({
                    fillOpacity: flickerOpacity,
                    counterProgress,
                })}
            {flickerOpacity > 0.6 && renderers.renderBadge({ opacity: flickerOpacity })}
        </group>
    );
};

export const CARD_REVEAL_EFFECTS: CardRevealEffectComponent[] = [
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

export const getCardRevealEffectIdForIndex = (index: number): CardRevealEffectId => {
    const safeIndex = ((index % CARD_REVEAL_EFFECT_IDS.length) + CARD_REVEAL_EFFECT_IDS.length) % CARD_REVEAL_EFFECT_IDS.length;
    return CARD_REVEAL_EFFECT_IDS[safeIndex];
};

export const getCardRevealEffectByIndex = (index: number) => {
    const safeIndex = ((index % CARD_REVEAL_EFFECTS.length) + CARD_REVEAL_EFFECTS.length) % CARD_REVEAL_EFFECTS.length;
    return CARD_REVEAL_EFFECTS[safeIndex];
};
