# FPS Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the render-time FPS drop around tower focus and dashboard reveal without changing the visible design of the video.

**Architecture:** The implementation keeps the visible shot composition intact while reducing hidden render cost. It does this by preloading shared textures, keeping heavy dashboard structures stable, and culling or throttling work that cannot affect the current camera frame.

**Tech Stack:** Remotion, React 19, @remotion/three, @react-three/fiber, @react-three/drei, Three.js, TypeScript, node:test

---

### Task 1: Add failing tests for visibility and render-budget helpers

**Files:**
- Modify: `src/Scene.camera.test.ts`

**Step 1: Write the failing test**

Add tests for:
- a helper that returns the active tower index for a frame
- a helper that marks nearby towers as high-detail and far towers as culled/lightweight
- a helper that keeps the active tower visible during arrival and pause frames

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts`
Expected: FAIL because the new helper exports do not exist yet.

**Step 3: Write minimal implementation**

Implement frame-to-focus helper exports in `src/Scene.tsx`.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/Scene.camera.test.ts src/Scene.tsx
git commit -m "test: cover scene focus visibility helpers"
```

### Task 2: Preload and cache tower textures

**Files:**
- Modify: `src/Scene.tsx`
- Test: `src/Scene.camera.test.ts`

**Step 1: Write the failing test**

Add a test for the frame window that decides when a tower should preload assets before becoming active.

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts`
Expected: FAIL because the preload-window helper does not exist or returns the wrong result.

**Step 3: Write minimal implementation**

Add shared texture cache/preload helpers and hook them into favicon/flag usage without changing visible output.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/Scene.camera.test.ts src/Scene.tsx
git commit -m "perf: preload tower textures before reveal"
```

### Task 3: Remove hot-frame dashboard mounts

**Files:**
- Modify: `src/Scene.tsx`

**Step 1: Write the failing test**

Add a test covering dashboard activation timing so the structure becomes render-eligible before the visible reveal begins.

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts`
Expected: FAIL because the current timing exposes the dashboard too late.

**Step 3: Write minimal implementation**

Refactor the dashboard so the heavy visual tree stays mounted through the reveal window and only animates transforms/opacities.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/Scene.tsx src/Scene.camera.test.ts
git commit -m "perf: stabilize dashboard reveal mounts"
```

### Task 4: Cull off-screen tower details and background work

**Files:**
- Modify: `src/Scene.tsx`
- Test: `src/Scene.camera.test.ts`

**Step 1: Write the failing test**

Add tests showing that distant towers are outside the high-detail window while the active tower remains fully visible.

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts`
Expected: FAIL because the culling helper does not exist or does not match the intended focus window.

**Step 3: Write minimal implementation**

Wire camera-aware focus decisions into tower details and background updates without changing the visible shot.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/Scene.tsx src/Scene.camera.test.ts
git commit -m "perf: cull off-screen scene work"
```

### Task 5: Verify the full optimization pass

**Files:**
- Modify: `src/Scene.tsx`
- Modify: `src/Scene.camera.test.ts`

**Step 1: Run focused tests**

Run: `node --test src/Scene.camera.test.ts`
Expected: PASS

**Step 2: Run static verification**

Run: `npm run lint`
Expected: PASS

**Step 3: Run render-oriented verification**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/Scene.tsx src/Scene.camera.test.ts docs/plans/2026-03-11-fps-optimization-design.md docs/plans/2026-03-11-fps-optimization.md
git commit -m "perf: optimize remotion scene render stability"
```
