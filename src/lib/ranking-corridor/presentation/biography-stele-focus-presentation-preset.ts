import {
    type PresentationPreset,
    type ResolvedCameraPose,
} from "./projection-gate";
import { RAIL_FOCUS_PROJECTION_GATE_PRESET } from "./rail-focus-presentation-preset";

export const BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS = {
    camX: -2.2,
    camY: 4.8,
    camZ: 2.8,
    lookX: -1.4,
    lookY: 22.4,
} as const;

export const BIOGRAPHY_STELE_PROJECTION_GATE_PRESET = {
    ...RAIL_FOCUS_PROJECTION_GATE_PRESET,
} satisfies PresentationPreset;

export const applyBiographySteleCameraFit = (pose: ResolvedCameraPose): ResolvedCameraPose => ({
    camX: pose.camX + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.camX,
    camY: pose.camY + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.camY,
    camZ: pose.camZ + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.camZ,
    lookX: pose.lookX + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.lookX,
    lookY: pose.lookY + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.lookY,
    lookZ: pose.lookZ,
});
