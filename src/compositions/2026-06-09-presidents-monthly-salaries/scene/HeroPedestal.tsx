import { memo, useMemo } from "react";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import * as THREE from "three";
import type { Texture } from "three";

import {
  getCardRevealEffectByIndex,
  type CardRevealLayout,
  type CardRevealRenderers,
  type CardRevealTheme,
} from "../../../lib/ranking-corridor/presentation/card-reveal-effects";
import { type LeaderSalaryEntry } from "../data/types";
import { getActivatedPresentationProgress } from "../scene/camera-presentation";
import { getPedestalPresentationActivationFrame } from "../scene/pedestal-presentation-activation";
import {
  sequenceCompleteFrame,
  type SteleRenderMode,
} from "../scene/scene-logic";
import {
  DATA_PANEL_HEIGHT,
  DATA_PANEL_POS_Y,
  MEDIA_FRAME_HEIGHT,
  MEDIA_FRAME_INSET,
  MEDIA_FRAME_MAX_HEIGHT,
  MEDIA_FRAME_MAX_WIDTH,
  MEDIA_FRAME_MIN_HEIGHT,
  MEDIA_FRAME_MIN_WIDTH,
  MEDIA_MAX_RANK_Y,
  MEDIA_RANK_GAP,
  MEDIA_REGION_BOTTOM_Y,
  RANK_TEXT_ASCENT,
  RANK_Y,
  SCREEN_WIDTH,
  STELE_DASHBOARD_FLOAT_AMPLITUDE,
  STELE_DASHBOARD_PRESENCE_FADE_FRAMES,
  STELE_DASHBOARD_REVEAL_FRAMES,
  TYPE_BADGE_Y,
  getSteleDashboardWorldMetrics,
} from "../components/stele-dashboard-layout";
import {
  formatDisplayName,
  getCardTextLayout,
  type CardTextLayout,
} from "../components/card-text-layout";

/* ---------- helpers ---------- */
const HERO_IMAGE_Z = -0.18;
const MEDIA_FRAME_PADDING = MEDIA_FRAME_INSET * 2;
const MEDIA_IMAGE_SCALE = 1.4;
const MEDIA_IMAGE_BOTTOM_GAP = 0.35;
const MEDIA_IMAGE_TOP_GAP = 1.2;

export const formatSalary = (val: number) => {
  return `$${Math.round(val).toLocaleString("en-US")}`;
};

const rollCounterValue = (target: number, progress: number) => {
  return formatSalary(Math.floor(target * progress));
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const assembleScramble = (text: string, progress: number, seed: string) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const revealedLength = Math.floor(text.length * progress);

  return text
    .split("")
    .map((char, index) => {
      if (char === " " || char === "\n" || char === ".") {
        return char;
      }

      if (index < revealedLength) {
        return char;
      }

      const charIndex =
        (seed.charCodeAt(index % seed.length) + index) % chars.length;
      return chars[charIndex];
    })
    .join("");
};

type MediaLayout = {
  frameWidth: number;
  frameHeight: number;
  frameCenterY: number;
  frameTopY: number;
  frameBottomY: number;
  imageWidth: number;
  imageHeight: number;
  imageY: number;
  rankY: number;
  cardTopLocalY: number;
  cardBottomLocalY: number;
  cardCenterLocalY: number;
};

const getTextureAspect = (texture: Texture) => {
  const image = texture.image as
    | { width?: number; height?: number }
    | undefined;
  if (!image?.width || !image?.height) {
    return 1;
  }

  return image.width / image.height;
};

const preparePortraitTexture = (texture: Texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.premultiplyAlpha = false;
  texture.needsUpdate = true;
  return texture;
};

