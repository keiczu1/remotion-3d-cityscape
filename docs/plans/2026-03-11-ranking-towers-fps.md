# Ranking Towers FPS Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve `ranking-towers` FPS without visible design degradation by removing repeated internal work.

**Architecture:** Keep the scene structure intact and optimize hot paths only. Move repeated per-frame state calculation into `scene-logic`, reduce unnecessary animated dashboard work for non-focused towers, and reuse more shared Three.js resources.

**Tech Stack:** TypeScript, React, Remotion, React Three Fiber, Three.js, node:test

---

### Task 1: Add frame-state tests

**Files:**
- Modify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`
- Modify: `src/compositions/ranking-towers/scene/scene-logic.ts`

**Step 1: Write the failing test**

Add tests for a new helper that returns frame-level tower state and proves that the focused tower is `full` while distant towers are not.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: FAIL because the new helper does not exist yet.

**Step 3: Write minimal implementation**

Add a frame-state helper in `scene-logic.ts` that computes `focusedIndex` once and returns per-tower `renderMode` values.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/tests/scene-logic.test.ts src/compositions/ranking-towers/scene/scene-logic.ts
git commit -m "test: cover ranking tower frame state"
```

### Task 2: Use shared frame state in scene assembly

**Files:**
- Modify: `src/compositions/ranking-towers/scene/Scene.tsx`
- Modify: `src/compositions/ranking-towers/components/Tower.tsx`

**Step 1: Write the failing test**

No extra test file is needed. The behavior is covered by Task 1 scene-logic tests.

**Step 2: Implement minimal integration**

Compute frame state once in `Scene.tsx`, pass `renderMode` into each `Tower`, and remove repeated mode calculation inside tower render.

**Step 3: Run targeted tests**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: PASS.

**Step 4: Commit**

```bash
git add src/compositions/ranking-towers/scene/Scene.tsx src/compositions/ranking-towers/components/Tower.tsx
git commit -m "refactor: share ranking tower frame state"
```

### Task 3: Cut animated dashboard work for static modes

**Files:**
- Modify: `src/compositions/ranking-towers/components/HologramDashboard.tsx`

**Step 1: Write the failing test**

No new automated test for rendering internals in this pass. Preserve behavior by narrowing work only after existing guard conditions.

**Step 2: Implement minimal optimization**

Reorder dashboard logic so `not ready`, `standby`, and `cinematic` paths return before scramble-string assembly and effect-specific calculations.

**Step 3: Run tests**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: PASS.

**Step 4: Commit**

```bash
git add src/compositions/ranking-towers/components/HologramDashboard.tsx
git commit -m "perf: avoid animated dashboard work for static cards"
```

### Task 4: Reuse repeated tower resources and reduce preload churn

**Files:**
- Modify: `src/compositions/ranking-towers/components/Tower.tsx`
- Modify: `src/compositions/ranking-towers/scene/asset-preloader.tsx`

**Step 1: Write the failing test**

No new direct test. Keep the change scoped to resource reuse and preload deduping.

**Step 2: Implement minimal optimization**

Hoist reusable decorative tower resources and ensure preloader skips work for already requested tower assets.

**Step 3: Run tests**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: PASS.

**Step 4: Commit**

```bash
git add src/compositions/ranking-towers/components/Tower.tsx src/compositions/ranking-towers/scene/asset-preloader.tsx
git commit -m "perf: reuse tower resources and dedupe preloads"
```

### Task 5: Verify the whole slice

**Files:**
- Modify: `src/compositions/ranking-towers/...`

**Step 1: Run focused verification**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: PASS.

**Step 2: Run broader verification**

Run: `npm run lint`

Expected: exit code `0`.

**Step 3: Final commit**

```bash
git add docs/plans/2026-03-11-ranking-towers-fps-design.md docs/plans/2026-03-11-ranking-towers-fps.md src/compositions/ranking-towers
git commit -m "perf: optimize ranking towers hot paths"
```
