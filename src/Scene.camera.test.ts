import test from "node:test";
import assert from "node:assert/strict";
import {
    durationInFrames,
    getCameraTimelineFrame,
    getCameraState,
    getCinematicCameraState,
    FINAL_CAMERA_SLOWDOWN_FACTOR,
    FINAL_CAMERA_SLOWDOWN_START_FRAME,
    getSceneLayoutMetrics,
    getTowerRenderMode,
    getFocusedTowerIndex,
    shouldPreloadTowerAssets,
    milestones,
} from "./scene-logic";

test("camera keeps a softer side angle and gently orbits during a tower pause", () => {
    const current = milestones[0];
    const next = milestones[1];
    const midPauseFrame =
        current.arriveFrame + Math.floor((current.leaveFrame - current.arriveFrame) / 2);

    const arriveState = getCameraState(current.arriveFrame);
    const midPauseState = getCameraState(midPauseFrame);
    const leaveState = getCameraState(current.leaveFrame);
    const midTransitionState = getCameraState(
        current.leaveFrame + Math.floor((next.arriveFrame - current.leaveFrame) / 2)
    );
    const nextArriveState = getCameraState(next.arriveFrame);

    const arriveOffsetX = arriveState.camX - arriveState.lookX;
    assert.ok(arriveOffsetX >= 18 && arriveOffsetX <= 30);

    assert.ok(Math.abs(midPauseState.camX - arriveState.camX) >= 3.7);
    assert.ok(Math.abs(midPauseState.camZOffset - arriveState.camZOffset) >= 0.75);

    assert.ok(leaveState.camX - leaveState.lookX >= 18 && leaveState.camX - leaveState.lookX <= 30);
    assert.ok(midTransitionState.camX - midTransitionState.lookX >= 18 && midTransitionState.camX - midTransitionState.lookX <= 30);
    assert.ok(nextArriveState.camX - nextArriveState.lookX >= 18 && nextArriveState.camX - nextArriveState.lookX <= 30);
});

test("final cinematic flies above the row from big to small, then returns from the front side", () => {
    const earlyOverview = getCinematicCameraState(360);
    const lateOverview = getCinematicCameraState(720);
    const returnPassStart = getCinematicCameraState(1020);
    const returnPassEnd = getCinematicCameraState(1440);

    assert.ok(earlyOverview.camX > lateOverview.camX);
    assert.ok(earlyOverview.camY >= 180);
    assert.ok(lateOverview.camY >= 180);
    assert.ok(earlyOverview.camZ > 120);
    assert.ok(lateOverview.camZ > 120);

    assert.ok(returnPassEnd.camX > returnPassStart.camX);
    assert.ok(returnPassStart.camY < earlyOverview.camY);
    assert.ok(returnPassEnd.camY < earlyOverview.camY);
    assert.ok(returnPassStart.camZ > 100);
    assert.ok(returnPassEnd.camZ > 100);
});

test("road stays behind tower footprints to avoid z-fighting in the final flyover", () => {
    const layout = getSceneLayoutMetrics();

    assert.equal(layout.roadRange, null);
});

test("focus stays on the current tower and hands off to the next tower during transitions", () => {
    const current = milestones[0];
    const next = milestones[1];

    assert.equal(getFocusedTowerIndex(current.arriveFrame), current.index);
    assert.equal(getFocusedTowerIndex(current.leaveFrame - 1), current.index);
    assert.equal(getFocusedTowerIndex(next.arriveFrame), next.index);

    const midTransitionFrame =
        current.leaveFrame + Math.floor((next.arriveFrame - current.leaveFrame) / 2);
    assert.equal(getFocusedTowerIndex(midTransitionFrame), next.index);
});

test("active and adjacent towers stay detailed while distant towers are minimized", () => {
    const focusFrame = milestones[10].arriveFrame + 40;

    assert.equal(getTowerRenderMode(focusFrame, 10), "full");
    assert.equal(getTowerRenderMode(focusFrame, 9), "full");
    assert.equal(getTowerRenderMode(focusFrame, 12), "standby");
    assert.equal(getTowerRenderMode(focusFrame, 16), "minimal");
});

test("asset preloading starts before a tower reveal and stays enabled through the active window", () => {
    const target = milestones[8];
    const farEarlierFrame = milestones[4].arriveFrame;

    assert.equal(shouldPreloadTowerAssets(farEarlierFrame, target.index), false);
    assert.equal(shouldPreloadTowerAssets(target.arriveFrame - 30, target.index), true);
    assert.equal(shouldPreloadTowerAssets(target.arriveFrame + 10, target.index), true);
});

test("camera timeline slows down 3x from 4:42 until the end without changing earlier frames", () => {
    const offsetFrame = 90;

    assert.equal(getCameraTimelineFrame(FINAL_CAMERA_SLOWDOWN_START_FRAME - 1), FINAL_CAMERA_SLOWDOWN_START_FRAME - 1);
    assert.equal(getCameraTimelineFrame(FINAL_CAMERA_SLOWDOWN_START_FRAME), FINAL_CAMERA_SLOWDOWN_START_FRAME);
    assert.equal(
        getCameraTimelineFrame(FINAL_CAMERA_SLOWDOWN_START_FRAME + offsetFrame * FINAL_CAMERA_SLOWDOWN_FACTOR),
        FINAL_CAMERA_SLOWDOWN_START_FRAME + offsetFrame
    );
    assert.equal(getCameraTimelineFrame(durationInFrames), milestones[milestones.length - 1].leaveFrame + 1680);
});
