import * as THREE from "three";

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

export type PresentationPreset = {
    fov: number;
    near: number;
    far: number;
    safeTopEnter: number;
    safeTopReady: number;
    focusInnerHalfWidth: number;
    focusOuterHalfWidth: number;
    minReadableCardPx: number;
    targetReadableCardPx: number;
    gateStart: number;
    gateEnd: number;
};

export type ViewportPoint = {
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
    cacheKey?: string;
    searchStartFrame: number;
    searchEndFrame: number;
    subject: PresentationSubjectMetrics;
    width: number;
    height: number;
    preset?: PresentationPreset;
    getPoseForFrame: (frame: number) => ResolvedCameraPose;
};

const DEFAULT_PROJECTION_GATE_PRESET: PresentationPreset = {
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
};

const sharedCamera = new THREE.PerspectiveCamera(
    DEFAULT_PROJECTION_GATE_PRESET.fov,
    16 / 9,
    DEFAULT_PROJECTION_GATE_PRESET.near,
    DEFAULT_PROJECTION_GATE_PRESET.far,
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
    cacheKey,
    searchStartFrame,
    searchEndFrame,
    subject,
    width,
    height,
    preset,
}: Omit<PresentationActivationSearch, "getPoseForFrame">) => [
    cacheKey ?? "projection-gate",
    searchStartFrame,
    searchEndFrame,
    width,
    height,
    JSON.stringify(preset ?? DEFAULT_PROJECTION_GATE_PRESET),
    subject.cardTopWorld.join(","),
    subject.cardBottomWorld.join(","),
    subject.cardCenterWorld.join(","),
].join("|");

const projectWorldPoint = ({
    point,
    pose,
    width,
    height,
    preset,
}: {
    point: readonly [number, number, number];
    pose: ResolvedCameraPose;
    width: number;
    height: number;
    preset: PresentationPreset;
}): ViewportPoint => {
    sharedCamera.fov = preset.fov;
    sharedCamera.near = preset.near;
    sharedCamera.far = preset.far;
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
        isInFront: sharedViewVector.z < -preset.near,
    };
};

export const getProjectionPresentationState = ({
    pose,
    subject,
    width,
    height,
    preset = DEFAULT_PROJECTION_GATE_PRESET,
}: {
    pose: ResolvedCameraPose;
    subject: PresentationSubjectMetrics;
    width: number;
    height: number;
    preset?: PresentationPreset;
}): PresentationState => {
    const top = projectWorldPoint({ point: subject.cardTopWorld, pose, width, height, preset });
    const bottom = projectWorldPoint({ point: subject.cardBottomWorld, pose, width, height, preset });
    const center = projectWorldPoint({ point: subject.cardCenterWorld, pose, width, height, preset });

    const isVisibleToCamera = top.isInFront && bottom.isInFront && center.isInFront;
    const verticalGate = isVisibleToCamera
        ? smoothstep(preset.safeTopEnter, preset.safeTopReady, top.y)
        : 0;
    const horizontalGate = isVisibleToCamera
        ? inverseSmoothstep(
            preset.focusInnerHalfWidth,
            preset.focusOuterHalfWidth,
            Math.abs(center.x - 0.5),
        )
        : 0;
    const cardPixelHeight = Math.abs(bottom.y - top.y) * height;
    const readabilityGate = isVisibleToCamera
        ? smoothstep(
            preset.minReadableCardPx,
            preset.targetReadableCardPx,
            cardPixelHeight,
        )
        : 0;

    const gate = Math.min(verticalGate, horizontalGate, readabilityGate);
    const progress = smoothstep(preset.gateStart, preset.gateEnd, gate);

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

export const findProjectionActivationFrame = ({
    cacheKey,
    searchStartFrame,
    searchEndFrame,
    subject,
    width,
    height,
    preset = DEFAULT_PROJECTION_GATE_PRESET,
    getPoseForFrame,
}: PresentationActivationSearch): number | null => {
    const key = getActivationCacheKey({
        cacheKey,
        searchStartFrame,
        searchEndFrame,
        subject,
        width,
        height,
        preset,
    });
    const cached = activationFrameCache.get(key);
    if (cached !== undefined) {
        return cached;
    }

    for (let frame = searchStartFrame; frame <= searchEndFrame; frame++) {
        const state = getProjectionPresentationState({
            pose: getPoseForFrame(frame),
            subject,
            width,
            height,
            preset,
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

export { DEFAULT_PROJECTION_GATE_PRESET };
