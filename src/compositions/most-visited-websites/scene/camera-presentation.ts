import {
    findProjectionActivationFrame,
    getActivatedPresentationProgress,
    getProjectionPresentationState,
    type PresentationState,
    type PresentationSubjectMetrics,
    type ResolvedCameraPose,
} from "../../../lib/ranking-corridor/presentation/projection-gate";
import { RAIL_FOCUS_PROJECTION_GATE_PRESET } from "../../../lib/ranking-corridor/presentation/rail-focus-presentation-preset";
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

export const CAMERA_PRESENTATION_PRESET = RAIL_FOCUS_PROJECTION_GATE_PRESET;

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
        cacheKey: "most-visited-websites/rail-focus-presentation/v1",
        preset: CAMERA_PRESENTATION_PRESET,
        getPoseForFrame: getResolvedCameraPose,
    });
};

export { getActivatedPresentationProgress };
