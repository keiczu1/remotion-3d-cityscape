import { memo, useMemo } from "react";
import { RoundedBox, Text } from "@react-three/drei";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import {
    getCardRevealEffectByIndex,
    type CardRevealLayout,
    type CardRevealRenderers,
    type CardRevealTheme,
} from "../../../lib/ranking-corridor/presentation/card-reveal-effects";
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
    const cardRevealLayout: CardRevealLayout = {
        screenWidth: SCREEN_WIDTH,
        screenHeight: SCREEN_HEIGHT,
        dataPanelHeight: DATA_PANEL_HEIGHT,
        rankY: RANK_Y,
    };
    const cardRevealTheme: CardRevealTheme = {
        accentColor: "#00E5FF",
        shellColor: "#1E293B",
    };
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
    const cardRevealRenderers: CardRevealRenderers = {
        renderScreenBox: ({ opacity } = {}) => <ScreenBox opacity={opacity} />,
        renderDataPanel: ({ opacity } = {}) => <DataPanel opacity={opacity} />,
        renderRankText: ({ text, opacity, posY } = {}) => (
            <RankText text={text ?? `#${rank}`} opacity={opacity} posY={posY ?? RANK_Y} />
        ),
        renderMedia: ({ opacity = 1, zPos = 0.3, size = 9 } = {}) => (
            <Favicon domain={item.domain} yPos={3} zPos={zPos} opacity={opacity} size={size} />
        ),
        renderDomain: ({ text, opacity, color, scrambleProgress, seed } = {}) => (
            <DomainText
                text={text ?? item.domain}
                fontSize={domainFontSize}
                opacity={opacity}
                color={color}
                scrambleProgress={scrambleProgress}
                seed={seed}
            />
        ),
        renderVisits: ({ text, fillOpacity, counterProgress: visitsCounterProgress } = {}) => (
            <VisitsMetric
                value={text ?? formattedVisits}
                fillOpacity={fillOpacity}
                counterProgress={text ? undefined : visitsCounterProgress}
            />
        ),
        renderBadge: ({ opacity } = {}) => (
            <TypeBadge label={typeLabel} width={typeBadgeWidth} opacity={opacity} />
        ),
    };

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
    const Effect = getCardRevealEffectByIndex(index);

    return (
        <group position={[0, liveDashboardMetrics.rootWorld[1], 0]}>
            <Effect
                rank={rank}
                animFrame={animFrame}
                fps={fps}
                index={index}
                counterProgress={counterProgress}
                visitsText={formattedVisits}
                renderers={cardRevealRenderers}
                layout={cardRevealLayout}
                theme={cardRevealTheme}
            />
        </group>
    );
};
