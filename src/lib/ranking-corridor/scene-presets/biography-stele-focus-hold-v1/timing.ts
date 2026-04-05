import { buildSharedScenePresetTimingPlan } from "../shared-timing";
import { type FinaleTailPolicy, type ScenePresetTimingPlan, type ScenePresetTimingStrategy } from "../types";
import { BIOGRAPHY_STELE_FOCUS_HOLD_V1_PACKAGE } from "./package";

type BiographySteleFocusHoldTimingOptions = {
    itemCount: number;
    introDurationFrames: number;
    strategy: ScenePresetTimingStrategy;
    finaleTailPolicy: FinaleTailPolicy;
};

const MAIN_PASS_MOVE_FRAMES = 108;
const MAIN_PASS_EXTRA_READ_HOLD_FRAMES = 300;
const MAIN_PASS_HOLD_FRAMES = 240 + MAIN_PASS_EXTRA_READ_HOLD_FRAMES;
const MAIN_PASS_WINNER_HOLD_FRAMES = 300 + MAIN_PASS_EXTRA_READ_HOLD_FRAMES;

export const buildBiographySteleFocusHoldTimingPlan = ({
    itemCount,
    introDurationFrames,
    strategy,
    finaleTailPolicy,
}: BiographySteleFocusHoldTimingOptions): ScenePresetTimingPlan => {
    if (strategy !== "source-compatible") {
        throw new Error(
            `${BIOGRAPHY_STELE_FOCUS_HOLD_V1_PACKAGE.id} supports only source-compatible timing; adaptive-standard requires a separate preset.`,
        );
    }

    return buildSharedScenePresetTimingPlan({
        itemCount,
        introDurationFrames,
        supportedFps: BIOGRAPHY_STELE_FOCUS_HOLD_V1_PACKAGE.supportedFps,
        sourceItemCount: BIOGRAPHY_STELE_FOCUS_HOLD_V1_PACKAGE.sourceItemCount,
        supportedCountRange: BIOGRAPHY_STELE_FOCUS_HOLD_V1_PACKAGE.supportedCountRange,
        targetDurationBandSeconds: BIOGRAPHY_STELE_FOCUS_HOLD_V1_PACKAGE.targetDurationBandSeconds,
        baseMoveFrames: MAIN_PASS_MOVE_FRAMES,
        baseHoldFrames: MAIN_PASS_HOLD_FRAMES,
        sourceWinnerHoldFrames: MAIN_PASS_WINNER_HOLD_FRAMES,
        adaptiveWinnerHoldFrames: MAIN_PASS_WINNER_HOLD_FRAMES,
        adaptiveMinMoveFrames: MAIN_PASS_MOVE_FRAMES,
        adaptiveMinHoldFrames: MAIN_PASS_HOLD_FRAMES,
        adaptiveTopWindowCount: 1,
        adaptiveTopWindowHoldMultiplier: 0,
        moveScaleExponent: 1,
        holdScaleExponent: 1,
        finalCinematicFrames: 0,
        legacySlowdownStartBaseFrames: 0,
        legacySlowdownFactor: 1,
        strategy,
        finaleTailPolicy,
    });
};
