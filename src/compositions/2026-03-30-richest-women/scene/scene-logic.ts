import { interpolate } from "remotion";
import * as THREE from "three";
import { buildSharedScenePresetTimingPlan } from "../../../lib/ranking-corridor/scene-presets/shared-timing";

import {
    BIO_STELE_BOTTOM_LOCAL_Y,
    BIO_STELE_CENTER_LOCAL_Y,
    BIO_STELE_FOCUS_SHIFT_X,
    BIO_STELE_SUBJECT_CENTER_FROM_BOTTOM,
    BIO_STELE_TOP_LOCAL_Y,
} from "../components/biography-stele-layout";
import { data } from "../model/data";

export const reversedData = [...data].reverse();

export const INTRO_REVEAL_FRAMES = 45;
export const INTRO_HOLD_FRAMES = 40;
export const INTRO_PUSH_IN_FRAMES = 90;
export const INTRO_DURATION_IN_FRAMES = INTRO_REVEAL_FRAMES + INTRO_HOLD_FRAMES + INTRO_PUSH_IN_FRAMES;
export const INTRO_TITLE_EXIT_FRAMES = 30;

export const X_SPACING = 34;
export const STELE_WIDTH = 16;
export const STELE_DEPTH = 4.5;
export const BASE_HEIGHT = 15;
export const STELE_ROW_Z = 10;
export const GROUND_Y = -0.02;

const CINEMATIC_RAMP_FRAMES = 300;
const CINEMATIC_OVERVIEW_FRAMES = 540;
const CINEMATIC_TURN_FRAMES = 180;
const CINEMATIC_RETURN_FRAMES = 600;

/* Cut-hold orbit camera mode */
const MAIN_PASS_MOVE_FRAMES = 72;
const MAIN_PASS_HOLD_FRAMES = 240;
const MAIN_PASS_WINNER_HOLD_FRAMES = 300;
const CAMERA_SETTLE_FRAMES = 18;
const CAMERA_ORBIT_HOLD_FRAMES = 60;
const STELE_PRELOAD_LEAD_FRAMES = 120;
const FULL_DETAIL_RADIUS = 2;
const STANDBY_RADIUS = 3;
const NON_CINEMATIC_MOUNT_RADIUS = STANDBY_RADIUS + 2;
const CINEMATIC_CARD_RADIUS = 3;
const CINEMATIC_STANDBY_RADIUS_MIN = CINEMATIC_CARD_RADIUS + 2;
const CINEMATIC_STANDBY_RADIUS_MAX = 11;
const CINEMATIC_OVERVIEW_HEIGHT_NEAR = 120;
const CINEMATIC_OVERVIEW_HEIGHT_FAR = 260;
const CINEMATIC_OVERVIEW_DEPTH_NEAR = 165;
const CINEMATIC_OVERVIEW_DEPTH_FAR = 340;
const CINEMATIC_VISIBILITY_VIEWPORT_WIDTH = 1920;
const CINEMATIC_VISIBILITY_VIEWPORT_HEIGHT = 1080;
const CINEMATIC_VISIBILITY_MARGIN_X = 0.06;
const CINEMATIC_VISIBILITY_MARGIN_Y = 0.1;
const CINEMATIC_VISIBLE_STANDBY_MIN_HEIGHT_NEAR = 0.04;
const CINEMATIC_VISIBLE_STANDBY_MIN_HEIGHT_FAR = 0.07;

const cinematicVisibilityCamera = new THREE.PerspectiveCamera(
    45,
    CINEMATIC_VISIBILITY_VIEWPORT_WIDTH / CINEMATIC_VISIBILITY_VIEWPORT_HEIGHT,
    1,
    7000,
);
const cinematicVisibilityWorldVector = new THREE.Vector3();
const cinematicVisibilityViewVector = new THREE.Vector3();
const cinematicVisibilityUpAxis = new THREE.Vector3(0, 1, 0);

export const getSteleHeight = (relHeight: number) => {
    const scaledHeight = Math.pow(relHeight, 1.45) * 6.5;
    return Math.max(3, scaledHeight);
};

