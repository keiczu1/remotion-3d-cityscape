# Ranking Towers Monthly Metric Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clean up the ranking-towers visits metric by removing trailing `.0` and rendering `Monthly` on a second line.

**Architecture:** Keep formatting logic in `dashboard-helpers.ts` and keep layout changes local to `HologramDashboard.tsx`. Add focused tests for the formatter first, then apply the smallest JSX change that preserves the card hierarchy.

**Tech Stack:** TypeScript, React, Remotion, React Three Fiber, node:test

---

### Task 1: Add formatter tests

**Files:**
- Modify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`
- Modify: `src/compositions/ranking-towers/components/dashboard-helpers.ts`

**Step 1: Write the failing test**

Add tests covering:
- `915000000` -> `915 M`
- `867000000` -> `867 M`
- `3200000000` -> `3.2 B`
- monthly label helper returns `Monthly`

**Step 2: Run test to verify it fails**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: FAIL because the helper behavior does not exist yet.

**Step 3: Write minimal implementation**

Implement formatter trimming for trailing `.0` and add a small helper for the secondary monthly label.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: PASS.

### Task 2: Apply the two-line metric layout

**Files:**
- Modify: `src/compositions/ranking-towers/components/HologramDashboard.tsx`

**Step 1: Keep layout change local**

Render the numeric value and `Monthly` as two `Text` nodes, preserving current hierarchy and color direction.

**Step 2: Use restrained typography**

Keep the main number dominant and style `Monthly` smaller and softer so the card remains visually stable.

**Step 3: Run targeted tests**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: PASS.

### Task 3: Verify the slice

**Files:**
- Modify: `src/compositions/ranking-towers/components/dashboard-helpers.ts`
- Modify: `src/compositions/ranking-towers/components/HologramDashboard.tsx`
- Modify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Run focused tests**

Run: `npm test -- src/compositions/ranking-towers/tests/scene-logic.test.ts`

Expected: PASS.

**Step 2: Run broader verification**

Run: `npm run lint`

Expected: exit code `0`.
