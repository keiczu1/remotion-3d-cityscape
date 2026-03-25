import { buildSharedScenePresetTimingPlan } from "../shared-timing";
import { type FinaleTailPolicy, type ScenePresetTimingPlan, type ScenePresetTimingStrategy } from "../types";
import { SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE } from "./package";

type SoftSideOrbitTimingOptions = {
    itemCount: number;
    introDurationFrames: number;
    strategy: ScenePresetTimingStrategy;
    finaleTailPolicy: FinaleTailPolicy;
};

const LEGACY_SLOWDOWN_START_BASE_FRAMES = 4 * 60 * 60 + 42 * 60;
const FINAL_CINEMATIC_FRAMES = 300 + 540 + 180 + 600;

export const buildSoftSideOrbitClassicTimingPlan = ({
    itemCount,
    introDurationFrames,
    strategy,
    finaleTailPolicy,
}: SoftSideOrbitTimingOptions): ScenePresetTimingPlan => {
    return buildSharedScenePresetTimingPlan({
        itemCount,
        introDurationFrames,
        supportedFps: SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE.supportedFps,
        sourceItemCount: SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE.sourceItemCount,
        supportedCountRange: SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE.supportedCountRange,
        targetDurationBandSeconds: SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE.targetDurationBandSeconds,
        baseMoveFrames: 80,
        baseHoldFrames: 320,
        adaptiveWinnerHoldFrames: 300,
        adaptiveMinMoveFrames: 48,
        adaptiveMinHoldFrames: 140,
        adaptiveTopWindowCount: 10,
        adaptiveTopWindowHoldMultiplier: 0.24,
        moveScaleExponent: 0.58,
        holdScaleExponent: 0.5,
        finalCinematicFrames: FINAL_CINEMATIC_FRAMES,
        legacySlowdownStartBaseFrames: LEGACY_SLOWDOWN_START_BASE_FRAMES,
        legacySlowdownFactor: 3,
        strategy,
        finaleTailPolicy,
    });
};