const timingPlan = buildSharedScenePresetTimingPlan({
    itemCount: reversedData.length,
    introDurationFrames: INTRO_DURATION_IN_FRAMES,
    supportedFps: 60,
    sourceItemCount: reversedData.length,
    supportedCountRange: [20, 150] as const,
    targetDurationBandSeconds: [240, 900] as const,
    baseMoveFrames: MAIN_PASS_MOVE_FRAMES,
    baseHoldFrames: MAIN_PASS_HOLD_FRAMES,
    sourceWinnerHoldFrames: MAIN_PASS_WINNER_HOLD_FRAMES,
    adaptiveWinnerHoldFrames: MAIN_PASS_WINNER_HOLD_FRAMES,
    adaptiveMinMoveFrames: MAIN_PASS_MOVE_FRAMES,
    adaptiveMinHoldFrames: MAIN_PASS_HOLD_FRAMES,
    adaptiveTopWindowCount: 1,
    adaptiveTopWindowHoldMultiplier: 0,
    moveScaleExponent: 1,
    holdScaleExponent: 1,
    finalCinematicFrames: 0,
    legacySlowdownStartBaseFrames: 0,
    legacySlowdownFactor: 1,
    strategy: "source-compatible",
    finaleTailPolicy: "off",
});

const getMilestones = () =>
    timingPlan.milestones.map((timingMilestone) => {
        const item = reversedData[timingMilestone.index];
        const height = getSteleHeight(item.relHeight);

        return {
            index: timingMilestone.index,
            arriveFrame: timingMilestone.arriveFrame,
            leaveFrame: timingMilestone.leaveFrame,
            xCenter: timingMilestone.index * X_SPACING + BIO_STELE_FOCUS_SHIFT_X,
            yCenter: height + BIO_STELE_SUBJECT_CENTER_FROM_BOTTOM,
        };
    });

export const milestones = getMilestones();
export const baseDurationInFrames = timingPlan.baseDurationInFrames;
export const sequenceCompleteFrame = timingPlan.sequenceCompleteFrame;
export const FINAL_CAMERA_SLOWDOWN_FACTOR = timingPlan.finalCameraSlowdownFactor;
export const FINAL_CAMERA_SLOWDOWN_START_FRAME = timingPlan.finalCameraSlowdownStartFrame;
export const durationInFrames = timingPlan.durationInFrames;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
const smoothstep = (edge0: number, edge1: number, value: number) => {
    if (edge0 === edge1) {
        return value >= edge1 ? 1 : 0;
    }

    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
};

