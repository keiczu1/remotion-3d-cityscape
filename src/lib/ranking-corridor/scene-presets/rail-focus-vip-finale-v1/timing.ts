import { buildSharedScenePresetTimingPlan } from "../shared-timing";
import { type FinaleTailPolicy, type ScenePresetTimingPlan, type ScenePresetTimingStrategy } from "../types";
import { RAIL_FOCUS_VIP_FINALE_V1_PACKAGE } from "./package";

type RailFocusTimingOptions = {
    itemCount: number;
    introDurationFrames: number;
    strategy: ScenePresetTimingStrategy;
    finaleTailPolicy: FinaleTailPolicy;
};

const LEGACY_SLOWDOWN_START_BASE_FRAMES = Math.floor((4 * 60 * 60 + 42 * 60) * 0.9);
const FINAL_CINEMATIC_FRAMES = 300 + 540 + 180 + 600;

export const buildRailFocusVipFinaleTimingPlan = ({
    itemCount,
    introDurationFrames,
    strategy,
    finaleTailPolicy,
}: RailFocusTimingOptions): ScenePresetTimingPlan => {
    return buildSharedScenePresetTimingPlan({
        itemCount,
        introDurationFrames,
        supportedFps: RAIL_FOCUS_VIP_FINALE_V1_PACKAGE.supportedFps,
        sourceItemCount: RAIL_FOCUS_VIP_FINALE_V1_PACKAGE.sourceItemCount,
        supportedCountRange: RAIL_FOCUS_VIP_FINALE_V1_PACKAGE.supportedCountRange,
        targetDurationBandSeconds: RAIL_FOCUS_VIP_FINALE_V1_PACKAGE.targetDurationBandSeconds,
        baseMoveFrames: 72,
        baseHoldFrames: 288,
        sourceWinnerHoldFrames: 600,
        adaptiveWinnerHoldFrames: 300,
        adaptiveMinMoveFrames: 42,
        adaptiveMinHoldFrames: 132,
        adaptiveTopWindowCount: 10,
        adaptiveTopWindowHoldMultiplier: 0.4,
        moveScaleExponent: 0.62,
        holdScaleExponent: 0.52,
        finalCinematicFrames: FINAL_CINEMATIC_FRAMES,
        legacySlowdownStartBaseFrames: LEGACY_SLOWDOWN_START_BASE_FRAMES,
        legacySlowdownFactor: 3,
        strategy,
        finaleTailPolicy,
    });
};
