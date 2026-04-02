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
const BIO_STELE_CAMERA_OFFSET_X = -2.2;
const BIO_STELE_CAMERA_OFFSET_Y = 4.8;
const BIO_STELE_CAMERA_OFFSET_Z = 2.8;
const BIO_STELE_LOOK_OFFSET_X = -1.4;
const BIO_STELE_LOOK_OFFSET_Y = 22.4;
let lastResolvedCameraPoseFrame: number | null = null;
let lastResolvedCameraPose: ResolvedCameraPose | null = null;

const applyBiographyCameraFit = (pose: ResolvedCameraPose): ResolvedCameraPose => ({
    camX: pose.camX + BIO_STELE_CAMERA_OFFSET_X,
    camY: pose.camY + BIO_STELE_CAMERA_OFFSET_Y,
    camZ: pose.camZ + BIO_STELE_CAMERA_OFFSET_Z,
    lookX: pose.lookX + BIO_STELE_LOOK_OFFSET_X,
    lookY: pose.lookY + BIO_STELE_LOOK_OFFSET_Y,
    lookZ: pose.lookZ,
});

export const getResolvedCameraPose = (frame: number): ResolvedCameraPose => {
    if (lastResolvedCameraPoseFrame === frame && lastResolvedCameraPose) {
        return lastResolvedCameraPose;
    }

    const cameraFrame = getCameraTimelineFrame(frame);
    let pose: ResolvedCameraPose;

    if (isIntroFrame(cameraFrame)) {
        pose = applyBiographyCameraFit(getIntroCameraState(cameraFrame));
    } else if (cameraFrame <= sequenceCompleteFrame) {
        const state = getCameraState(cameraFrame);

        pose = applyBiographyCameraFit({
            camX: state.camX,
            camY: state.camY,
            camZ: 55 + (state.camZOffset || 0),
            lookX: state.lookX,
            lookY: state.lookY,
            lookZ: 10,
        });
    } else {
        pose = applyBiographyCameraFit(getCinematicCameraState(cameraFrame - sequenceCompleteFrame));
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
        cacheKey: "richest-women/rail-focus-presentation/v1",
        preset: CAMERA_PRESENTATION_PRESET,
        getPoseForFrame: getResolvedCameraPose,
    });
};

export { getActivatedPresentationProgress };
