import { type ScenePresetPackageContract } from "../types";

export const RAIL_FOCUS_VIP_FINALE_V1_PACKAGE = {
    id: "rail-focus-vip-finale-v1",
    motionContract: "locked",
    timingContract: "adaptive",
    supportedFps: 60,
    sourceItemCount: 40,
    supportedCountRange: [20, 150] as const,
    targetDurationBandSeconds: [130, 480] as const,
    timingPolicyId: "rail-focus-vip-finale-v1/adaptive-v1",
    defaultFinaleTailPolicy: "off" as const,
} satisfies ScenePresetPackageContract;
