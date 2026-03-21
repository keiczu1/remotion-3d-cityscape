import test from "node:test";
import assert from "node:assert/strict";

import { getPresentationState } from "../scene/camera-presentation";
import {
    baseDurationInFrames,
    durationInFrames,
    FINAL_CAMERA_SLOWDOWN_FACTOR,
    FINAL_CAMERA_SLOWDOWN_START_FRAME,
    getCinematicCameraState,
    getCameraState,
    getCameraTimelineFrame,
    getSteleFocusLockFrame,
    getFocusedSteleIndex,
    getIntroCameraState,
    getSteleFrameState,
    getSteleHeight,
    getSteleRenderMode,
    INTRO_DURATION_IN_FRAMES,
    isVipStele,
    milestones,
    sequenceCompleteFrame,
    shouldPreloadSteleAssets,
    STELE_ROW_Z,
    X_SPACING,
} from "../scene/scene-logic";
import { getSteleDashboardWorldMetrics } from "../components/stele-dashboard-layout";

test("dolly-push camera keeps a consistent side offset while translating through the first handoff", () => {
    const current = milestones[0];
    const next = milestones[1];
    const midPauseFrame = current.arriveFrame + Math.floor((current.leaveFrame - current.arriveFrame) / 2);
    const midTransitionFrame = current.leaveFrame + Math.floor((next.arriveFrame - current.leaveFrame) / 2);

    const arriveState = getCameraState(current.arriveFrame);
    const midPauseState = getCameraState(midPauseFrame);
    const leaveState = getCameraState(current.leaveFrame);
    const midTransitionState = getCameraState(midTransitionFrame);
    const nextArriveState = getCameraState(next.arriveFrame);

    assert.ok(Math.abs(arriveState.camX - arriveState.lookX) >= 12 && Math.abs(arriveState.camX - arriveState.lookX) <= 14);
    assert.ok(Math.abs(midPauseState.camX - midPauseState.lookX) >= 12 && Math.abs(midPauseState.camX - midPauseState.lookX) <= 14);
    assert.ok(Math.abs(leaveState.camX - leaveState.lookX) >= 12 && Math.abs(leaveState.camX - leaveState.lookX) <= 14);
    assert.ok(Math.abs(midTransitionState.camX - midTransitionState.lookX) >= 12 && Math.abs(midTransitionState.camX - midTransitionState.lookX) <= 14);
    assert.ok(Math.abs(nextArriveState.camX - nextArriveState.lookX) >= 12 && Math.abs(nextArriveState.camX - nextArriveState.lookX) <= 14);

    assert.ok(midPauseState.camX > arriveState.camX);
    assert.ok(leaveState.camX > midPauseState.camX);
    assert.ok(midTransitionState.camX > leaveState.camX);
    assert.equal(midPauseState.camZOffset, arriveState.camZOffset);
    assert.equal(leaveState.camZOffset, arriveState.camZOffset);
});

test("focus stays on the current stele and hands off during transitions", () => {
    const current = milestones[0];
    const next = milestones[1];
    const midTransitionFrame = current.leaveFrame + Math.floor((next.arriveFrame - current.leaveFrame) / 2);

    assert.equal(getFocusedSteleIndex(current.arriveFrame), current.index);
    assert.equal(getFocusedSteleIndex(current.leaveFrame - 1), current.index);
    assert.equal(getFocusedSteleIndex(midTransitionFrame), next.index);
    assert.equal(getFocusedSteleIndex(next.arriveFrame), next.index);
});

test("full detail covers a radius of two steles, then degrades to standby and minimal", () => {
    const focusFrame = milestones[10].arriveFrame + 40;

    assert.equal(getSteleRenderMode(focusFrame, 8), "full");
    assert.equal(getSteleRenderMode(focusFrame, 10), "full");
    assert.equal(getSteleRenderMode(focusFrame, 9), "full");
    assert.equal(getSteleRenderMode(focusFrame, 12), "full");
    assert.equal(getSteleRenderMode(focusFrame, 13), "standby");
    assert.equal(getSteleRenderMode(focusFrame, 16), "minimal");
});

