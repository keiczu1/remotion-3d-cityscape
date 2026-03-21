import test from "node:test";
import assert from "node:assert/strict";

import {
    STELE_DASHBOARD_REVEAL_FRAMES,
    STELE_DASHBOARD_ROOT_OFFSET_Y,
    getSteleDashboardWorldMetrics,
} from "../components/stele-dashboard-layout";
import {
    CAMERA_PRESENTATION_PRESET,
    findPresentationActivationFrame,
    getActivatedPresentationProgress,
    getPresentationState,
} from "../scene/camera-presentation";
import { STELE_ROW_Z, getSteleHeight, milestones, reversedData } from "../scene/scene-logic";

const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

const getDashboardSubject = (index: number) => {
    const item = reversedData[index];
    const milestone = milestones[index];
    const dashboardBaseY = getSteleHeight(item.relHeight) + STELE_DASHBOARD_ROOT_OFFSET_Y;

    return getSteleDashboardWorldMetrics({
        worldX: milestone.xCenter,
        worldZ: STELE_ROW_Z,
        dashboardBaseY,
        floatY: 0,
    });
};

test("presentation gate keeps the tallest card hidden until its top enters the safe zone", () => {
    const leaderIndex = milestones.length - 1;
    const leaderMilestone = milestones[leaderIndex];
    const subject = getDashboardSubject(leaderIndex);

    let blockedFrame: number | null = null;
    let blockedState: ReturnType<typeof getPresentationState> | null = null;
    for (let frame = leaderMilestone.arriveFrame; frame <= leaderMilestone.leaveFrame; frame++) {
        const state = getPresentationState({
            frame,
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT,
            subject,
        });

        if (state.readabilityGate > 0.9 && state.horizontalGate > 0.9 && state.verticalGate < 0.01) {
            blockedFrame = frame;
            blockedState = state;
            break;
        }
    }

    assert.notEqual(blockedFrame, null);
    assert.notEqual(blockedState, null);
    assert.ok(blockedFrame! >= leaderMilestone.arriveFrame);
    assert.ok(blockedState!.progress < 0.01);

    let revealFrame: number | null = null;
    let revealState: ReturnType<typeof getPresentationState> | null = null;
    for (let frame = blockedFrame!; frame <= leaderMilestone.leaveFrame; frame++) {
        const state = getPresentationState({
            frame,
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT,
            subject,
        });

        if (state.progress > 0.95) {
            revealFrame = frame;
            revealState = state;
            break;
        }
    }

    assert.notEqual(revealFrame, null);
    assert.notEqual(revealState, null);
    assert.ok(revealFrame! > blockedFrame!);
    assert.ok(revealFrame! > leaderMilestone.arriveFrame);
    assert.ok(revealState!.verticalGate > 0.9);
    assert.ok(revealState!.viewport.top.y >= CAMERA_PRESENTATION_PRESET.safeTopEnter);
    assert.ok(revealState!.progress > 0.95);
});

test("activation frame latches the card after reveal even if the live projection gate later drops", () => {
    const leaderIndex = milestones.length - 1;
    const leaderMilestone = milestones[leaderIndex];
    const subject = getDashboardSubject(leaderIndex);
    const activationFrame = findPresentationActivationFrame({
        searchStartFrame: Math.max(0, leaderMilestone.arriveFrame - STELE_DASHBOARD_REVEAL_FRAMES),
        searchEndFrame: Math.min(leaderMilestone.leaveFrame + STELE_DASHBOARD_REVEAL_FRAMES, milestones[milestones.length - 1].leaveFrame),
        subject,
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
    });

    assert.notEqual(activationFrame, null);

    let laterFrame: number | null = null;
    for (let frame = leaderMilestone.leaveFrame + 1; frame <= leaderMilestone.leaveFrame + 240; frame++) {
        const state = getPresentationState({
            frame,
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT,
            subject,
        });

        if (state.progress < 0.01) {
            laterFrame = frame;
            break;
        }
    }

    assert.notEqual(laterFrame, null);

    const liveState = getPresentationState({
        frame: laterFrame!,
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        subject,
    });
    const latchedProgress = getActivatedPresentationProgress({
        frame: laterFrame!,
        activationFrame,
        revealFrames: STELE_DASHBOARD_REVEAL_FRAMES,
    });

    assert.ok(liveState.progress < 0.01);
    assert.ok(latchedProgress > 0.99);
});

test("regular mid-height cards can activate well before their own arrive frame when projection already permits them", () => {
    const index = 27; // #13 yahoo.com
    const milestone = milestones[index];
    const subject = getDashboardSubject(index);
    const activationFrame = findPresentationActivationFrame({
        searchStartFrame: 0,
        searchEndFrame: Math.min(milestone.leaveFrame + STELE_DASHBOARD_REVEAL_FRAMES, milestones[milestones.length - 1].leaveFrame),
        subject,
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
    });

    assert.notEqual(activationFrame, null);
    assert.ok(activationFrame! < milestone.arriveFrame - STELE_DASHBOARD_REVEAL_FRAMES);

    const liveStateAtActivation = getPresentationState({
        frame: activationFrame!,
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        subject,
    });

    assert.ok(liveStateAtActivation.gate > 0);
    assert.ok(liveStateAtActivation.verticalGate > 0.99);
    assert.ok(liveStateAtActivation.readabilityGate > 0.99);
});