const getMediaLayout = (aspectRatio: number): MediaLayout => {
  const safeAspectRatio =
    Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
  const preferredWidth = clamp(
    MEDIA_FRAME_HEIGHT * safeAspectRatio + 1.6,
    MEDIA_FRAME_MIN_WIDTH,
    MEDIA_FRAME_MAX_WIDTH,
  );
  const preferredHeight = clamp(
    preferredWidth / safeAspectRatio + MEDIA_FRAME_PADDING,
    MEDIA_FRAME_MIN_HEIGHT,
    MEDIA_FRAME_MAX_HEIGHT,
  );
  const frameBottomY = MEDIA_REGION_BOTTOM_Y;
  const maxFrameHeight = MEDIA_MAX_RANK_Y - MEDIA_RANK_GAP - frameBottomY;
  const maxImageHeight = maxFrameHeight - MEDIA_FRAME_PADDING;
  const maxImageWidth = MEDIA_FRAME_MAX_WIDTH - MEDIA_FRAME_PADDING;
  const innerWidth = Math.max(4, preferredWidth - MEDIA_FRAME_PADDING);
  const innerHeight = Math.max(
    4,
    Math.min(preferredHeight, maxFrameHeight) - MEDIA_FRAME_PADDING,
  );
  const fitByWidth = innerWidth / safeAspectRatio;
  const baseImageHeight = Math.min(innerHeight, fitByWidth, maxImageHeight);
  const requestedImageHeight = baseImageHeight * MEDIA_IMAGE_SCALE;
  let imageHeight = Math.min(requestedImageHeight, maxImageHeight);
  let imageWidth = imageHeight * safeAspectRatio;

  if (imageWidth > maxImageWidth) {
    imageWidth = maxImageWidth;
    imageHeight = imageWidth / safeAspectRatio;
  }
  const frameWidth = clamp(
    imageWidth + MEDIA_FRAME_PADDING,
    MEDIA_FRAME_MIN_WIDTH,
    MEDIA_FRAME_MAX_WIDTH,
  );
  const frameHeight = clamp(
    imageHeight + MEDIA_FRAME_PADDING,
    MEDIA_FRAME_MIN_HEIGHT,
    maxFrameHeight,
  );
  const frameTopY = frameBottomY + frameHeight;
  const frameCenterY = frameBottomY + frameHeight / 2;
  const rankY = frameTopY + MEDIA_RANK_GAP;
  const imageBottomY = frameBottomY + MEDIA_IMAGE_BOTTOM_GAP;
  const imageTopY = imageBottomY + imageHeight;
  const imageOverflow = Math.max(0, imageTopY - (rankY - MEDIA_IMAGE_TOP_GAP));
  const imageY = imageBottomY + imageHeight / 2 - imageOverflow / 2;
  const cardTopLocalY = Math.max(frameTopY, rankY + RANK_TEXT_ASCENT);
  const cardBottomLocalY = Math.min(
    DATA_PANEL_POS_Y - DATA_PANEL_HEIGHT / 2,
    TYPE_BADGE_Y - 2.3 / 2,
  );
  const cardCenterLocalY = (cardTopLocalY + cardBottomLocalY) / 2;

  return {
    frameWidth,
    frameHeight,
    frameCenterY,
    frameTopY,
    frameBottomY,
    imageWidth,
    imageHeight,
    imageY,
    rankY,
    cardTopLocalY,
    cardBottomLocalY,
    cardCenterLocalY,
  };
};

/* ---------- reusable sub-components ---------- */

const SalaryMetric = ({
  value,
  fillOpacity,
  counterProgress,
  numericValue,
  textLayout,
}: {
  value: string;
  fillOpacity?: number;
  counterProgress?: number;
  numericValue: number;
  textLayout: CardTextLayout;
}) => {
  const displayValue =
    counterProgress !== undefined && counterProgress < 1
      ? rollCounterValue(numericValue, counterProgress)
      : value;
  return (
    <group position={[0, textLayout.salaryY, 0.3]}>
      <Text
        color="#F59E0B"
        fontSize={textLayout.salaryFontSize}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        fillOpacity={fillOpacity}
        material-toneMapped={false}
      >
        {displayValue}
      </Text>
      <Text
        position={[0, textLayout.salarySuffixY - textLayout.salaryY, 0]}
        color="#FDE68A"
        fontSize={textLayout.salarySuffixFontSize}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        fillOpacity={fillOpacity}
        material-toneMapped={false}
      >
        USD / month
      </Text>
    </group>
  );
};

