import test from "node:test";
import assert from "node:assert/strict";

import {
    durationInFrames,
    FINAL_CAMERA_SLOWDOWN_FACTOR,
    getCameraState,
    getCameraTimelineFrame,
    getFocusedSteleIndex,
    milestones,
    sequenceCompleteFrame,
} from "../scene/scene-logic";

test("main-pass timing keeps short cuts and readable four-second holds", () => {
    const current = milestones[1];
    const previous = milestones[0];

    assert.equal(current.arriveFrame - previous.leaveFrame, 36);
    assert.equal(current.leaveFrame - current.arriveFrame, 240);
});

test("focus stays on the current stele during the rail move and switches on arrival", () => {
    const current = milestones[10];
    const next = milestones[11];
    const transitionMidFrame = current.leaveFrame + Math.floor((next.arriveFrame - current.leaveFrame) / 2);

    assert.equal(getFocusedSteleIndex(current.leaveFrame), current.index);
    assert.equal(getFocusedSteleIndex(transitionMidFrame), current.index);
    assert.equal(getFocusedSteleIndex(next.arriveFrame), next.index);
});

test("camera holds on one stele and only drifts in a gentle orbit during the readable window", () => {
    const target = milestones[10];
    const earlyFrame = target.arriveFrame + 60;
    const midFrame = target.arriveFrame + 120;
    const lateFrame = target.arriveFrame + 180;

    const earlyState = getCameraState(earlyFrame);
    const midState = getCameraState(midFrame);
    const lateState = getCameraState(lateFrame);
    const camXSpan = Math.max(earlyState.camX, midState.camX, lateState.camX) -
        Math.min(earlyState.camX, midState.camX, lateState.camX);
    const camZSpan = Math.max(earlyState.camZOffset, midState.camZOffset, lateState.camZOffset) -
        Math.min(earlyState.camZOffset, midState.camZOffset, lateState.camZOffset);

    assert.equal(getFocusedSteleIndex(earlyFrame), target.index);
    assert.equal(getFocusedSteleIndex(midFrame), target.index);
    assert.equal(getFocusedSteleIndex(lateFrame), target.index);
    assert.ok(Math.abs(earlyState.lookX - target.xCenter) <= 0.6);
    assert.ok(Math.abs(midState.lookX - target.xCenter) <= 0.4);
    assert.ok(Math.abs(lateState.lookX - target.xCenter) <= 0.4);
    assert.ok(camXSpan >= 0.4 && camXSpan <= 3);
    assert.ok(camZSpan >= 0.3 && camZSpan <= 1.5);
});

test("camera performs a short rail move before arrival and then settles into the hold orbit", () => {
    const target = milestones[10];
    const previous = milestones[9];
    const approachFrame = previous.leaveFrame + 6;
    const midRailFrame = previous.leaveFrame + 18;
    const revealFrame = target.arriveFrame;
    const settledFrame = target.arriveFrame + 42;

    const approachState = getCameraState(approachFrame);
    const midRailState = getCameraState(midRailFrame);
    const revealState = getCameraState(revealFrame);
    const settledState = getCameraState(settledFrame);

    assert.equal(getFocusedSteleIndex(approachFrame), previous.index);
    assert.equal(getFocusedSteleIndex(midRailFrame), previous.index);
    assert.equal(getFocusedSteleIndex(revealFrame), target.index);
    assert.ok(approachState.camX < midRailState.camX);
    assert.ok(midRailState.camX < revealState.camX);
    assert.ok(settledState.camX < revealState.camX);
    assert.ok(approachState.camZOffset < midRailState.camZOffset);
    assert.ok(midRailState.camZOffset < revealState.camZOffset);
    assert.ok(settledState.camZOffset < revealState.camZOffset);
});

test("duration ends with the ranking sequence and does not keep a slowed cinematic tail", () => {
    assert.equal(durationInFrames, sequenceCompleteFrame);
    assert.equal(FINAL_CAMERA_SLOWDOWN_FACTOR, 1);
    assert.equal(getCameraTimelineFrame(durationInFrames), durationInFrames);
});
