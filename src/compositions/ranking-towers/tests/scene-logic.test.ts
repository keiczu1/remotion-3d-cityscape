import test from "node:test";
import assert from "node:assert/strict";

import {
    appearanceDirections,
    appearanceKinds,
    appearanceSizeClasses,
    appearanceSoundProfiles,
    type AppearanceDescriptor,
    type AppearanceEvent,
    type ResolvedSoundCue,
} from "../model/types";
import { appearanceSoundLibrary } from "../sound/appearance-library";
import {
    baseDurationInFrames,
    durationInFrames,
    FINAL_CAMERA_SLOWDOWN_FACTOR,
    FINAL_CAMERA_SLOWDOWN_START_FRAME,
    getCameraState,
    getIntroCameraState,
    getIntroTitleState,
    getTowerFrameState,
    getTowerRenderMode,
    INTRO_DURATION_IN_FRAMES,
    milestones,
    sequenceCompleteFrame,
} from "../scene/scene-logic";
import { resolveAppearanceSoundProfile } from "../sound/appearance-profile";

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
    assert.equal(INTRO_DURATION_IN_FRAMES, 175);
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

test("title state enters exit motion during the intro push-in", () => {
    const titleState = getIntroTitleState(INTRO_DURATION_IN_FRAMES - 10);

    assert.equal(titleState.isVisible, true);
    assert.ok(titleState.opacity < 1);
    assert.ok(titleState.translateY < 0);
    assert.ok(titleState.scale < 1);
});

test("appearance sound domain types support scene-local fixtures", () => {
    const descriptor: AppearanceDescriptor = {
        kind: "scale",
        durationFrames: 18,
        intensity: 0.6,
        direction: "none",
        hasOvershoot: true,
        hasSettle: true,
        sizeClass: "medium",
    };

    const event: AppearanceEvent = {
        id: "tower-0-reveal",
        startFrame: milestones[0].arriveFrame,
        descriptor,
        seed: "tower-0",
    };

    const cue: ResolvedSoundCue = {
        id: "tower-0-reveal-main",
        eventId: event.id,
        profile: "pop-reveal",
        startFrame: event.startFrame,
        src: "sfx/appearance/pop/body-01.wav",
        volume: 0.72,
    };

    assert.equal(cue.eventId, event.id);
    assert.equal(cue.profile, "pop-reveal");
    assert.equal(descriptor.kind, "scale");
    assert.ok(appearanceKinds.includes(descriptor.kind));
    assert.ok(appearanceDirections.includes(descriptor.direction));
    assert.ok(appearanceSizeClasses.includes(descriptor.sizeClass));
    assert.ok(appearanceSoundProfiles.includes(cue.profile));
});

test("fade descriptors with low intensity resolve to soft-reveal", () => {
    assert.equal(
        resolveAppearanceSoundProfile({
            kind: "fade",
            durationFrames: 24,
            intensity: 0.2,
            direction: "none",
            hasOvershoot: false,
            hasSettle: false,
            sizeClass: "medium",
        }),
        "soft-reveal",
    );
});

test("scale descriptors with overshoot resolve to pop-reveal", () => {
    assert.equal(
        resolveAppearanceSoundProfile({
            kind: "scale",
            durationFrames: 18,
            intensity: 0.55,
            direction: "none",
            hasOvershoot: true,
            hasSettle: true,
            sizeClass: "small",
        }),
        "pop-reveal",
    );
});

test("directional slide descriptors resolve to sweep-reveal", () => {
    assert.equal(
        resolveAppearanceSoundProfile({
            kind: "slide",
            durationFrames: 22,
            intensity: 0.45,
            direction: "right",
            hasOvershoot: false,
            hasSettle: true,
            sizeClass: "medium",
        }),
        "sweep-reveal",
    );
});

test("high-intensity settling descriptors resolve to impact-reveal", () => {
    assert.equal(
        resolveAppearanceSoundProfile({
            kind: "impact",
            durationFrames: 14,
            intensity: 0.9,
            direction: "down",
            hasOvershoot: false,
            hasSettle: true,
            sizeClass: "large",
        }),
        "impact-reveal",
    );
});

test("tech descriptors resolve to tech-reveal", () => {
    assert.equal(
        resolveAppearanceSoundProfile({
            kind: "tech",
            durationFrames: 20,
            intensity: 0.5,
            direction: "none",
            hasOvershoot: false,
            hasSettle: false,
            sizeClass: "medium",
        }),
        "tech-reveal",
    );
});

test("appearance sound library covers every supported profile", () => {
    for (const profile of appearanceSoundProfiles) {
        const recipes = appearanceSoundLibrary[profile];

        assert.ok(Array.isArray(recipes));
        assert.ok(recipes.length > 0);
    }
});

test("appearance sound library uses public-relative asset paths", () => {
    for (const recipes of Object.values(appearanceSoundLibrary)) {
        for (const recipe of recipes) {
            const layers = [recipe.transient, recipe.body, recipe.tail].filter(Boolean);

            for (const layer of layers) {
                assert.match(layer.src, /^sfx\/appearance\/.+\.(wav|mp3)$/);
            }
        }
    }
});
