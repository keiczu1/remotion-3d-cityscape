import {
    type SceneActBoundaries,
    type ScenePresetTimingPlan,
    type SceneTimingMilestone,
    type SharedScenePresetTimingOptions,
} from "./types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const assertItemCountWithinRange = (
    itemCount: number,
    supportedCountRange: readonly [number, number],
) => {
    const [minCount, maxCount] = supportedCountRange;

    if (itemCount < minCount || itemCount > maxCount) {
        throw new Error(
            `Scene preset timing does not support itemCount=${itemCount}. Supported range: ${minCount}-${maxCount}.`,
        );
    }
};

const assertDurationWithinBand = (
    durationInFrames: number,
    targetDurationBandSeconds: readonly [number, number],
    supportedFps: number,
) => {
    const durationSeconds = durationInFrames / supportedFps;
    const [minSeconds, maxSeconds] = targetDurationBandSeconds;

    if (durationSeconds < minSeconds || durationSeconds > maxSeconds) {
        throw new Error(
            `Scene preset timing produced duration ${durationSeconds.toFixed(2)}s outside target band ${minSeconds}-${maxSeconds}s.`,
        );
    }
};

const LEGACY_SCENE_BOUNDARY_RATIOS = {
    scene1End: 10 / 39,
    scene2End: 25 / 39,
    scene3End: 38 / 39,
} as const;

const getSceneActBoundaries = (itemCount: number): SceneActBoundaries => {
    const maxIndex = Math.max(0, itemCount - 1);
    const scene1EndIndex = clamp(Math.round(maxIndex * LEGACY_SCENE_BOUNDARY_RATIOS.scene1End), 0, maxIndex);
    const scene2EndIndex = clamp(Math.round(maxIndex * LEGACY_SCENE_BOUNDARY_RATIOS.scene2End), scene1EndIndex + 1, maxIndex);
    const scene3EndIndex = clamp(Math.round(maxIndex * LEGACY_SCENE_BOUNDARY_RATIOS.scene3End), scene2EndIndex + 1, maxIndex);

    return {
        scene1EndIndex,
        scene2EndIndex,
        scene3EndIndex: Math.min(scene3EndIndex, maxIndex),
        finaleIndex: maxIndex,
    };
};

const easeInOut = (value: number) => {
    const clamped = clamp(value, 0, 1);
    return clamped * clamped * (3 - 2 * clamped);
};

const getAdaptiveFrames = ({
    sourceFrames,
    sourceItemCount,
    itemCount,
    exponent,
    minFrames,
}: {
    sourceFrames: number;
    sourceItemCount: number;
    itemCount: number;
    exponent: number;
    minFrames: number;
}) => {
    const scale = Math.pow(sourceItemCount / Math.max(itemCount, 1), exponent);
    return clamp(Math.round(sourceFrames * scale), minFrames, sourceFrames);
};

const getWinnerHoldFrames = ({
    baseHoldFrames,
    sourceWinnerHoldFrames,
    adaptiveWinnerHoldFrames,
    sourceItemCount,
    itemCount,
    exponent,
}: {
    baseHoldFrames: number;
    sourceWinnerHoldFrames?: number;
    adaptiveWinnerHoldFrames?: number;
    sourceItemCount: number;
    itemCount: number;
    exponent: number;
}) => {
    const sourceFrames = sourceWinnerHoldFrames ?? Math.round(baseHoldFrames * 1.9);
    const minFrames = adaptiveWinnerHoldFrames ?? Math.max(Math.round(baseHoldFrames * 1.4), baseHoldFrames);

    return getAdaptiveFrames({
        sourceFrames,
        sourceItemCount,
        itemCount,
        exponent,
        minFrames,
    });
};

