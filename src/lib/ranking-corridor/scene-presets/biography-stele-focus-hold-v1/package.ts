import { type ScenePresetPackageContract } from "../types";

export const BIOGRAPHY_STELE_FOCUS_HOLD_V1_PACKAGE = {
    id: "biography-stele-focus-hold-v1",
    motionContract: "locked",
    timingContract: "source-compatible-only",
    supportedFps: 60,
    sourceItemCount: 93,
    supportedCountRange: [20, 150] as const,
    targetDurationBandSeconds: [218, 1622] as const,
    timingPolicyId: "biography-stele-focus-hold-v1/source-compatible-v1",
    defaultFinaleTailPolicy: "off" as const,
} satisfies ScenePresetPackageContract;
