import { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

import {
    BIO_STELE_SHELL_BOTTOM_CENTER_X_PX,
    BIO_STELE_SHELL_WIDTH_PX,
    BIO_STELE_SHELL_BOTTOM_CENTER_Y_PX,
    BIO_STELE_SHELL_HEIGHT_PX,
    getFocusedBiographyShellWorldHeight,
    getBiographySteleWorldMetrics,
} from "./biography-stele-layout";
import {
    PORTRAIT_BIOGRAPHY_STELE_BASE_WIDTH,
    PORTRAIT_BIOGRAPHY_STELE_BASE_HEIGHT,
    PortraitBiographySteleHero,
} from "../../../lib/ranking-corridor/hero/portrait-biography-stele";
import {
    getResolvedCameraPose,
    getPresentationState,
} from "../scene/camera-presentation";
import {
    STELE_ROW_Z,
    type SteleRenderMode,
    STELE_WIDTH,
    X_SPACING,
    getFocusedSteleIndex,
    getSteleHeight,
    milestones,
    reversedData,
} from "../scene/scene-logic";
import { getFlagCode, getPhotoSrc } from "../model/data";
import { getEntranceEffect, getSidebarExitStyle } from "../entrance-effects";

const PEDESTAL_TO_SHELL_WIDTH_RATIO = 1.36;
const projectionCamera = new THREE.PerspectiveCamera(45, 16 / 9, 1, 7000);
const projectionVector = new THREE.Vector3();
const projectionViewVector = new THREE.Vector3();
const projectionUp = new THREE.Vector3(0, 1, 0);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
const smoothstep = (edge0: number, edge1: number, value: number) => {
    if (edge0 === edge1) {
        return value >= edge1 ? 1 : 0;
    }

    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
};

const projectWorldPoint = ({
    point,
    frame,
    width,
    height,
}: {
    point: readonly [number, number, number];
    frame: number;
    width: number;
    height: number;
}) => {
    const pose = getResolvedCameraPose(frame);

    projectionCamera.fov = 45;
    projectionCamera.near = 1;
    projectionCamera.far = 7000;
    projectionCamera.aspect = width / height;
    projectionCamera.position.set(pose.camX, pose.camY, pose.camZ);
    projectionCamera.up.copy(projectionUp);
    projectionCamera.lookAt(pose.lookX, pose.lookY, pose.lookZ);
    projectionCamera.updateProjectionMatrix();
    projectionCamera.updateMatrixWorld(true);

    projectionVector.set(point[0], point[1], point[2]);
    projectionViewVector.copy(projectionVector).applyMatrix4(projectionCamera.matrixWorldInverse);
    projectionVector.project(projectionCamera);

    return {
        x: (projectionVector.x + 1) / 2,
        y: (1 - projectionVector.y) / 2,
        isInFront: projectionViewVector.z < -1,
    };
};

const getOverlayScale = ({
    index,
    pedestalHeight,
    presentationState,
    frame,
    width,
    height,
}: {
    index: number;
    pedestalHeight: number;
    presentationState: {
        cardPixelHeight: number;
    };
    frame: number;
    width: number;
    height: number;
}) => {
    const shellPixelHeight = presentationState.cardPixelHeight;
    const heightBasedScale = shellPixelHeight / BIO_STELE_SHELL_HEIGHT_PX;
    const pedestalTopY = pedestalHeight + 0.3;
    const pedestalHalfWidth = (STELE_WIDTH + 0.4) / 2;
    const pedestalLeft = projectWorldPoint({
        point: [index * X_SPACING - pedestalHalfWidth, pedestalTopY, STELE_ROW_Z],
        frame,
        width,
        height,
    });
    const pedestalRight = projectWorldPoint({
        point: [index * X_SPACING + pedestalHalfWidth, pedestalTopY, STELE_ROW_Z],
        frame,
        width,
        height,
    });
    const pedestalPixelWidth =
        pedestalLeft.isInFront && pedestalRight.isInFront
            ? Math.abs(pedestalRight.x - pedestalLeft.x) * width
            : 0;
    const widthBasedScale =
        pedestalPixelWidth > 0
            ? (pedestalPixelWidth * PEDESTAL_TO_SHELL_WIDTH_RATIO) / BIO_STELE_SHELL_WIDTH_PX
            : heightBasedScale;

    return Math.max(heightBasedScale, widthBasedScale);
};

const OVERLAY_VIEWPORT_MARGIN_X = 0.22;
const OVERLAY_VIEWPORT_MARGIN_Y = 0.18;
const SIDEBAR_VISIBILITY_GATE = 0.45;
const OVERLAY_HISTORY_RADIUS = 4;
const NON_FOCUSED_REVEAL_COMPLETE_GATE = 0.995;

const isOverlayVisibleInViewport = (presentationState: {
    viewport: {
        top: { x: number; y: number; isInFront: boolean };
        bottom: { x: number; y: number; isInFront: boolean };
        center: { x: number; y: number; isInFront: boolean };
    };
}) => {
    const { top, bottom, center } = presentationState.viewport;

    if (!top.isInFront || !bottom.isInFront || !center.isInFront) {
        return false;
    }

    return (
        center.x >= -OVERLAY_VIEWPORT_MARGIN_X &&
        center.x <= 1 + OVERLAY_VIEWPORT_MARGIN_X &&
        bottom.y >= -OVERLAY_VIEWPORT_MARGIN_Y &&
        top.y <= 1 + OVERLAY_VIEWPORT_MARGIN_Y
    );
};

export const getBiographyOverlayStateForIndex = ({
    index,
    frame,
    width,
    height,
}: {
    index: number;
    frame: number;
    width: number;
    height: number;
}) => {
    const item = reversedData[index];
    const milestone = milestones[index];

    if (!item || !milestone) {
        return null;
    }

    const pedestalHeight = getSteleHeight(item.relHeight);
    const shellWorldHeight = getFocusedBiographyShellWorldHeight(pedestalHeight);
    const subject = getBiographySteleWorldMetrics({
        worldX: index * X_SPACING,
        worldZ: STELE_ROW_Z,
        pedestalHeight,
        shellWorldHeight,
    });
    const presentationState = getPresentationState({
        frame,
        subject,
        width,
        height,
    });
    const revealProgress = smoothstep(milestone.arriveFrame - 10, milestone.arriveFrame + 22, frame);
    const overlayProgress = smoothstep(0.04, 0.08, presentationState.gate);

    return {
        index,
        item,
        milestone,
        pedestalHeight,
        shellWorldHeight,
        subject,
        presentationState,
        overlayProgress,
        revealProgress,
    };
};

const getOverlayCandidateIndices = ({
    focusedIndex,
    previousFocusIndex,
    renderModes,
    totalCount,
}: {
    focusedIndex: number;
    previousFocusIndex: number | null;
    renderModes: SteleRenderMode[];
    totalCount: number;
}) => {
    const indices = new Set<number>();
    const rangeStart = Math.max(0, focusedIndex - OVERLAY_HISTORY_RADIUS);
    const rangeEnd = Math.min(totalCount - 1, focusedIndex);

    for (let index = rangeStart; index <= rangeEnd; index += 1) {
        if (index === focusedIndex || renderModes[index] !== "minimal") {
            indices.add(index);
        }
    }

    if (previousFocusIndex !== null && previousFocusIndex >= 0 && previousFocusIndex < totalCount) {
        indices.add(previousFocusIndex);
    }

    return [...indices].sort((a, b) => a - b);
};

export const FocusedBiographyOverlay = ({
    focusedIndex,
    isIntro,
    renderModes,
}: {
    focusedIndex: number;
    isIntro: boolean;
    renderModes: SteleRenderMode[];
}) => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();
    const pinnedSidebarScaleRef = useRef<{ index: number; scale: number } | null>(null);
    const frozenHeroFrameRef = useRef(new Map<number, number>());
    const settledHeroFrameRef = useRef(new Map<number, number>());

    if (isIntro) {
        return null;
    }

    const previousFocusIndex = frame > 0 ? getFocusedSteleIndex(frame - 1) : focusedIndex;
    const candidateIndices = getOverlayCandidateIndices({
        focusedIndex,
        previousFocusIndex,
        renderModes,
        totalCount: reversedData.length,
    });
    const allOverlayStates = candidateIndices
        .map((index) =>
            getBiographyOverlayStateForIndex({
                index,
                frame,
                width,
                height,
            })
        );

    const currentFocusState =
        allOverlayStates.find(
            (state): state is NonNullable<typeof state> => Boolean(state && state.index === focusedIndex)
        ) ?? null;
    const currentFocusVisibleInViewport = currentFocusState
        ? isOverlayVisibleInViewport(currentFocusState.presentationState)
        : false;
    const currentSidebarVisible = (currentFocusState?.overlayProgress ?? 0) >= SIDEBAR_VISIBILITY_GATE;
    const currentOverlayReady = (currentFocusState?.overlayProgress ?? 0) >= 0.32;
    const pinnedPreviousIndex =
        !currentOverlayReady && previousFocusIndex !== focusedIndex ? previousFocusIndex : null;

    const overlayStates = allOverlayStates.filter((state): state is NonNullable<typeof state> => {
            if (!state) {
                return false;
            }

            const isVisibleInViewport = isOverlayVisibleInViewport(state.presentationState);

            if (state.revealProgress <= 0.001) {
                return false;
            }

            if (state.index === focusedIndex) {
                return state.overlayProgress > 0.001 || currentFocusVisibleInViewport;
            }

            if (pinnedPreviousIndex !== null && state.index === pinnedPreviousIndex) {
                return true;
            }

            if (currentSidebarVisible && state.revealProgress < NON_FOCUSED_REVEAL_COMPLETE_GATE) {
                return false;
            }

            return isVisibleInViewport;
        });

    if (overlayStates.length === 0) {
        return null;
    }

    const focusedOverlayState =
        overlayStates.find((state) => state.index === focusedIndex) ?? overlayStates[overlayStates.length - 1];
    const focusedScale = getOverlayScale({
        index: focusedOverlayState.index,
        pedestalHeight: focusedOverlayState.pedestalHeight,
        presentationState: focusedOverlayState.presentationState,
        frame,
        width,
        height,
    });

    frozenHeroFrameRef.current.set(focusedIndex, frame);
    if (currentSidebarVisible) {
        pinnedSidebarScaleRef.current = {
            index: focusedIndex,
            scale: focusedScale,
        };
    }

    const previousOverlayState =
        pinnedPreviousIndex !== null
            ? overlayStates.find((state) => state.index === pinnedPreviousIndex) ??
                allOverlayStates.find(
                    (state): state is NonNullable<typeof state> => Boolean(state && state.index === pinnedPreviousIndex)
                ) ??
                null
            : null;
    const previousScale = previousOverlayState
        ? getOverlayScale({
            index: previousOverlayState.index,
            pedestalHeight: previousOverlayState.pedestalHeight,
            presentationState: previousOverlayState.presentationState,
            frame,
            width,
            height,
        })
        : null;
    const handoffProgress =
        pinnedPreviousIndex !== null && currentFocusState
            ? smoothstep(0.32, 0.72, currentFocusState.overlayProgress)
            : 1;
    const pinnedPreviousScale =
        pinnedPreviousIndex !== null && pinnedSidebarScaleRef.current?.index === pinnedPreviousIndex
            ? pinnedSidebarScaleRef.current.scale
            : null;

    return (
        <AbsoluteFill style={{ pointerEvents: "none", overflow: "visible" }}>
            {overlayStates.map(({ index, item, milestone, pedestalHeight, presentationState, overlayProgress, revealProgress }) => {
                const projectedBottomX = presentationState.viewport.bottom.x * width;
                const projectedBottomY = presentationState.viewport.bottom.y * height;
                const localScale = getOverlayScale({
                    index,
                    pedestalHeight,
                    presentationState,
                    frame,
                    width,
                    height,
                });
                const isCurrentFocus = index === focusedIndex;
                let scale = localScale;

                if (pinnedPreviousIndex !== null && previousScale !== null) {
                    if (index === pinnedPreviousIndex) {
                        scale = previousScale;
                    } else if (index === focusedIndex) {
                        scale = mix(previousScale, focusedScale, handoffProgress);
                    }
                } else if (index === focusedIndex) {
                    scale = focusedScale;
                }

                if (pinnedPreviousScale !== null && index === pinnedPreviousIndex) {
                    scale = pinnedPreviousScale;
                }

                const left = projectedBottomX - BIO_STELE_SHELL_BOTTOM_CENTER_X_PX * scale;
                const top = projectedBottomY - BIO_STELE_SHELL_BOTTOM_CENTER_Y_PX * scale;

                // ── entrance effect ──
                const entranceAnimFrame = Math.max(0, frame - Math.max(0, milestone.arriveFrame - 12));
                const entranceEffect = getEntranceEffect(index, entranceAnimFrame, fps);

                // ── sidebar: keep visible for pinned previous during handoff ──
                const isPinnedPrevious = pinnedPreviousIndex !== null && index === pinnedPreviousIndex;
                const shouldShowInfoSideCard =
                    (isCurrentFocus && overlayProgress >= SIDEBAR_VISIBILITY_GATE) ||
                    (isPinnedPrevious && handoffProgress < 0.85);
                const sidebarExitMultiplier = isPinnedPrevious
                    ? getSidebarExitStyle(handoffProgress, index).opacity
                    : 1;

                const focusVisibleInViewport = isOverlayVisibleInViewport(presentationState);
                const shouldFreezeCurrentHeroFrame =
                    isCurrentFocus &&
                    shouldShowInfoSideCard &&
                    overlayProgress >= 0.995 &&
                    revealProgress >= NON_FOCUSED_REVEAL_COMPLETE_GATE;
                const overlayOpacity = Math.max(
                    !isCurrentFocus || focusVisibleInViewport ? revealProgress : 0,
                    isCurrentFocus ? overlayProgress : 0,
                );
                const visualOpacity = isCurrentFocus ? 1 : overlayOpacity;

                // ── combined entrance opacity (entrance spring × base × sidebar-exit) ──
                const combinedOpacity = visualOpacity * entranceEffect.shell.opacity * sidebarExitMultiplier;

                if (shouldFreezeCurrentHeroFrame && !settledHeroFrameRef.current.has(index)) {
                    settledHeroFrameRef.current.set(index, frame);
                }

                if (isCurrentFocus && !shouldFreezeCurrentHeroFrame) {
                    settledHeroFrameRef.current.delete(index);
                }

                const heroFrame = isCurrentFocus
                    ? settledHeroFrameRef.current.get(index) ?? frame
                    : frozenHeroFrameRef.current.get(index) ?? frame;

                if (combinedOpacity <= 0.001) {
                    return null;
                }

                // ── transform origin anchored to pedestal contact point ──
                const originX = BIO_STELE_SHELL_BOTTOM_CENTER_X_PX * scale;
                const originY = BIO_STELE_SHELL_BOTTOM_CENTER_Y_PX * scale;
                const entranceTransform = entranceEffect.shell.transform !== "none"
                    ? `${entranceEffect.shell.transform} translateZ(0)`
                    : "translateZ(0)";

                return (
                    <div
                        key={item.order}
                        style={{
                            position: "absolute",
                            left,
                            top,
                            width: PORTRAIT_BIOGRAPHY_STELE_BASE_WIDTH * scale,
                            height: PORTRAIT_BIOGRAPHY_STELE_BASE_HEIGHT * scale,
                            opacity: combinedOpacity,
                            transform: entranceTransform,
                            transformOrigin: `${originX}px ${originY}px`,
                            willChange: "transform, opacity",
                            contain: "layout paint style",
                            overflow: "visible",
                            ...(entranceEffect.shell.filter ? { filter: entranceEffect.shell.filter } : {}),
                        }}
                    >
                        <div
                            style={{
                                width: PORTRAIT_BIOGRAPHY_STELE_BASE_WIDTH,
                                height: PORTRAIT_BIOGRAPHY_STELE_BASE_HEIGHT,
                                transform: `scale(${scale})`,
                                transformOrigin: "top left",
                            }}
                        >
                            <PortraitBiographySteleHero
                                photoSrc={getPhotoSrc(item)}
                                flagCode={getFlagCode(item)}
                                order={item.order}
                                name={item.name}
                                lifeYears={item.lifeYears}
                                wealth={item.wealth}
                                wealthOrigin={item.wealthOrigin}
                                country={item.country}
                                moneyFrom={item.moneyFrom}
                                fact={item.fact}
                                pedestalBodyHeight={Math.round(120 + pedestalHeight * 8)}
                                delay={Math.max(0, milestone.arriveFrame - 12)}
                                frame={heroFrame}
                                fps={fps}
                                showPedestal={false}
                                showFlagMast={false}
                                showInfoSideCard={shouldShowInfoSideCard}
                                shellOpacityMultiplier={1}
                                preserveEntranceColors={isCurrentFocus}
                                infoSideCardTextEffect="typewriter"
                                infoSideCardTypewriterFrame={frame}
                            />
                        </div>
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};
