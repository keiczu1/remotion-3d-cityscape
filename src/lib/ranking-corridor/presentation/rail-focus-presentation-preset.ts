import { type PresentationPreset } from "./projection-gate";

export const RAIL_FOCUS_PROJECTION_GATE_PRESET = {
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
} satisfies PresentationPreset;
