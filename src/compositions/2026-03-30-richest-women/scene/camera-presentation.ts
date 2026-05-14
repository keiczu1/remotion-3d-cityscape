import {
    findProjectionActivationFrame,
    getActivatedPresentationProgress,
    getProjectionPresentationState,
    type PresentationState,
    type PresentationSubjectMetrics,
    type ResolvedCameraPose,
} from "../../../lib/ranking-corridor/presentation/projection-gate";
import {
    applyBiographySteleCameraFit,
    BIOGRAPHY_STELE_PROJECTION_GATE_PRESET,
} from "../../../lib/ranking-corridor/presentation/biography-stele-focus-presentation-preset";
import { BIOGRAPHY_STELE_FOCUS_HOLD_V1_PACKAGE } from "../../../lib/ranking-corridor/scene-presets/biography-stele-focus-hold-v1/package";
import {
    getCameraState,
    getCameraTimelineFrame,
    getCinematicCameraState,
    getIntroCameraState,
    isIntroFrame,
    sequenceCompleteFrame,
} from "./scene-logic";

type PresentationActivationSearch = {
    searchStartFrame: number;
    searchEndFrame: number;
    subject: PresentationSubjectMetrics;
    width: number;
    height: number;
};

export const CAMERA_PRESENTATION_PRESET = BIOGRAPHY_STELE_PROJECTION_GATE_PRESET;
let lastResolvedCameraPoseFrame: number | null = null;
let lastResolvedCameraPose: ResolvedCameraPose | null = null;

export const getResolvedCameraPose = (frame: number): ResolvedCameraPose => {
    if (lastResolvedCameraPoseFrame === frame && lastResolvedCameraPose) {
        return lastResolvedCameraPose;
    }

    const cameraFrame = getCameraTimelineFrame(frame);
    let pose: ResolvedCameraPose;

    if (isIntroFrame(cameraFrame)) {
        pose = applyBiographySteleCameraFit(getIntroCameraState(cameraFrame));
    } else if (cameraFrame <= sequenceCompleteFrame) {
        const state = getCameraState(cameraFrame);

        pose = applyBiographySteleCameraFit({
            camX: state.camX,
            camY: state.camY,
            camZ: 55 + (state.camZOffset || 0),
            lookX: state.lookX,
            lookY: state.lookY,
            lookZ: 10,
        });
    } else {
        pose = applyBiographySteleCameraFit(getCinematicCameraState(cameraFrame - sequenceCompleteFrame));
    }

    lastResolvedCameraPoseFrame = frame;
    lastResolvedCameraPose = pose;

    return pose;
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
    return getProjectionPresentationState({
        pose: getResolvedCameraPose(frame),
        subject,
        width,
        height,
        preset: CAMERA_PRESENTATION_PRESET,
    });
};

export const findPresentationActivationFrame = (search: PresentationActivationSearch): number | null => {
    return findProjectionActivationFrame({
        ...search,
        cacheKey: `${BIOGRAPHY_STELE_FOCUS_HOLD_V1_PACKAGE.id}/projection-activation`,
        preset: CAMERA_PRESENTATION_PRESET,
        getPoseForFrame: getResolvedCameraPose,
    });
};

export { getActivatedPresentationProgress };
