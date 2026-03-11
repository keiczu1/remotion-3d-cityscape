# Ranking Towers Slower Push-In Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Slow down only the intro camera push-in in `ranking-towers` while preserving the title reveal and hold timing.

**Architecture:** Keep the change localized to `scene-logic.ts` by increasing `INTRO_PUSH_IN_FRAMES`, then update tests that assert the intro duration and milestone offset. The camera route and title animation remain structurally unchanged.

**Tech Stack:** Remotion, TypeScript, node:test, tsx

---

### Task 1: Update tests for the slower push-in

**Files:**
- Modify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`
- Test: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Write the failing test**

Change the intro duration expectation from `160` to `175`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: FAIL because `INTRO_DURATION_IN_FRAMES` is still `160`.

**Step 3: Write minimal implementation**

Change only `INTRO_PUSH_IN_FRAMES` from `75` to `90` in `src/compositions/ranking-towers/scene/scene-logic.ts`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/tests/scene-logic.test.ts src/compositions/ranking-towers/scene/scene-logic.ts
git commit -m "feat: slow ranking towers intro push-in"
```

### Task 2: Verify the scene still satisfies project rules

**Files:**
- Verify: `src/compositions/ranking-towers/scene/scene-logic.ts`
- Verify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Run verification**

Run:
- `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`
- `npm run lint`
- `npm run build`

Expected:
- all commands PASS.

**Step 2: Commit plan docs**

```bash
git add docs/plans/2026-03-11-ranking-towers-slower-pushin-design.md docs/plans/2026-03-11-ranking-towers-slower-pushin.md
git commit -m "docs: add slower push-in notes"
```