const easeInOutCubic = (value: number) => {
    const t = clamp01(value);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

type CameraState = {
    camX: number;
    camY: number;
    lookX: number;
    lookY: number;
    camZOffset: number;
};

type HoldMilestoneWindow = {
    milestone: (typeof milestones)[number];
};

const getPushInForIndex = (indexPosition: number) => {
    const total = reversedData.length;
    const pushInFactor = Math.max(0, (indexPosition - Math.floor(total * 0.65)) / Math.ceil(total * 0.35));
    return clamp01(pushInFactor * pushInFactor);
};

const getDroneOffsets = (frame: number) => ({
    sine: Math.sin(frame * 0.015),
    cosine: Math.cos(frame * 0.012),
});

const getHoldMilestoneWindow = (frame: number): HoldMilestoneWindow => {
    if (frame <= milestones[0].arriveFrame) {
        return {
            milestone: milestones[0],
        };
    }

    for (let index = 0; index < milestones.length; index += 1) {
        const milestone = milestones[index];

        if (frame >= milestone.arriveFrame && frame <= milestone.leaveFrame) {
            return {
                milestone,
            };
        }
    }

    const lastMilestone = milestones[milestones.length - 1];

    return {
        milestone: lastMilestone,
    };
};

export const isVipStele = () => false;

export const getSteleFocusLockFrame = (index: number) => milestones[index]?.arriveFrame ?? 0;

/* ---- Environment Act Boundaries ---- */
const {
    scene1EndIndex: ACT1_END_INDEX,
    scene2EndIndex: ACT2_END_INDEX,
    scene3EndIndex: ACT3_END_INDEX,
    finaleIndex: FINALE_INDEX,
} = timingPlan.actBoundaries;
export const ACT1_END_FRAME = milestones[ACT1_END_INDEX].leaveFrame;
export const ACT2_END_FRAME = milestones[ACT2_END_INDEX].leaveFrame;
export const ACT3_END_FRAME = milestones[ACT3_END_INDEX].leaveFrame;
export const FINALE_FRAME = milestones[FINALE_INDEX]?.arriveFrame ?? milestones[milestones.length - 1].arriveFrame;

export function getEnvironmentState(frame: number) {
    const focusedIndex = getFocusedSteleIndex(Math.min(frame, sequenceCompleteFrame));
    const focusedX = focusedIndex * X_SPACING + BIO_STELE_FOCUS_SHIFT_X;

    const totalProgress = interpolate(frame, [INTRO_DURATION_IN_FRAMES, sequenceCompleteFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    let act: 1 | 2 | 3 | 4 = 1;
    let actProgress = 0;
    if (frame < ACT1_END_FRAME) {
        act = 1;
        actProgress = interpolate(frame, [INTRO_DURATION_IN_FRAMES, ACT1_END_FRAME], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    } else if (frame < ACT2_END_FRAME) {
        act = 2;
        actProgress = interpolate(frame, [ACT1_END_FRAME, ACT2_END_FRAME], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    } else if (frame < ACT3_END_FRAME) {
        act = 3;
        actProgress = interpolate(frame, [ACT2_END_FRAME, ACT3_END_FRAME], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    } else {
        act = 4;
        actProgress = interpolate(frame, [ACT3_END_FRAME, sequenceCompleteFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    }

    return { act, actProgress, totalProgress, focusedIndex, focusedX };
}

export function getCameraTimelineFrame(frame: number) {
    if (frame <= FINAL_CAMERA_SLOWDOWN_START_FRAME) {
        return frame;
    }

    const slowedFrame =
        FINAL_CAMERA_SLOWDOWN_START_FRAME +
        (frame - FINAL_CAMERA_SLOWDOWN_START_FRAME) / FINAL_CAMERA_SLOWDOWN_FACTOR;

    return Math.min(baseDurationInFrames, slowedFrame);
}
export function isIntroFrame(frame: number) {
    return frame < INTRO_DURATION_IN_FRAMES;
}

export function getIntroTitleState(frame: number) {
    const clampedFrame = Math.max(0, Math.min(INTRO_DURATION_IN_FRAMES, frame));
    const revealProgress = Math.min(1, clampedFrame / INTRO_REVEAL_FRAMES);
    const revealEased = revealProgress * revealProgress * (3 - 2 * revealProgress);
    const exitStartFrame = INTRO_DURATION_IN_FRAMES - INTRO_TITLE_EXIT_FRAMES;
    const exitProgress =
        clampedFrame <= exitStartFrame ? 0 : Math.min(1, (clampedFrame - exitStartFrame) / INTRO_TITLE_EXIT_FRAMES);
    const exitEased = exitProgress * exitProgress * (3 - 2 * exitProgress);
    const opacity = interpolate(revealEased, [0, 1], [0, 1]) * interpolate(exitEased, [0, 1], [1, 0]);
    const revealTranslateY = interpolate(revealEased, [0, 1], [28, 0]);
    const exitTranslateY = interpolate(exitEased, [0, 1], [0, -36]);
    const scale = exitProgress > 0 ? interpolate(exitEased, [0, 1], [1, 0.94]) : interpolate(revealEased, [0, 1], [0.94, 1]);

    return {
        isVisible: opacity > 0.01,
        opacity,
        scale,
        translateY: revealTranslateY + exitTranslateY,
    };
}

function getHeldCameraState({
    milestone,
    frame,
}: {
    milestone: (typeof milestones)[number];
    frame: number;
}): CameraState {
    const focusWindowFrames = Math.max(1, milestone.leaveFrame - milestone.arriveFrame);
    const focusProgress = clamp01((frame - milestone.arriveFrame) / focusWindowFrames);
    const stableRailProgress = smoothstep(0.1, 0.92, focusProgress);
    const orbitUnlockProgress = smoothstep(
        Math.min(milestone.leaveFrame, milestone.arriveFrame + 6),
        Math.min(milestone.leaveFrame, milestone.arriveFrame + CAMERA_SETTLE_FRAMES + 10),
        frame
    );
    const pushIn = getPushInForIndex(milestone.index);
    const drone = getDroneOffsets(frame);

    const railDriftX = mix(-0.2, mix(0.9, 1.8, pushIn), stableRailProgress) * orbitUnlockProgress;
    const hoverY = Math.sin(focusProgress * Math.PI) * mix(0.18, 0.42, pushIn) * orbitUnlockProgress;

    const sideOffset = mix(6.2, 4.5, pushIn);
    const camYOffset = mix(5.6, 7.4, pushIn);
    const lookYOffset = mix(-0.8, 1.8, pushIn);
    const baseZOffset = mix(34, 27, pushIn);

    return {
        camX: milestone.xCenter + sideOffset + railDriftX + drone.sine * 0.08,
        camY: milestone.yCenter + camYOffset + hoverY + drone.sine * 0.08,
        lookX: milestone.xCenter + railDriftX * 0.08 + drone.cosine * 0.02,
        lookY: milestone.yCenter + lookYOffset + hoverY * 0.14 + drone.cosine * 0.05,
        camZOffset: baseZOffset + drone.cosine * 0.04,
    };
}

function getContinuousCameraState(frame: number): CameraState {
    const clampedFrame = Math.max(0, Math.min(sequenceCompleteFrame, frame));

    for (let index = 0; index < milestones.length - 1; index += 1) {
        const current = milestones[index];
        const next = milestones[index + 1];

        if (clampedFrame > current.leaveFrame && clampedFrame < next.arriveFrame) {
            const moveProgress = smoothstep(current.leaveFrame, next.arriveFrame, clampedFrame);
            const fromState = getHeldCameraState({
                milestone: current,
                frame: current.leaveFrame,
            });
            const toState = getHeldCameraState({
                milestone: next,
                frame: next.arriveFrame,
            });

            return {
                camX: mix(fromState.camX, toState.camX, moveProgress),
                camY: mix(fromState.camY, toState.camY, moveProgress),
                lookX: mix(fromState.lookX, toState.lookX, moveProgress),
                lookY: mix(fromState.lookY, toState.lookY, moveProgress),
                camZOffset: mix(fromState.camZOffset, toState.camZOffset, moveProgress),
            };
        }
    }

    return getHeldCameraState({
        milestone: getHoldMilestoneWindow(clampedFrame).milestone,
        frame: clampedFrame,
    });
}

export function getCameraState(frame: number) {
    return getContinuousCameraState(frame);
}

type CinematicCameraState = {
    camX: number;
    camY: number;
    camZ: number;
    lookX: number;
    lookY: number;
    lookZ: number;
};

export type IntroCameraState = CinematicCameraState;

export function getIntroCameraState(frame: number): IntroCameraState {
    const firstMainCameraState = getCameraState(milestones[0].arriveFrame);
    const clampedFrame = Math.max(0, Math.min(INTRO_DURATION_IN_FRAMES, frame));
    const pushInStartFrame = INTRO_REVEAL_FRAMES + INTRO_HOLD_FRAMES;
    const pushInProgress =
        clampedFrame <= pushInStartFrame ? 0 : Math.min(1, (clampedFrame - pushInStartFrame) / INTRO_PUSH_IN_FRAMES);
    const eased = pushInProgress * pushInProgress * (3 - 2 * pushInProgress);

    const introStart: IntroCameraState = {
        camX: firstMainCameraState.camX - 42,
        camY: firstMainCameraState.camY + 58,
        camZ: 210,
        lookX: firstMainCameraState.lookX - 18,
        lookY: firstMainCameraState.lookY + 10,
        lookZ: 10,
    };
    const introEnd: IntroCameraState = {
        camX: firstMainCameraState.camX,
        camY: firstMainCameraState.camY,
        camZ: 55 + firstMainCameraState.camZOffset,
        lookX: firstMainCameraState.lookX,
        lookY: firstMainCameraState.lookY,
        lookZ: 10,
    };

    if (clampedFrame >= INTRO_DURATION_IN_FRAMES) {
        return introEnd;
    }

    return {
        camX: interpolate(eased, [0, 1], [introStart.camX, introEnd.camX]),
        camY: interpolate(eased, [0, 1], [introStart.camY, introEnd.camY]),
        camZ: interpolate(eased, [0, 1], [introStart.camZ, introEnd.camZ]),
        lookX: interpolate(eased, [0, 1], [introStart.lookX, introEnd.lookX]),
        lookY: interpolate(eased, [0, 1], [introStart.lookY, introEnd.lookY]),
        lookZ: 10,
    };
}

export function getCinematicCameraState(cinematicFrame: number): CinematicCameraState {
    const firstMilestone = milestones[0];
    const lastMilestone = milestones[milestones.length - 1];
    const startState = getCameraState(lastMilestone.leaveFrame);

    const rampTarget: CinematicCameraState = {
        camX: lastMilestone.xCenter + 120,
        camY: 260,
        camZ: 340,
        lookX: lastMilestone.xCenter - 50,
        lookY: 78,
        lookZ: 0,
    };
    const overviewEnd: CinematicCameraState = {
        camX: firstMilestone.xCenter - 70,
        camY: 225,
        camZ: 290,
        lookX: firstMilestone.xCenter + 80,
        lookY: 62,
        lookZ: 0,
    };
    const returnStart: CinematicCameraState = {
        camX: firstMilestone.xCenter - 50,
        camY: 120,
        camZ: 185,
        lookX: firstMilestone.xCenter + 30,
        lookY: 48,
        lookZ: 0,
    };
    const returnEnd: CinematicCameraState = {
        camX: lastMilestone.xCenter + 80,
        camY: 132,
        camZ: 165,
        lookX: lastMilestone.xCenter - 40,
        lookY: 56,
        lookZ: 0,
    };

    if (cinematicFrame <= CINEMATIC_RAMP_FRAMES) {
        const rampProgress = Math.min(1, cinematicFrame / CINEMATIC_RAMP_FRAMES);
        const t = easeInOutCubic(rampProgress);

        return {
            camX: interpolate(t, [0, 1], [startState.camX, rampTarget.camX]),
            camY: interpolate(t, [0, 1], [startState.camY, rampTarget.camY]),
            camZ: interpolate(t, [0, 1], [55 + startState.camZOffset, rampTarget.camZ]),
            lookX: interpolate(t, [0, 1], [startState.lookX, rampTarget.lookX]),
            lookY: interpolate(t, [0, 1], [startState.lookY, rampTarget.lookY]),
            lookZ: interpolate(t, [0, 1], [10, rampTarget.lookZ]),
        };
    }

    if (cinematicFrame <= CINEMATIC_RAMP_FRAMES + CINEMATIC_OVERVIEW_FRAMES) {
        const overviewFrame = cinematicFrame - CINEMATIC_RAMP_FRAMES;
        const progress = Math.min(1, overviewFrame / CINEMATIC_OVERVIEW_FRAMES);
        const eased = progress * progress * (3 - 2 * progress);
        const glideY = Math.sin(progress * Math.PI) * 18;
        const glideZ = Math.sin(progress * Math.PI * 1.2) * 16;

        return {
            camX: interpolate(eased, [0, 1], [rampTarget.camX, overviewEnd.camX]),
            camY: interpolate(eased, [0, 1], [rampTarget.camY, overviewEnd.camY]) + glideY,
            camZ: interpolate(eased, [0, 1], [rampTarget.camZ, overviewEnd.camZ]) + glideZ,
            lookX: interpolate(eased, [0, 1], [rampTarget.lookX, overviewEnd.lookX]),
            lookY: interpolate(eased, [0, 1], [rampTarget.lookY, overviewEnd.lookY]),
            lookZ: 0,
        };
    }

    if (cinematicFrame <= CINEMATIC_RAMP_FRAMES + CINEMATIC_OVERVIEW_FRAMES + CINEMATIC_TURN_FRAMES) {
        const turnFrame = cinematicFrame - CINEMATIC_RAMP_FRAMES - CINEMATIC_OVERVIEW_FRAMES;
        const progress = Math.min(1, turnFrame / CINEMATIC_TURN_FRAMES);
        const eased = progress * progress * (3 - 2 * progress);

        return {
            camX: interpolate(eased, [0, 1], [overviewEnd.camX, returnStart.camX]),
            camY: interpolate(eased, [0, 1], [overviewEnd.camY, returnStart.camY]),
            camZ: interpolate(eased, [0, 1], [overviewEnd.camZ, returnStart.camZ]),
            lookX: interpolate(eased, [0, 1], [overviewEnd.lookX, returnStart.lookX]),
            lookY: interpolate(eased, [0, 1], [overviewEnd.lookY, returnStart.lookY]),
            lookZ: 0,
        };
    }

    const returnFrame = cinematicFrame - CINEMATIC_RAMP_FRAMES - CINEMATIC_OVERVIEW_FRAMES - CINEMATIC_TURN_FRAMES;
    const returnProgress = Math.min(1, returnFrame / CINEMATIC_RETURN_FRAMES);
    const eased = returnProgress * returnProgress * (3 - 2 * returnProgress);
    const swayY = Math.sin(returnProgress * Math.PI * 1.5) * 10;
    const swayZ = Math.sin(returnProgress * Math.PI) * 14;
    const leadLookX = Math.sin(returnProgress * Math.PI) * 12;

    return {
        camX: interpolate(eased, [0, 1], [returnStart.camX, returnEnd.camX]),
        camY: interpolate(eased, [0, 1], [returnStart.camY, returnEnd.camY]) + swayY,
        camZ: interpolate(eased, [0, 1], [returnStart.camZ, returnEnd.camZ]) + swayZ,
        lookX: interpolate(eased, [0, 1], [returnStart.lookX, returnEnd.lookX]) + leadLookX,
        lookY: interpolate(eased, [0, 1], [returnStart.lookY, returnEnd.lookY]),
        lookZ: 0,
    };
}

export function getFocusedSteleIndex(frame: number) {
    if (frame <= milestones[0].arriveFrame) {
        return milestones[0].index;
    }

    const cameraFrame = getCameraTimelineFrame(frame);

    if (cameraFrame > sequenceCompleteFrame) {
        const cinematicFrame = cameraFrame - sequenceCompleteFrame;
        const cinematicState = getCinematicCameraState(cinematicFrame);
        const focusedIndex = Math.round((cinematicState.lookX - BIO_STELE_FOCUS_SHIFT_X) / X_SPACING);

        return Math.max(0, Math.min(milestones.length - 1, focusedIndex));
    }

    if (cameraFrame >= sequenceCompleteFrame) {
        return milestones[milestones.length - 1].index;
    }

    for (let index = 0; index < milestones.length; index += 1) {
        const milestone = milestones[index];

        if (cameraFrame >= milestone.arriveFrame && cameraFrame <= milestone.leaveFrame) {
            return milestone.index;
        }

        const next = milestones[index + 1];
        if (next && cameraFrame > milestone.leaveFrame && cameraFrame < next.arriveFrame) {
            return milestone.index;
        }
    }

    return milestones[milestones.length - 1].index;
}

export type SteleRenderMode = "minimal" | "standby" | "full" | "cinematic";

function shouldPreloadSteleAssetsForFocus(frame: number, index: number, focusedIndex: number) {
    if (frame > sequenceCompleteFrame) {
        return true;
    }

    const milestone = milestones[index];
    if (!milestone) {
        return false;
    }

    if (Math.abs(index - focusedIndex) <= STANDBY_RADIUS) {
        return true;
    }

    return frame >= milestone.arriveFrame - STELE_PRELOAD_LEAD_FRAMES && frame <= milestone.leaveFrame + CAMERA_ORBIT_HOLD_FRAMES;
}

export function shouldPreloadSteleAssets(frame: number, index: number) {
    return shouldPreloadSteleAssetsForFocus(frame, index, getFocusedSteleIndex(frame));
}

function getCinematicDetailWindow(frame: number) {
    const cameraFrame = getCameraTimelineFrame(frame);
    const cinematicFrame = Math.max(0, cameraFrame - sequenceCompleteFrame);
    const cinematicState = getCinematicCameraState(cinematicFrame);
    const overviewCoverage = Math.max(
        smoothstep(CINEMATIC_OVERVIEW_HEIGHT_NEAR, CINEMATIC_OVERVIEW_HEIGHT_FAR, cinematicState.camY),
        smoothstep(CINEMATIC_OVERVIEW_DEPTH_NEAR, CINEMATIC_OVERVIEW_DEPTH_FAR, cinematicState.camZ),
    );
    const standbyRadius = Math.round(
        mix(CINEMATIC_STANDBY_RADIUS_MIN, CINEMATIC_STANDBY_RADIUS_MAX, overviewCoverage),
    );

    return {
        cinematicRadius: CINEMATIC_CARD_RADIUS,
        standbyRadius: Math.max(CINEMATIC_CARD_RADIUS + 1, standbyRadius),
        visibleStandbyMinProjectedHeight: mix(
            CINEMATIC_VISIBLE_STANDBY_MIN_HEIGHT_NEAR,
            CINEMATIC_VISIBLE_STANDBY_MIN_HEIGHT_FAR,
            overviewCoverage,
        ),
    };
}

const projectCinematicViewportPoint = ({
    point,
    cameraState,
}: {
    point: readonly [number, number, number];
    cameraState: CinematicCameraState;
}) => {
    cinematicVisibilityCamera.position.set(cameraState.camX, cameraState.camY, cameraState.camZ);
    cinematicVisibilityCamera.up.copy(cinematicVisibilityUpAxis);
    cinematicVisibilityCamera.lookAt(cameraState.lookX, cameraState.lookY, cameraState.lookZ);
    cinematicVisibilityCamera.updateProjectionMatrix();
    cinematicVisibilityCamera.updateMatrixWorld(true);

    cinematicVisibilityWorldVector.set(point[0], point[1], point[2]);
    cinematicVisibilityViewVector.copy(cinematicVisibilityWorldVector).applyMatrix4(cinematicVisibilityCamera.matrixWorldInverse);
    cinematicVisibilityWorldVector.project(cinematicVisibilityCamera);

    return {
        x: (cinematicVisibilityWorldVector.x + 1) / 2,
        y: (1 - cinematicVisibilityWorldVector.y) / 2,
        isInFront: cinematicVisibilityViewVector.z < -1,
    };
};

type CinematicVisibilityState = {
    visibleIndices: Set<number>;
    detailWindow: {
        cinematicRadius: number;
        standbyRadius: number;
        visibleStandbyMinProjectedHeight: number;
    };
};

function getCinematicVisibilityState(frame: number): CinematicVisibilityState {
    const cameraFrame = getCameraTimelineFrame(frame);
    const cinematicFrame = Math.max(0, cameraFrame - sequenceCompleteFrame);
    const cameraState = getCinematicCameraState(cinematicFrame);
    const detailWindow = getCinematicDetailWindow(frame);
    const visibleIndices = new Set<number>();

    for (const milestone of milestones) {
        const worldX = milestone.xCenter;
        const rootWorldY = milestone.yCenter;
        const top = projectCinematicViewportPoint({
            point: [worldX, rootWorldY + BIO_STELE_TOP_LOCAL_Y, STELE_ROW_Z],
            cameraState,
        });
        const bottom = projectCinematicViewportPoint({
            point: [worldX, rootWorldY + BIO_STELE_BOTTOM_LOCAL_Y, STELE_ROW_Z],
            cameraState,
        });
        const center = projectCinematicViewportPoint({
            point: [worldX, rootWorldY + BIO_STELE_CENTER_LOCAL_Y, STELE_ROW_Z],
            cameraState,
        });

        const isVisibleToCamera = top.isInFront && bottom.isInFront && center.isInFront;
        const intersectsViewport =
            isVisibleToCamera &&
            center.x >= -CINEMATIC_VISIBILITY_MARGIN_X &&
            center.x <= 1 + CINEMATIC_VISIBILITY_MARGIN_X &&
            bottom.y >= -CINEMATIC_VISIBILITY_MARGIN_Y &&
            top.y <= 1 + CINEMATIC_VISIBILITY_MARGIN_Y;
        const projectedHeight = Math.abs(bottom.y - top.y);
        const isLargeEnoughForStandby = projectedHeight >= detailWindow.visibleStandbyMinProjectedHeight;

        if (intersectsViewport && isLargeEnoughForStandby) {
            visibleIndices.add(milestone.index);
        }
    }

    return {
        visibleIndices,
        detailWindow,
    };
}

function getSteleRenderModeForFocus(frame: number, index: number, focusedIndex: number): SteleRenderMode {
    if (frame > sequenceCompleteFrame) {
        const distance = Math.abs(index - focusedIndex);
        const detailWindow = getCinematicDetailWindow(frame);

        if (distance <= detailWindow.cinematicRadius) {
            return "cinematic";
        }

        if (distance <= detailWindow.standbyRadius) {
            return "standby";
        }

        return "minimal";
    }

    const distance = Math.abs(index - focusedIndex);

    if (distance <= FULL_DETAIL_RADIUS) {
        return "full";
    }

    if (distance <= STANDBY_RADIUS || shouldPreloadSteleAssetsForFocus(frame, index, focusedIndex)) {
        return "standby";
    }

    return "minimal";
}

export function getSteleRenderMode(frame: number, index: number) {
    return getSteleFrameState(frame).renderModes[index];
}

export function getSteleFrameState(frame: number) {
    const isCinematic = frame > sequenceCompleteFrame;
    const focusedIndex = getFocusedSteleIndex(frame);

    if (isCinematic) {
        const cinematicVisibility = getCinematicVisibilityState(frame);

        return {
            focusedIndex,
            isIntro: isIntroFrame(frame),
            isCinematic,
            renderModes: reversedData.map((_, index) => {
                const distance = Math.abs(index - focusedIndex);

                if (distance <= cinematicVisibility.detailWindow.cinematicRadius) {
                    return "cinematic";
                }

                if (
                    cinematicVisibility.visibleIndices.has(index) ||
                    distance <= cinematicVisibility.detailWindow.standbyRadius
                ) {
                    return "standby";
                }

                return "minimal";
            }),
        };
    }

    return {
        focusedIndex,
        isIntro: isIntroFrame(frame),
        isCinematic,
        renderModes: reversedData.map((_, index) => getSteleRenderModeForFocus(frame, index, focusedIndex)),
    };
}

export function getMountedSteleIndices(frame: number) {
    const state = getSteleFrameState(frame);

    if (state.isCinematic) {
        return state.renderModes
            .map((mode, index) => (mode === "minimal" ? null : index))
            .filter((index): index is number => index !== null);
    }

    const mounted = new Set<number>();
    const rangeStart = Math.max(0, state.focusedIndex - NON_CINEMATIC_MOUNT_RADIUS);
    const rangeEnd = Math.min(reversedData.length - 1, state.focusedIndex + NON_CINEMATIC_MOUNT_RADIUS);

    for (let index = rangeStart; index <= rangeEnd; index += 1) {
        mounted.add(index);
    }

    state.renderModes.forEach((mode, index) => {
        if (mode !== "minimal") {
            mounted.add(index);
        }
    });

    return [...mounted].sort((a, b) => a - b);
}
