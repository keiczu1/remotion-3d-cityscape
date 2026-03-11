# Ranking Towers Intro Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an intro segment to `ranking-towers` with a large English title over the environment and a smooth camera handoff into the first tower.

**Architecture:** Keep intro timing, title state, and camera handoff in `scene-logic.ts` so the scene remains testable and consistent with the existing camera pipeline. Render the title as a lightweight overlay in `Scene.tsx`, and make `camera-updater.tsx` consume intro-aware camera state instead of inventing separate JSX-local timing.

**Tech Stack:** Remotion, React, @remotion/three, TypeScript, node:test, tsx

---

### Task 1: Add failing tests for intro timing and camera handoff

**Files:**
- Modify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`
- Test: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Write the failing test for intro duration and milestone offset**

Add tests like:

```ts
test("intro duration shifts the first tower milestone", () => {
    assert.equal(INTRO_DURATION_IN_FRAMES, 160);
    assert.equal(milestones[0].arriveFrame, INTRO_DURATION_IN_FRAMES);
});

test("duration includes the intro segment", () => {
    assert.ok(durationInFrames > baseDurationInFrames);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected:
- FAIL because `INTRO_DURATION_IN_FRAMES` is not exported yet.
- FAIL because the first milestone still starts at frame `0`.

**Step 3: Write the failing test for intro state and camera handoff**

Add tests like:

```ts
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
```

**Step 4: Run test to verify it fails**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected:
- FAIL because `isIntro` and `getIntroCameraState()` do not exist yet.

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/tests/scene-logic.test.ts
git commit -m "test: define ranking towers intro behavior"
```

### Task 2: Implement intro timing and camera state in scene logic

**Files:**
- Modify: `src/compositions/ranking-towers/scene/scene-logic.ts`
- Test: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Write the minimal intro timing constants and shift milestones**

Implement:

```ts
export const INTRO_REVEAL_FRAMES = 45;
export const INTRO_HOLD_FRAMES = 40;
export const INTRO_PUSH_IN_FRAMES = 75;
export const INTRO_DURATION_IN_FRAMES =
    INTRO_REVEAL_FRAMES + INTRO_HOLD_FRAMES + INTRO_PUSH_IN_FRAMES;
```

Then update `getMilestones()` so the local `frame` starts from `INTRO_DURATION_IN_FRAMES`.

**Step 2: Add intro-aware scene state exports**

Implement minimal helpers:

```ts
export function isIntroFrame(frame: number) {
    return frame < INTRO_DURATION_IN_FRAMES;
}

export function getIntroTitleProgress(frame: number) {
    // Return reveal / hold / exit progress for overlay animation.
}
```

Extend `getTowerFrameState(frame)` with `isIntro`.

**Step 3: Add intro camera handoff function**

Implement:

```ts
export function getIntroCameraState(frame: number) {
    const handoff = getCameraState(milestones[0].arriveFrame);
    // Interpolate from intro overview camera into handoff state.
    return {
        camX,
        camY,
        camZ,
        lookX,
        lookY,
        lookZ,
    };
}
```

Keep the end frame aligned with the first main camera state.

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected:
- PASS for intro timing tests.
- PASS for intro state and handoff tests.
- Existing scene logic tests stay green.

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/scene/scene-logic.ts src/compositions/ranking-towers/tests/scene-logic.test.ts
git commit -m "feat: add ranking towers intro scene logic"
```

### Task 3: Add the intro title overlay and camera updater wiring

**Files:**
- Modify: `src/compositions/ranking-towers/scene/Scene.tsx`
- Modify: `src/compositions/ranking-towers/scene/camera-updater.tsx`
- Optional create: `src/compositions/ranking-towers/components/IntroTitle.tsx`
- Test: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Write the failing integration test for intro progress contract if needed**

If `getIntroTitleProgress()` is more than trivial, add a test such as:

```ts
test("title progress reaches exit state during intro push-in", () => {
    const state = getIntroTitleProgress(INTRO_DURATION_IN_FRAMES - 10);
    assert.equal(state.isVisible, true);
    assert.ok(state.opacity < 1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected:
- FAIL because the title progress contract is incomplete.

**Step 3: Implement overlay and intro camera branch**

Update `camera-updater.tsx` so it checks `isIntroFrame(cameraFrame)` and uses `getIntroCameraState(cameraFrame)` before existing main/cinematic logic.

Update `Scene.tsx` to render:

```tsx
<div style={overlayStyle}>
  <IntroTitle />
</div>
```

The title component should:
- use `useCurrentFrame()`;
- consume `getIntroTitleProgress(frame)`;
- render only lightweight HTML/CSS transforms and opacity;
- show `40 MOST VISITED WEBSITES IN THE WORLD`.

**Step 4: Run tests and static checks**

Run:
- `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`
- `npm run lint`

Expected:
- PASS for tests.
- PASS for lint and TypeScript.

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/scene/Scene.tsx src/compositions/ranking-towers/scene/camera-updater.tsx src/compositions/ranking-towers/components/IntroTitle.tsx src/compositions/ranking-towers/tests/scene-logic.test.ts
git commit -m "feat: add ranking towers intro overlay"
```

### Task 4: Verify final behavior against project rules

**Files:**
- Verify: `src/compositions/ranking-towers/scene/scene-logic.ts`
- Verify: `src/compositions/ranking-towers/scene/Scene.tsx`
- Verify: `src/compositions/ranking-towers/scene/camera-updater.tsx`
- Verify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Run the full targeted verification**

Run:
- `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`
- `npm run lint`
- `npm run build`

Expected:
- all commands PASS;
- no new type errors;
- bundle succeeds.

**Step 2: Manually review against `Rules/PROJECT_RULES.md`**

Confirm:
- intro timing is explicit and centralized;
- camera handoff is continuous;
- title animation is readable and lightweight;
- no new hot-mount behavior was introduced;
- no render-mode regression was introduced for towers.

**Step 3: Commit verification-safe final state**

```bash
git add src/compositions/ranking-towers/scene/scene-logic.ts src/compositions/ranking-towers/scene/Scene.tsx src/compositions/ranking-towers/scene/camera-updater.tsx src/compositions/ranking-towers/components/IntroTitle.tsx src/compositions/ranking-towers/tests/scene-logic.test.ts docs/plans/2026-03-11-ranking-towers-intro.md
git commit -m "docs: add ranking towers intro implementation plan"
```