const GlassPanelBox = ({
  frameWidth,
  frameHeight,
  frameCenterY,
  opacity = 1,
}: {
  frameWidth: number;
  frameHeight: number;
  frameCenterY: number;
  opacity?: number;
}) => (
  <group position={[0, 0, 0.1]}>
    {/* Semi-transparent glass background */}
    <mesh position={[0, frameCenterY, 0]}>
      <planeGeometry args={[frameWidth, frameHeight]} />
      <meshStandardMaterial
        color="#01030a"
        transparent={true}
        opacity={opacity * 0.75}
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>

    {/* Holographic borders (AR effect) */}
    <mesh position={[0, frameCenterY + frameHeight / 2, 0.1]}>
      <boxGeometry args={[frameWidth, 0.05, 0.05]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={opacity} />
    </mesh>
    <mesh position={[0, frameCenterY - frameHeight / 2, 0.1]}>
      <boxGeometry args={[frameWidth, 0.05, 0.05]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={opacity} />
    </mesh>
    <mesh position={[-frameWidth / 2, frameCenterY, 0.1]}>
      <boxGeometry args={[0.05, frameHeight, 0.05]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={opacity} />
    </mesh>
    <mesh position={[frameWidth / 2, frameCenterY, 0.1]}>
      <boxGeometry args={[0.05, frameHeight, 0.05]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={opacity} />
    </mesh>
  </group>
);

const HolographicDataPanel = ({ opacity = 1 }: { opacity?: number }) => (
  <mesh position={[0, DATA_PANEL_POS_Y, 0.15]}>
    <planeGeometry args={[SCREEN_WIDTH, DATA_PANEL_HEIGHT]} />
    <meshStandardMaterial
      color="#01030a"
      transparent
      opacity={opacity * 0.95}
      roughness={0.9}
      metalness={0.05}
      depthWrite={false}
    />
  </mesh>
);

const TypeBadge = ({
  label,
  width,
  textLayout,
  opacity = 1,
}: {
  label: string;
  width: number;
  textLayout: CardTextLayout;
  opacity?: number;
}) => {
  return (
    <group position={[0, textLayout.badgeY, 0.3]}>
      <RoundedBox args={[width, textLayout.badgeHeight, 0.2]} radius={0.22}>
        <meshStandardMaterial
          color="#10B981"
          transparent={opacity < 1}
          opacity={opacity}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.12]}
        color="#ffffff"
        fontSize={textLayout.badgeFontSize}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        fillOpacity={opacity}
      >
        {label}
      </Text>
    </group>
  );
};

const RankText = ({
  text,
  opacity = 1,
  posY = RANK_Y,
}: {
  text: string;
  opacity?: number;
  posY?: number;
}) => (
  <Text
    position={[0, posY, 0.3]}
    color="#F8FAFC"
    fontSize={3.8}
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

const NameText = ({
  text,
  textLayout,
  opacity = 1,
  color = "#F8FAFC",
  scrambleProgress,
  seed = "dom",
}: {
  text: string;
  textLayout: CardTextLayout;
  opacity?: number;
  color?: string;
  scrambleProgress?: number;
  seed?: string;
}) => {
  const formattedName = formatDisplayName(text);
  const displayText =
    scrambleProgress !== undefined && scrambleProgress < 1
      ? assembleScramble(formattedName.text, scrambleProgress, seed)
      : formattedName.text;
  return (
    <Text
      position={[0, textLayout.nameY, 0.3]}
      color={color}
      fontSize={textLayout.nameFontSize}
      maxWidth={SCREEN_WIDTH - 1.0}
      lineHeight={textLayout.nameLineHeight}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
      fontWeight="bold"
      fillOpacity={opacity}
      outlineWidth={0.03}
      outlineColor="#020617"
    >
      {displayText}
    </Text>
  );
};

const HeroImage = ({
  texture,
  yPos,
  zPos,
  opacity,
  width,
  height,
}: {
  texture: Texture;
  yPos: number;
  zPos: number;
  opacity: number;
  width: number;
  height: number;
}) => {
  return (
    <mesh position={[0, yPos, zPos]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        color="#ffffff"
        depthWrite={false}
        alphaTest={0.02}
        toneMapped={false}
      />
    </mesh>
  );
};

/* ---------- full static card ---------- */

const FullCard = memo(
  ({
    item,
    rank,
    textLayout,
    typeLabel,
    typeBadgeWidth,
    texture,
    mediaLayout,
    opacity = 1,
  }: {
    item: LeaderSalaryEntry;
    rank: number;
    textLayout: CardTextLayout;
    typeLabel: string;
    typeBadgeWidth: number;
    texture: Texture;
    mediaLayout: MediaLayout;
    opacity?: number;
  }) => (
    <group position={[0, 0, 0.5]}>
      <GlassPanelBox
        frameWidth={mediaLayout.frameWidth}
        frameHeight={mediaLayout.frameHeight}
        frameCenterY={mediaLayout.frameCenterY}
        opacity={opacity}
      />
      <RankText text={`#${rank}`} opacity={opacity} posY={mediaLayout.rankY} />
      <HeroImage
        texture={texture}
        yPos={mediaLayout.imageY}
        zPos={HERO_IMAGE_Z}
        opacity={opacity}
        width={mediaLayout.imageWidth}
        height={mediaLayout.imageHeight}
      />
      <HolographicDataPanel opacity={opacity} />
      <NameText
        text={item.display_name}
        textLayout={textLayout}
        opacity={opacity}
        color="#F8FAFC"
      />
      <SalaryMetric
        value={item.salary_usd_monthly_display}
        numericValue={item.salary_usd_monthly_equivalent}
        fillOpacity={opacity}
        textLayout={textLayout}
      />
      <TypeBadge
        label={typeLabel}
        width={typeBadgeWidth}
        textLayout={textLayout}
        opacity={opacity}
      />
    </group>
  ),
);
FullCard.displayName = "FullCard";

export const HeroPedestal = ({
  item,
  dashboardBaseY,
  worldX,
  worldZ,
  rank,
  index,
  renderMode,
}: {
  item: LeaderSalaryEntry;
  dashboardBaseY: number;
  worldX: number;
  worldZ: number;
  rank: number;
  index: number;
  renderMode: SteleRenderMode;
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const rawTexture = useTexture(
    staticFile(
      `/ranking-corridor/2026-06-09-presidents-monthly-salaries/images/${item.image_file}`,
    ),
  );
  const texture = useMemo(
    () => preparePortraitTexture(rawTexture),
    [rawTexture],
  );
  const mediaLayout = useMemo(
    () => getMediaLayout(getTextureAspect(texture)),
    [texture],
  );
  const isCinematic = frame > sequenceCompleteFrame;
  const typeLabel = `${item.country_en} - ${item.iso3}`.trim();
  const typeBadgeWidth = Math.min(
    SCREEN_WIDTH,
    Math.max(6, typeLabel.length * 0.9 + 2.0),
  );
  const textLayout = useMemo(
    () =>
      getCardTextLayout({
        name: item.display_name,
        salary: item.salary_usd_monthly_display,
        typeLabel,
        relHeight: item.relHeight,
      }),
    [
      item.display_name,
      item.relHeight,
      item.salary_usd_monthly_display,
      typeLabel,
    ],
  );
  const floatY =
    Math.sin(frame * 0.05 + dashboardBaseY) * STELE_DASHBOARD_FLOAT_AMPLITUDE;
  const cardRevealLayout: CardRevealLayout = {
    screenWidth: mediaLayout.frameWidth,
    screenHeight: mediaLayout.frameHeight,
    dataPanelHeight: DATA_PANEL_HEIGHT,
    rankY: mediaLayout.rankY,
  };
  const cardRevealTheme: CardRevealTheme = {
    accentColor: "#38BDF8",
    shellColor: "#1E293B",
  };
  const presentationActivationFrame = useMemo(() => {
    return getPedestalPresentationActivationFrame({
      index,
      width,
      height,
    });
  }, [height, index, width]);
  const presentationProgress = isCinematic
    ? 1
    : getActivatedPresentationProgress({
        frame,
        activationFrame: presentationActivationFrame,
        revealFrames: STELE_DASHBOARD_PRESENCE_FADE_FRAMES,
      });
  const animFrame =
    presentationActivationFrame === null
      ? 0
      : Math.max(
          0,
          Math.min(
            STELE_DASHBOARD_REVEAL_FRAMES,
            frame - presentationActivationFrame,
          ),
        );
  const liveDashboardMetrics = getSteleDashboardWorldMetrics({
    worldX,
    worldZ,
    dashboardBaseY,
    floatY,
    cardTopLocalY: mediaLayout.cardTopLocalY,
    cardBottomLocalY: mediaLayout.cardBottomLocalY,
  });
  const cardRevealRenderers: CardRevealRenderers = {
    renderScreenBox: ({ opacity } = {}) => (
      <GlassPanelBox
        frameWidth={mediaLayout.frameWidth}
        frameHeight={mediaLayout.frameHeight}
        frameCenterY={mediaLayout.frameCenterY}
        opacity={opacity}
      />
    ),
    renderDataPanel: ({ opacity } = {}) => (
      <HolographicDataPanel opacity={opacity} />
    ),
    renderRankText: () => null,
    renderMedia: ({ opacity = 1, zPos = HERO_IMAGE_Z } = {}) => (
      <HeroImage
        texture={texture}
        yPos={mediaLayout.imageY}
        zPos={zPos}
        opacity={opacity}
        width={mediaLayout.imageWidth}
        height={mediaLayout.imageHeight}
      />
    ),
    renderDomain: ({ text, opacity, color, scrambleProgress, seed } = {}) => (
      <NameText
        text={text ?? item.display_name}
        textLayout={textLayout}
        opacity={opacity}
        color={color}
        scrambleProgress={scrambleProgress}
        seed={seed}
      />
    ),
    renderVisits: ({
      text,
      fillOpacity,
      counterProgress: visitsCounterProgress,
    } = {}) => (
      <SalaryMetric
        value={text ?? item.salary_usd_monthly_display}
        numericValue={item.salary_usd_monthly_equivalent}
        fillOpacity={fillOpacity}
        counterProgress={text ? undefined : visitsCounterProgress}
        textLayout={textLayout}
      />
    ),
    renderBadge: ({ opacity } = {}) => (
      <TypeBadge
        label={typeLabel}
        width={typeBadgeWidth}
        textLayout={textLayout}
        opacity={opacity}
      />
    ),
  };

  if (presentationProgress <= 0.001 && !isCinematic) return null;

  if (isCinematic || renderMode === "standby") {
    return (
      <group position={[0, liveDashboardMetrics.rootWorld[1], 0]}>
        <FullCard
          item={item}
          rank={rank}
          textLayout={textLayout}
          typeLabel={typeLabel}
          typeBadgeWidth={typeBadgeWidth}
          texture={texture}
          mediaLayout={mediaLayout}
          opacity={presentationProgress}
        />
      </group>
    );
  }

  const counterProgress = interpolate(animFrame, [15, 105], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const rankRevealOpacity = interpolate(
    animFrame,
    [10, 34],
    [0, presentationProgress],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const Effect = getCardRevealEffectByIndex(index);

  return (
    <group position={[0, liveDashboardMetrics.rootWorld[1], 0]}>
      <Effect
        rank={rank}
        animFrame={animFrame}
        fps={fps}
        index={index}
        counterProgress={counterProgress}
        visitsText={item.salary_usd_monthly_display}
        renderers={cardRevealRenderers}
        layout={cardRevealLayout}
        theme={cardRevealTheme}
      />
      <RankText
        text={`#${rank}`}
        opacity={rankRevealOpacity}
        posY={mediaLayout.rankY}
      />
    </group>
  );
};
