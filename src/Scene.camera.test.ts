import test from "node:test";
import assert from "node:assert/strict";
import {
    getCameraState,
    getCinematicCameraState,
    getSceneLayoutMetrics,
    milestones,
} from "./Scene";

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