test("asset preloading starts before a stele reveal and stays enabled through the active window", () => {
    const target = milestones[8];
    const farEarlierFrame = milestones[4].arriveFrame;

    assert.equal(shouldPreloadSteleAssets(farEarlierFrame, target.index), false);
    assert.equal(shouldPreloadSteleAssets(target.arriveFrame - 30, target.index), true);
    assert.equal(shouldPreloadSteleAssets(target.arriveFrame + 10, target.index), true);
});

test("frame state exposes intro and cinematic phases explicitly", () => {
    const introState = getSteleFrameState(0);
    const cinematicState = getSteleFrameState(sequenceCompleteFrame + 1);
    const cinematicModes = cinematicState.renderModes.filter((mode) => mode === "cinematic").length;
    const standbyModes = cinematicState.renderModes.filter((mode) => mode === "standby").length;
    const minimalModes = cinematicState.renderModes.filter((mode) => mode === "minimal").length;

    assert.equal(introState.isIntro, true);
    assert.equal(introState.isCinematic, false);
    assert.equal(cinematicState.isIntro, false);
    assert.equal(cinematicState.isCinematic, true);
    assert.equal(cinematicState.focusedIndex, milestones[milestones.length - 1].index);
    assert.equal(cinematicModes, 4);
    assert.equal(standbyModes, 8);
    assert.equal(minimalModes, milestones.length - cinematicModes - standbyModes);
});

test("cinematic tail keeps a narrow core around the current camera look target while widening the overview ring", () => {
    const overviewState = getSteleFrameState(sequenceCompleteFrame + 660);
    const cinematicModes = overviewState.renderModes.filter((mode) => mode === "cinematic").length;
    const standbyModes = overviewState.renderModes.filter((mode) => mode === "standby").length;

    assert.equal(overviewState.isCinematic, true);
    assert.ok(overviewState.focusedIndex >= 0 && overviewState.focusedIndex < milestones.length);
    assert.equal(cinematicModes, 7);
    assert.ok(standbyModes >= 9);
    assert.equal(overviewState.renderModes[Math.max(0, overviewState.focusedIndex - 3)], "cinematic");
    assert.equal(overviewState.renderModes[Math.min(milestones.length - 1, overviewState.focusedIndex + 3)], "cinematic");
    assert.equal(overviewState.renderModes[Math.min(milestones.length - 1, overviewState.focusedIndex + 4)], "standby");
    assert.equal(overviewState.renderModes[Math.min(milestones.length - 1, overviewState.focusedIndex + 11)], "standby");
    assert.equal(overviewState.renderModes[Math.min(milestones.length - 1, overviewState.focusedIndex + 12)], "minimal");
});

test("cinematic tail focus follows the slowed camera timeline instead of the raw display frame", () => {
    const lateDisplayFrame = 17000;
    const slowedCameraFrame = getCameraTimelineFrame(lateDisplayFrame);
    const slowedFocus = Math.max(
        0,
        Math.min(
            milestones.length - 1,
            Math.round(getCinematicCameraState(slowedCameraFrame - sequenceCompleteFrame).lookX / X_SPACING),
        ),
    );
    const rawFocus = Math.max(
        0,
        Math.min(
            milestones.length - 1,
            Math.round(getCinematicCameraState(lateDisplayFrame - sequenceCompleteFrame).lookX / X_SPACING),
        ),
    );

    assert.equal(getFocusedSteleIndex(lateDisplayFrame), slowedFocus);
    assert.notEqual(slowedFocus, rawFocus);
});

test("final flyover keeps every in-viewport dashboard out of minimal mode", () => {
    const flyoverFrames = [15835, 16265, 17000, 18000];

    for (const frame of flyoverFrames) {
        const state = getSteleFrameState(frame);

        for (const milestone of milestones) {
            const metrics = getSteleDashboardWorldMetrics({
                worldX: milestone.xCenter,
                worldZ: STELE_ROW_Z,
                dashboardBaseY: milestone.yCenter,
                floatY: 0,
            });
            const presentation = getPresentationState({
                frame,
                subject: metrics,
                width: 1920,
                height: 1080,
            });
            const { center, top, bottom } = presentation.viewport;
            const isVisibleInViewport =
                center.isInFront &&
                center.x >= -0.06 &&
                center.x <= 1.06 &&
                bottom.y >= -0.1 &&
                top.y <= 1.1;

            if (isVisibleInViewport) {
                assert.notEqual(
                    state.renderModes[milestone.index],
                    "minimal",
                    `frame ${frame} index ${milestone.index} is visible but minimal`,
                );
            }
        }
    }
});

