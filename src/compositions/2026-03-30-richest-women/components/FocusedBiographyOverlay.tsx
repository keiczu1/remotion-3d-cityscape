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

const getPinnedSidebarVisibleScale = ({
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
    const milestone = milestones[index];

    if (!milestone) {
        return null;
    }

    const searchStartFrame = Math.max(milestone.arriveFrame, frame - 180);

    for (let checkFrame = frame; checkFrame >= searchStartFrame; checkFrame -= 1) {
        if (getFocusedSteleIndex(checkFrame) !== index) {
            continue;
        }

        const state = getBiographyOverlayStateForIndex({
            index,
            frame: checkFrame,
            width,
            height,
        });

        if (!state || state.overlayProgress < SIDEBAR_VISIBILITY_GATE) {
            continue;
        }

        return getOverlayScale({
            index,
            pedestalHeight: state.pedestalHeight,
            presentationState: state.presentationState,
            frame: checkFrame,
            width,
            height,
        });
    }

    return null;
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

    if (isIntro) {
        return null;
    }

    const allOverlayStates = reversedData
        .map((_, index) =>
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
    const currentOverlayReady = (currentFocusState?.overlayProgress ?? 0) >= 0.32;
    const previousFocusIndex = frame > 0 ? getFocusedSteleIndex(frame - 1) : focusedIndex;
    const pinnedPreviousIndex =
        !currentOverlayReady && previousFocusIndex !== focusedIndex ? previousFocusIndex : null;

    const overlayStates = allOverlayStates.filter((state): state is NonNullable<typeof state> => {
            if (!state) {
                return false;
            }

            if (state.revealProgress <= 0.001) {
                return false;
            }

            if (state.index > focusedIndex) {
                return false;
            }

            if (state.index === focusedIndex) {
                return true;
            }

            if (pinnedPreviousIndex !== null && state.index === pinnedPreviousIndex) {
                return true;
            }

            return (
                renderModes[state.index] !== "minimal" ||
                isOverlayVisibleInViewport(state.presentationState)
            );
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
                const pinnedSidebarScale = getPinnedSidebarVisibleScale({
                    index,
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

                if (pinnedSidebarScale !== null) {
                    if (!isCurrentFocus || overlayProgress < SIDEBAR_VISIBILITY_GATE) {
                        scale = pinnedSidebarScale;
                    }
                }

                const left = projectedBottomX - BIO_STELE_SHELL_BOTTOM_CENTER_X_PX * scale;
                const top = projectedBottomY - BIO_STELE_SHELL_BOTTOM_CENTER_Y_PX * scale;
                const shouldShowInfoSideCard = isCurrentFocus && overlayProgress >= SIDEBAR_VISIBILITY_GATE;
                const opacity = Math.max(revealProgress, isCurrentFocus ? overlayProgress : 0);

                if (opacity <= 0.001) {
                    return null;
                }

                return (
                    <div
                        key={item.order}
                        style={{
                            position: "absolute",
                            left,
                            top,
                            width: PORTRAIT_BIOGRAPHY_STELE_BASE_WIDTH * scale,
                            height: PORTRAIT_BIOGRAPHY_STELE_BASE_HEIGHT * scale,
                            opacity,
                            transform: `translateZ(0)`,
                            overflow: "visible",
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
                                moneyFrom={item.sourceDetail || item.moneyFrom}
                                fact={item.fact}
                                pedestalBodyHeight={Math.round(120 + pedestalHeight * 8)}
                                delay={Math.max(0, milestone.arriveFrame - 12)}
                                frame={frame}
                                fps={fps}
                                showPedestal={false}
                                showFlagMast={false}
                                showInfoSideCard={shouldShowInfoSideCard}
                            />
                        </div>
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};
