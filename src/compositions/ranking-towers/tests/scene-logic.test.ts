import test from "node:test";
import assert from "node:assert/strict";

import {
    baseDurationInFrames,
    durationInFrames,
    FINAL_CAMERA_SLOWDOWN_FACTOR,
    FINAL_CAMERA_SLOWDOWN_START_FRAME,
    getCameraState,
    getIntroCameraState,
    getTowerFrameState,
    getTowerRenderMode,
    INTRO_DURATION_IN_FRAMES,
    milestones,
    sequenceCompleteFrame,
} from "../scene/scene-logic";

test("canonical composition path exposes ranking tower scene logic", () => {
    assert.equal(getTowerRenderMode(milestones[0].arriveFrame + 10, 0), "full");
});

test("frame state computes focus and render modes in one pass", () => {
    const frameState = getTowerFrameState(milestones[0].arriveFrame + 10);
    const lastMode = frameState.renderModes[frameState.renderModes.length - 1];

    assert.equal(frameState.focusedIndex, 0);
    assert.equal(frameState.renderModes[0], "full");
    assert.equal(lastMode, "minimal");
});

test("frame state marks the cinematic tail explicitly", () => {
    const frameState = getTowerFrameState(sequenceCompleteFrame + 1);

    assert.equal(frameState.isCinematic, true);
    assert.ok(frameState.renderModes.every((mode) => mode === "cinematic"));
});

test("intro duration shifts the first tower milestone", () => {
    assert.equal(INTRO_DURATION_IN_FRAMES, 160);
    assert.equal(milestones[0].arriveFrame, INTRO_DURATION_IN_FRAMES);
});

test("duration includes the intro segment", () => {
    const baselineSlowdownStartFrame = FINAL_CAMERA_SLOWDOWN_START_FRAME - INTRO_DURATION_IN_FRAMES;
    const baselineBaseDuration = baseDurationInFrames - INTRO_DURATION_IN_FRAMES;
    const baselineDuration =
        baselineSlowdownStartFrame + (baselineBaseDuration - baselineSlowdownStartFrame) * FINAL_CAMERA_SLOWDOWN_FACTOR;

    assert.equal(durationInFrames - baselineDuration, INTRO_DURATION_IN_FRAMES);
});

test("frame state exposes intro segment at the start of the composition", () => {
    const frameState = getTowerFrameState(0);

    assert.equal(frameState.isIntro, true);
    assert.equal(frameState.isCinematic, false);
});

test("intro camera hands off to the first main camera frame without a jump", () => {
    const introEnd = getIntroCameraState(INTRO_DURATION_IN_FRAMES);
    const mainStart = getCameraState(milestones[0].arriveFrame);

    assert.deepEqual(introEnd, {
        camX: mainStart.camX,
        camY: mainStart.camY,
        camZ: 55 + mainStart.camZOffset,
        lookX: mainStart.lookX,
        lookY: mainStart.lookY,
        lookZ: 10,
    });
});