test("vip focus mode is derived from the tallest height percentile, not hardcoded ranks", () => {
    assert.equal(isVipStele(36), false);
    assert.equal(isVipStele(37), true);
    assert.equal(isVipStele(38), true);
    assert.equal(isVipStele(39), true);

    assert.equal(getSteleFocusLockFrame(36), milestones[36].arriveFrame);
    assert.ok(getSteleFocusLockFrame(37) > milestones[37].arriveFrame);
    assert.ok(getSteleFocusLockFrame(39) > milestones[39].arriveFrame);
});

test("vip camera settles into a centered orbit and then launches sharply upward to the next leader", () => {
    const vip = milestones[38];
    const focusLockFrame = getSteleFocusLockFrame(vip.index);
    const orbitStartFrame = focusLockFrame;
    const orbitMidFrame = Math.min(vip.leaveFrame - 12, focusLockFrame + 90);
    const orbitLaterFrame = Math.min(vip.leaveFrame - 6, orbitMidFrame + 36);
    const launchMidFrame = vip.leaveFrame + Math.floor((milestones[39].arriveFrame - vip.leaveFrame) / 2);

    const orbitStartState = getCameraState(orbitStartFrame);
    const orbitMidState = getCameraState(orbitMidFrame);
    const orbitLaterState = getCameraState(orbitLaterFrame);
    const launchMidState = getCameraState(launchMidFrame);
    const orbitXSpan = Math.max(orbitStartState.camX, orbitMidState.camX, orbitLaterState.camX) -
        Math.min(orbitStartState.camX, orbitMidState.camX, orbitLaterState.camX);
    const orbitZSpan = Math.max(orbitStartState.camZOffset, orbitMidState.camZOffset, orbitLaterState.camZOffset) -
        Math.min(orbitStartState.camZOffset, orbitMidState.camZOffset, orbitLaterState.camZOffset);

    assert.ok(Math.abs(orbitStartState.lookX - vip.xCenter) <= 0.5);
    assert.ok(Math.abs(orbitMidState.lookX - vip.xCenter) <= 0.5);
    assert.ok(Math.abs(orbitLaterState.lookX - vip.xCenter) <= 0.5);
    assert.ok(orbitXSpan >= 1.5);
    assert.ok(orbitZSpan >= 1);
    assert.ok(Math.abs(orbitLaterState.camY - orbitMidState.camY) >= 0.5);
    assert.ok(launchMidState.camY - orbitLaterState.camY >= 500);
    assert.ok(launchMidState.camY - orbitLaterState.camY > Math.abs(launchMidState.camX - orbitLaterState.camX));
});

test("final vip hold performs a frontal left-to-right sweep while keeping the hero centered", () => {
    const finalVip = milestones[milestones.length - 1];
    const focusLockFrame = getSteleFocusLockFrame(finalVip.index);
    const holdRange = finalVip.leaveFrame - focusLockFrame;
    const earlyFrame = focusLockFrame + Math.floor(holdRange * 0.12);
    const midFrame = focusLockFrame + Math.floor(holdRange * 0.5);
    const lateFrame = finalVip.leaveFrame - 12;
    const endFrame = finalVip.leaveFrame;

    const earlyState = getCameraState(earlyFrame);
    const midState = getCameraState(midFrame);
    const lateState = getCameraState(lateFrame);
    const endState = getCameraState(endFrame);
    const orbitXSpan = Math.max(earlyState.camX, midState.camX, lateState.camX) -
        Math.min(earlyState.camX, midState.camX, lateState.camX);

    assert.ok(earlyState.camX < finalVip.xCenter - 4);
    assert.ok(Math.abs(midState.camX - finalVip.xCenter) < 1.5);
    assert.ok(lateState.camX > finalVip.xCenter + 4);
    assert.ok(orbitXSpan >= 8);
    assert.ok(Math.abs(earlyState.lookX - finalVip.xCenter) <= 1);
    assert.ok(Math.abs(midState.lookX - finalVip.xCenter) <= 1);
    assert.ok(Math.abs(lateState.lookX - finalVip.xCenter) <= 1);
    assert.ok(earlyState.camZOffset > midState.camZOffset);
    assert.ok(lateState.camZOffset > midState.camZOffset);
    assert.ok(endState.camZOffset > lateState.camZOffset);
    assert.ok(endState.camY > midState.camY);
});

