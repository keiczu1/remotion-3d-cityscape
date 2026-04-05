export type ScenePresetTimingStrategy = "source-compatible" | "adaptive-standard";

export type FinaleTailPolicy = "legacy-cinematic-slowdown" | "off";
export type SupportedFps = 60;
export type SupportedCountRange = readonly [number, number];
export type TargetDurationBandSeconds = readonly [number, number];

export type SceneTimingPhase = "main-pass" | "top-window" | "winner";

export type SceneTimingMilestone = {
    index: number;
    rank: number;
    moveFrames: number;
    holdFrames: number;
    arriveFrame: number;
    leaveFrame: number;
    phase: SceneTimingPhase;
};

export type SceneActBoundaries = {
    scene1EndIndex: number;
    scene2EndIndex: number;
    scene3EndIndex: number;
    finaleIndex: number;
};

export type ScenePresetTimingPlan = {
    strategy: ScenePresetTimingStrategy;
    finaleTailPolicy: FinaleTailPolicy;
    itemCount: number;
    supportedFps: SupportedFps;
    supportedCountRange: SupportedCountRange;
    targetDurationBandSeconds: TargetDurationBandSeconds;
    moveFrames: number;
    holdFrames: number;
    winnerHoldFrames: number;
    topWindowCount: number;
    milestones: SceneTimingMilestone[];
    sequenceCompleteFrame: number;
    baseDurationInFrames: number;
    durationInFrames: number;
    finalCameraSlowdownStartFrame: number;
    finalCameraSlowdownFactor: number;
    finalCinematicFrames: number;
    actBoundaries: SceneActBoundaries;
};

export type SharedScenePresetTimingOptions = {
    itemCount: number;
    introDurationFrames: number;
    supportedFps: SupportedFps;
    sourceItemCount: number;
    supportedCountRange: SupportedCountRange;
    targetDurationBandSeconds: TargetDurationBandSeconds;
    baseMoveFrames: number;
    baseHoldFrames: number;
    sourceWinnerHoldFrames?: number;
    adaptiveWinnerHoldFrames?: number;
    adaptiveMinMoveFrames: number;
    adaptiveMinHoldFrames: number;
    adaptiveTopWindowCount: number;
    adaptiveTopWindowHoldMultiplier: number;
    moveScaleExponent: number;
    holdScaleExponent: number;
    finalCinematicFrames: number;
    legacySlowdownStartBaseFrames: number;
    legacySlowdownFactor: number;
    strategy: ScenePresetTimingStrategy;
    finaleTailPolicy: FinaleTailPolicy;
};

export type ScenePresetPackageContract = {
    id: string;
    motionContract: "locked";
    timingContract: "adaptive" | "source-compatible-only";
    supportedFps: SupportedFps;
    sourceItemCount: number;
    supportedCountRange: SupportedCountRange;
    targetDurationBandSeconds: TargetDurationBandSeconds;
    timingPolicyId: string;
    defaultFinaleTailPolicy: FinaleTailPolicy;
};