export const buildSharedScenePresetTimingPlan = (options: SharedScenePresetTimingOptions): ScenePresetTimingPlan => {
    const {
        itemCount,
        introDurationFrames,
        supportedFps,
        sourceItemCount,
        supportedCountRange,
        targetDurationBandSeconds,
        baseMoveFrames,
        baseHoldFrames,
        sourceWinnerHoldFrames,
        adaptiveWinnerHoldFrames,
        adaptiveMinMoveFrames,
        adaptiveMinHoldFrames,
        adaptiveTopWindowCount,
        adaptiveTopWindowHoldMultiplier,
        moveScaleExponent,
        holdScaleExponent,
        finalCinematicFrames,
        legacySlowdownStartBaseFrames,
        legacySlowdownFactor,
        strategy,
        finaleTailPolicy,
    } = options;

    assertItemCountWithinRange(itemCount, supportedCountRange);

    const moveFrames =
        strategy === "source-compatible"
            ? baseMoveFrames
            : getAdaptiveFrames({
                  sourceFrames: baseMoveFrames,
                  sourceItemCount,
                  itemCount,
                  exponent: moveScaleExponent,
                  minFrames: adaptiveMinMoveFrames,
              });

    const holdFrames =
        strategy === "source-compatible"
            ? baseHoldFrames
            : getAdaptiveFrames({
                  sourceFrames: baseHoldFrames,
                  sourceItemCount,
                  itemCount,
                  exponent: holdScaleExponent,
                  minFrames: adaptiveMinHoldFrames,
              });

    const winnerHoldFrames =
        strategy === "source-compatible"
            ? sourceWinnerHoldFrames ?? baseHoldFrames
            : getWinnerHoldFrames({
                  baseHoldFrames,
                  sourceWinnerHoldFrames,
                  adaptiveWinnerHoldFrames,
                  sourceItemCount,
                  itemCount,
                  exponent: holdScaleExponent,
              });

    const topWindowCount = strategy === "source-compatible" ? 1 : Math.min(adaptiveTopWindowCount, Math.max(itemCount - 1, 0));
    let frame = introDurationFrames;
    const milestones: SceneTimingMilestone[] = [];

    for (let index = 0; index < itemCount; index++) {
        const rank = itemCount - index;
        const isWinner = index === itemCount - 1;
        const transitionFrames = index === 0 ? 0 : moveFrames;
        let pauseFrames = isWinner ? winnerHoldFrames : holdFrames;
        let phase: SceneTimingMilestone["phase"] = "main-pass";

        if (!isWinner && topWindowCount > 0 && rank <= topWindowCount) {
            const topWindowProgress = easeInOut((topWindowCount - rank + 1) / topWindowCount);
            pauseFrames = Math.round(holdFrames * (1 + adaptiveTopWindowHoldMultiplier * topWindowProgress));
            phase = "top-window";
        }

        if (isWinner) {
            phase = "winner";
        }

        const arriveFrame = frame + transitionFrames;
        const leaveFrame = arriveFrame + pauseFrames;
        milestones.push({
            index,
            rank,
            moveFrames: transitionFrames,
            holdFrames: pauseFrames,
            arriveFrame,
            leaveFrame,
            phase,
        });
        frame = leaveFrame;
    }

    const sequenceCompleteFrame = milestones[milestones.length - 1]?.leaveFrame ?? introDurationFrames;
    const cinematicTailFrames = finaleTailPolicy === "legacy-cinematic-slowdown" ? finalCinematicFrames + 60 : 0;
    const baseDurationInFrames = sequenceCompleteFrame + cinematicTailFrames;
    const finalCameraSlowdownStartFrame =
        finaleTailPolicy === "legacy-cinematic-slowdown"
            ? legacySlowdownStartBaseFrames + introDurationFrames
            : baseDurationInFrames;
    const slowedTailFrames = baseDurationInFrames - finalCameraSlowdownStartFrame;
    const durationInFrames =
        finaleTailPolicy === "legacy-cinematic-slowdown"
            ? finalCameraSlowdownStartFrame + slowedTailFrames * legacySlowdownFactor
            : baseDurationInFrames;

    if (strategy === "adaptive-standard") {
        assertDurationWithinBand(durationInFrames, targetDurationBandSeconds, supportedFps);
    }

    return {
        strategy,
        finaleTailPolicy,
        itemCount,
        supportedFps,
        supportedCountRange,
        targetDurationBandSeconds,
        moveFrames,
        holdFrames,
        winnerHoldFrames,
        topWindowCount,
        milestones,
        sequenceCompleteFrame,
        baseDurationInFrames,
        durationInFrames,
        finalCameraSlowdownStartFrame,
        finalCameraSlowdownFactor: finaleTailPolicy === "legacy-cinematic-slowdown" ? legacySlowdownFactor : 1,
        finalCinematicFrames: cinematicTailFrames,
        actBoundaries: getSceneActBoundaries(itemCount),
    };
};

export const getCameraTimelineFrameFromPlan = (plan: ScenePresetTimingPlan, frame: number) => {
    if (plan.finaleTailPolicy !== "legacy-cinematic-slowdown" || frame <= plan.finalCameraSlowdownStartFrame) {
        return frame;
    }

    const slowedFrame =
        plan.finalCameraSlowdownStartFrame +
        (frame - plan.finalCameraSlowdownStartFrame) / plan.finalCameraSlowdownFactor;

    return Math.min(plan.baseDurationInFrames, slowedFrame);
};
