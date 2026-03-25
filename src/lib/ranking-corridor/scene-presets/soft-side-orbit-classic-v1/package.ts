import { type ScenePresetPackageContract } from "../types";

export const SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE = {
    id: "soft-side-orbit-classic-v1",
    motionContract: "locked",
    timingContract: "adaptive",
    supportedFps: 60,
    sourceItemCount: 40,
    supportedCountRange: [20, 150] as const,
    targetDurationBandSeconds: [140, 550] as const,
    timingPolicyId: "soft-side-orbit-classic-v1/adaptive-v1",
    defaultFinaleTailPolicy: "off" as const,
} satisfies ScenePresetPackageContract;
