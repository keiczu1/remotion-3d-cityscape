import * as THREE from "three";

import {
    getCameraState,
    getCameraTimelineFrame,
    getCinematicCameraState,
    getIntroCameraState,
    isIntroFrame,
    sequenceCompleteFrame,
} from "./scene-logic";

export type ResolvedCameraPose = {
    camX: number;
    camY: number;
    camZ: number;
    lookX: number;
    lookY: number;
    lookZ: number;
};

export type PresentationSubjectMetrics = {
    cardTopWorld: readonly [number, number, number];
    cardBottomWorld: readonly [number, number, number];
    cardCenterWorld: readonly [number, number, number];
};

export const CAMERA_PRESENTATION_PRESET = {
    fov: 45,
    near: 1,
    far: 7000,
    safeTopEnter: 0.03,
    safeTopReady: 0.14,
    focusInnerHalfWidth: 0.11,
    focusOuterHalfWidth: 0.352,
    minReadableCardPx: 150,
    targetReadableCardPx: 260,
    gateStart: 0.58,
    gateEnd: 0.94,
} as const;

type ViewportPoint = {
    x: number;
    y: number;
    ndcZ: number;
    isInFront: boolean;
};

export type PresentationState = {
    progress: number;
    gate: number;
    verticalGate: number;
    horizontalGate: number;
    readabilityGate: number;
    cardPixelHeight: number;
    viewport: {
        top: ViewportPoint;
        bottom: ViewportPoint;
        center: ViewportPoint;
    };
};

type PresentationActivationSearch = {
    searchStartFrame: number;
    searchEndFrame: number;
    subject: PresentationSubjectMetrics;
    width: number;
    height: number;
};

const sharedCamera = new THREE.PerspectiveCamera(
    CAMERA_PRESENTATION_PRESET.fov,
    16 / 9,
    CAMERA_PRESENTATION_PRESET.near,
    CAMERA_PRESENTATION_PRESET.far,
);
const sharedWorldVector = new THREE.Vector3();
const sharedViewVector = new THREE.Vector3();
const upAxis = new THREE.Vector3(0, 1, 0);
const activationFrameCache = new Map<string, number | null>();

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
    if (edge0 === edge1) {
        return value >= edge1 ? 1 : 0;
    }

    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
};

const inverseSmoothstep = (edge0: number, edge1: number, value: number) =>
    1 - smoothstep(edge0, edge1, value);

const getActivationCacheKey = ({
    searchStartFrame,
    searchEndFrame,
    subject,
    width,
    height,
}: PresentationActivationSearch) => [
    searchStartFrame,
    searchEndFrame,
    width,
    height,
    subject.cardTopWorld.join(","),
    subject.cardBottomWorld.join(","),
    subject.cardCenterWorld.join(","),
].join("|");

const projectWorldPoint = ({
    point,
    pose,
    width,
    height,
}: {
    point: readonly [number, number, number];
    pose: ResolvedCameraPose;
    width: number;
    height: number;
}): ViewportPoint => {
    sharedCamera.aspect = width / height;
    sharedCamera.position.set(pose.camX, pose.camY, pose.camZ);
    sharedCamera.up.copy(upAxis);
    sharedCamera.lookAt(pose.lookX, pose.lookY, pose.lookZ);
    sharedCamera.updateProjectionMatrix();
    sharedCamera.updateMatrixWorld(true);

    sharedWorldVector.set(point[0], point[1], point[2]);
    sharedViewVector.copy(sharedWorldVector).applyMatrix4(sharedCamera.matrixWorldInverse);
    sharedWorldVector.project(sharedCamera);

    return {
        x: (sharedWorldVector.x + 1) / 2,
        y: (1 - sharedWorldVector.y) / 2,
        ndcZ: sharedWorldVector.z,
        isInFront: sharedViewVector.z < -CAMERA_PRESENTATION_PRESET.near,
    };
};

export const getResolvedCameraPose = (frame: number): ResolvedCameraPose => {
    const cameraFrame = getCameraTimelineFrame(frame);

    if (isIntroFrame(cameraFrame)) {
        return getIntroCameraState(cameraFrame);
    }

    if (cameraFrame <= sequenceCompleteFrame) {
        const state = getCameraState(cameraFrame);

        return {
            camX: state.camX,
            camY: state.camY,
            camZ: 55 + (state.camZOffset || 0),
            lookX: state.lookX,
            lookY: state.lookY,
            lookZ: 10,
        };
    }

    return getCinematicCameraState(cameraFrame - sequenceCompleteFrame);
};

export const getPresentationState = ({
    frame,
    subject,
    width,
    height,
}: {
    frame: number;
    subject: PresentationSubjectMetrics;
    width: number;
    height: number;
}): PresentationState => {
    const pose = getResolvedCameraPose(frame);
    const top = projectWorldPoint({ point: subject.cardTopWorld, pose, width, height });
    const bottom = projectWorldPoint({ point: subject.cardBottomWorld, pose, width, height });
    const center = projectWorldPoint({ point: subject.cardCenterWorld, pose, width, height });

    const isVisibleToCamera = top.isInFront && bottom.isInFront && center.isInFront;
    const verticalGate = isVisibleToCamera
        ? smoothstep(CAMERA_PRESENTATION_PRESET.safeTopEnter, CAMERA_PRESENTATION_PRESET.safeTopReady, top.y)
        : 0;
    const horizontalGate = isVisibleToCamera
        ? inverseSmoothstep(
            CAMERA_PRESENTATION_PRESET.focusInnerHalfWidth,
            CAMERA_PRESENTATION_PRESET.focusOuterHalfWidth,
            Math.abs(center.x - 0.5),
        )
        : 0;
    const cardPixelHeight = Math.abs(bottom.y - top.y) * height;
    const readabilityGate = isVisibleToCamera
        ? smoothstep(
            CAMERA_PRESENTATION_PRESET.minReadableCardPx,
            CAMERA_PRESENTATION_PRESET.targetReadableCardPx,
            cardPixelHeight,
        )
        : 0;

    const gate = Math.min(verticalGate, horizontalGate, readabilityGate);
    const progress = smoothstep(CAMERA_PRESENTATION_PRESET.gateStart, CAMERA_PRESENTATION_PRESET.gateEnd, gate);

    return {
        progress,
        gate,
        verticalGate,
        horizontalGate,
        readabilityGate,
        cardPixelHeight,
        viewport: {
            top,
            bottom,
            center,
        },
    };
};

export const findPresentationActivationFrame = (search: PresentationActivationSearch): number | null => {
    const key = getActivationCacheKey(search);
    const cached = activationFrameCache.get(key);
    if (cached !== undefined) {
        return cached;
    }

    for (let frame = search.searchStartFrame; frame <= search.searchEndFrame; frame++) {
        const state = getPresentationState({
            frame,
            subject: search.subject,
            width: search.width,
            height: search.height,
        });

        if (state.progress > 0.001) {
            activationFrameCache.set(key, frame);
            return frame;
        }
    }

    activationFrameCache.set(key, null);
    return null;
};

export const getActivatedPresentationProgress = ({
    frame,
    activationFrame,
    revealFrames,
}: {
    frame: number;
    activationFrame: number | null;
    revealFrames: number;
}) => {
    if (activationFrame === null) {
        return 0;
    }

    return smoothstep(0, revealFrames, frame - activationFrame);
};