test("final vip hold hands off to the cinematic tail without a one-frame tear", () => {
    const lastMainFrame = sequenceCompleteFrame;
    const preHandoffState = getCameraState(lastMainFrame - 1);
    const lastMainState = getCameraState(lastMainFrame);
    const cinematicStartState = getCinematicCameraState(0);
    const cinematicNextState = getCinematicCameraState(1);

    assert.ok(Math.abs(lastMainState.camX - preHandoffState.camX) < 1);
    assert.ok(Math.abs(lastMainState.camY - preHandoffState.camY) < 1);
    assert.ok(Math.abs(lastMainState.lookX - preHandoffState.lookX) < 1);
    assert.ok(Math.abs(lastMainState.lookY - preHandoffState.lookY) < 1);
    assert.ok(Math.abs(lastMainState.camZOffset - preHandoffState.camZOffset) < 1);

    assert.deepEqual(cinematicStartState, {
        camX: lastMainState.camX,
        camY: lastMainState.camY,
        camZ: 55 + lastMainState.camZOffset,
        lookX: lastMainState.lookX,
        lookY: lastMainState.lookY,
        lookZ: 10,
    });

    assert.ok(Math.abs(cinematicNextState.camX - cinematicStartState.camX) < 0.1);
    assert.ok(Math.abs(cinematicNextState.camY - cinematicStartState.camY) < 0.1);
    assert.ok(Math.abs(cinematicNextState.lookX - cinematicStartState.lookX) < 0.1);
    assert.ok(Math.abs(cinematicNextState.lookY - cinematicStartState.lookY) < 0.1);
    assert.ok(Math.abs(cinematicNextState.camZ - cinematicStartState.camZ) < 0.1);
});

test("cinematic ramp keeps most of the leader framing during its opening beat", () => {
    const rampStartState = getCinematicCameraState(0);
    const earlyRampState = getCinematicCameraState(60);
    const rampEndState = getCinematicCameraState(300);
    const camYTravelFraction =
        Math.abs((earlyRampState.camY - rampStartState.camY) / (rampEndState.camY - rampStartState.camY));
    const lookYTravelFraction =
        Math.abs((earlyRampState.lookY - rampStartState.lookY) / (rampEndState.lookY - rampStartState.lookY));

    assert.ok(camYTravelFraction < 0.1);
    assert.ok(lookYTravelFraction < 0.1);
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

test("camera slowdown and duration follow the slowed-tail formula", () => {
    const offsetFrame = 90;

    assert.equal(getCameraTimelineFrame(FINAL_CAMERA_SLOWDOWN_START_FRAME - 1), FINAL_CAMERA_SLOWDOWN_START_FRAME - 1);
    assert.equal(getCameraTimelineFrame(FINAL_CAMERA_SLOWDOWN_START_FRAME), FINAL_CAMERA_SLOWDOWN_START_FRAME);
    assert.equal(
        getCameraTimelineFrame(FINAL_CAMERA_SLOWDOWN_START_FRAME + offsetFrame * FINAL_CAMERA_SLOWDOWN_FACTOR),
        FINAL_CAMERA_SLOWDOWN_START_FRAME + offsetFrame
    );
    assert.equal(
        durationInFrames,
        FINAL_CAMERA_SLOWDOWN_START_FRAME +
            (baseDurationInFrames - FINAL_CAMERA_SLOWDOWN_START_FRAME) * FINAL_CAMERA_SLOWDOWN_FACTOR
    );
});

test("stele heights clamp to a readable minimum and grow with larger values", () => {
    assert.equal(getSteleHeight(0), 3);
    assert.ok(getSteleHeight(2) > getSteleHeight(1));
});
