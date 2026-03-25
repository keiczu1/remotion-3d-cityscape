import assert from "node:assert/strict";
import test from "node:test";

import { buildRailFocusVipFinaleTimingPlan } from "./rail-focus-vip-finale-v1/timing";
import { RAIL_FOCUS_VIP_FINALE_V1_PACKAGE } from "./rail-focus-vip-finale-v1/package";
import { buildSoftSideOrbitClassicTimingPlan } from "./soft-side-orbit-classic-v1/timing";
import { SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE } from "./soft-side-orbit-classic-v1/package";

const INTRO_DURATION_IN_FRAMES = 45 + 40 + 90;

test("rail-focus source-compatible plan reproduces legacy 40-item cadence", () => {
    const plan = buildRailFocusVipFinaleTimingPlan({
        itemCount: 40,
        introDurationFrames: INTRO_DURATION_IN_FRAMES,
        strategy: "source-compatible",
        finaleTailPolicy: "legacy-cinematic-slowdown",
    });

    assert.equal(plan.milestones[0].moveFrames, 0);
    assert.equal(plan.milestones[1].moveFrames, 72);
    assert.equal(plan.milestones[0].holdFrames, 288);
    assert.equal(plan.milestones[39].holdFrames, 600);
    assert.equal(plan.finalCameraSlowdownFactor, 3);
    assert.equal(plan.durationInFrames, 18679);
});

test("soft-side-orbit source-compatible plan reproduces legacy tower cadence", () => {
    const plan = buildSoftSideOrbitClassicTimingPlan({
        itemCount: 40,
        introDurationFrames: INTRO_DURATION_IN_FRAMES,
        strategy: "source-compatible",
        finaleTailPolicy: "legacy-cinematic-slowdown",
    });

    assert.equal(plan.milestones[0].moveFrames, 0);
    assert.equal(plan.milestones[1].moveFrames, 80);
    assert.equal(plan.milestones[0].holdFrames, 320);
    assert.equal(plan.milestones[39].holdFrames, 320);
    assert.equal(plan.finalCameraSlowdownFactor, 3);
    assert.equal(plan.durationInFrames, 19135);
});

test("rail-focus adaptive plan scales down 100-item runs and removes cinematic tail", () => {
    const plan = buildRailFocusVipFinaleTimingPlan({
        itemCount: 100,
        introDurationFrames: INTRO_DURATION_IN_FRAMES,
        strategy: "adaptive-standard",
        finaleTailPolicy: "off",
    });

    assert.equal(plan.finaleTailPolicy, "off");
    assert.equal(plan.finalCameraSlowdownFactor, 1);
    assert.equal(plan.durationInFrames, plan.baseDurationInFrames);
    assert.ok(plan.durationInFrames < 400 * 60);
    assert.ok(plan.milestones[1].moveFrames < 72);
    assert.ok(plan.milestones[0].holdFrames < 288);
    assert.ok(plan.milestones[99].holdFrames > plan.holdFrames);
    assert.equal(plan.actBoundaries.finaleIndex, 99);
    assert.ok(plan.actBoundaries.scene1EndIndex > 10);
    assert.ok(plan.actBoundaries.scene2EndIndex > 25);
});

test("adaptive preset plans stay within their declared duration bands", () => {
    for (const count of [20, 40, 100, 150]) {
        const railPlan = buildRailFocusVipFinaleTimingPlan({
            itemCount: count,
            introDurationFrames: INTRO_DURATION_IN_FRAMES,
            strategy: "adaptive-standard",
            finaleTailPolicy: "off",
        });
        const softPlan = buildSoftSideOrbitClassicTimingPlan({
            itemCount: count,
            introDurationFrames: INTRO_DURATION_IN_FRAMES,
            strategy: "adaptive-standard",
            finaleTailPolicy: "off",
        });

        const railSeconds = railPlan.durationInFrames / RAIL_FOCUS_VIP_FINALE_V1_PACKAGE.supportedFps;
        const softSeconds = softPlan.durationInFrames / SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE.supportedFps;

        assert.ok(
            railSeconds >= RAIL_FOCUS_VIP_FINALE_V1_PACKAGE.targetDurationBandSeconds[0] &&
                railSeconds <= RAIL_FOCUS_VIP_FINALE_V1_PACKAGE.targetDurationBandSeconds[1],
        );
        assert.ok(
            softSeconds >= SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE.targetDurationBandSeconds[0] &&
                softSeconds <= SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE.targetDurationBandSeconds[1],
        );
    }
});

test("adaptive preset packages are explicitly 60fps-only", () => {
    assert.equal(RAIL_FOCUS_VIP_FINALE_V1_PACKAGE.supportedFps, 60);
    assert.equal(SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE.supportedFps, 60);
});

test("adaptive preset plans reject item counts outside supported range", () => {
    assert.throws(() =>
        buildRailFocusVipFinaleTimingPlan({
            itemCount: 10,
            introDurationFrames: INTRO_DURATION_IN_FRAMES,
            strategy: "adaptive-standard",
            finaleTailPolicy: "off",
        }),
    );
    assert.throws(() =>
        buildSoftSideOrbitClassicTimingPlan({
            itemCount: 200,
            introDurationFrames: INTRO_DURATION_IN_FRAMES,
            strategy: "adaptive-standard",
            finaleTailPolicy: "off",
        }),
    );
});
