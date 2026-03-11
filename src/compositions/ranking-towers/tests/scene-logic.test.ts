import test from "node:test";
import assert from "node:assert/strict";

import { getTowerFrameState, getTowerRenderMode, milestones, sequenceCompleteFrame } from "../scene/scene-logic";

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
