# Scene Modularity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the current Remotion scene into modules without changing intended behavior, prepare the repository for multiple compositions, and add universal modularity rules to the project standards.

**Architecture:** The implementation follows a hybrid path. First it extracts responsibility-based modules from the current scene while preserving visible output and existing logic contracts. Then it reorganizes the modularized scene into a composition-oriented structure and updates the rules document with universal guidance for future Remotion projects.

**Tech Stack:** Remotion 4, React 19, @remotion/three, @react-three/fiber, @react-three/drei, Three.js, TypeScript, node:test, Markdown

---

### Task 1: Lock in current logic contracts before moving files

**Files:**
- Modify: `src/Scene.camera.test.ts`
- Modify: `src/scene-logic.ts`

**Step 1: Write the failing test**

Add tests that describe the contracts the refactor must preserve:
- `durationInFrames` still maps correctly to the slowed camera timeline
- the active tower handoff remains stable
- render modes remain `full`, `standby`, and `minimal` for the same frame/index pairs
- preload windows remain active before reveal and through the active tower window

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts`
Expected: FAIL because at least one contract is not yet covered by explicit assertions or required helper exports.

**Step 3: Write minimal implementation**

Expose or adjust only the minimal pure helpers in `src/scene-logic.ts` needed to test the existing behavior more directly.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/Scene.camera.test.ts src/scene-logic.ts
git commit -m "test: lock scene logic contracts before modular refactor"
```

### Task 2: Extract scene asset utilities into dedicated modules

**Files:**
- Create: `src/assets/texture-cache.ts`
- Create: `src/assets/asset-urls.ts`
- Modify: `src/Scene.tsx`
- Test: `src/Scene.camera.test.ts`

**Step 1: Write the failing test**

Add tests for exported asset-policy helpers used by the scene, such as URL formatting and any preload-window contract that depends on scene logic rather than JSX.

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts`
Expected: FAIL because the extracted helper module does not exist yet.

**Step 3: Write minimal implementation**

Move texture URL helpers, shared cache helpers, and preload utilities from `src/Scene.tsx` into `src/assets/texture-cache.ts` and `src/assets/asset-urls.ts`. Keep the runtime behavior unchanged.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/assets/texture-cache.ts src/assets/asset-urls.ts src/Scene.tsx src/Scene.camera.test.ts
git commit -m "refactor: extract scene asset cache utilities"
```

### Task 3: Extract isolated visual effects and scene-local UI pieces

**Files:**
- Create: `src/components/Favicon.tsx`
- Create: `src/components/Flag.tsx`
- Create: `src/effects/Shockwave.tsx`
- Create: `src/effects/LaserStrike.tsx`
- Modify: `src/Scene.tsx`

**Step 1: Write the failing test**

Add a narrow test for any pure helper currently embedded in the dashboard animation path that can be validated outside JSX, such as text formatting or scramble assembly behavior.

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts`
Expected: FAIL because the helper export does not exist yet.

**Step 3: Write minimal implementation**

Extract the flag, favicon, and isolated effect components into scene-local modules. Move any small pure helper required by those components into a stable export without changing the current visuals.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Favicon.tsx src/components/Flag.tsx src/effects/Shockwave.tsx src/effects/LaserStrike.tsx src/Scene.tsx src/Scene.camera.test.ts
git commit -m "refactor: split scene effects and ui primitives"
```

### Task 4: Extract tower, dashboard, background, camera, and preloader modules

**Files:**
- Create: `src/components/HologramDashboard.tsx`
- Create: `src/components/Tower.tsx`
- Create: `src/components/BackgroundEnvironment.tsx`
- Create: `src/scene/camera-updater.tsx`
- Create: `src/scene/asset-preloader.tsx`
- Modify: `src/Scene.tsx`
- Modify: `src/scene-logic.ts`
- Test: `src/Scene.camera.test.ts`

**Step 1: Write the failing test**

Add or expand tests for any pure helper that becomes explicit during extraction, especially around scene timing, focus windows, or render-mode decisions used by the new modules.

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts`
Expected: FAIL because the new module boundary relies on helpers that are not exported yet or do not match the current behavior.

**Step 3: Write minimal implementation**

Move the scene-local modules out of `src/Scene.tsx` while keeping `src/Scene.tsx` as a thin composition assembler. Keep all camera and preload behavior identical to the current output.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/HologramDashboard.tsx src/components/Tower.tsx src/components/BackgroundEnvironment.tsx src/scene/camera-updater.tsx src/scene/asset-preloader.tsx src/Scene.tsx src/scene-logic.ts src/Scene.camera.test.ts
git commit -m "refactor: modularize scene orchestration and components"
```

### Task 5: Reorganize the modularized scene into a composition-oriented structure

**Files:**
- Create: `src/compositions/ranking-towers/index.tsx`
- Create: `src/compositions/ranking-towers/scene/Scene.tsx`
- Create: `src/compositions/ranking-towers/scene/scene-logic.ts`
- Create: `src/compositions/ranking-towers/scene/camera-updater.tsx`
- Create: `src/compositions/ranking-towers/scene/asset-preloader.tsx`
- Create: `src/compositions/ranking-towers/components/HologramDashboard.tsx`
- Create: `src/compositions/ranking-towers/components/Tower.tsx`
- Create: `src/compositions/ranking-towers/components/BackgroundEnvironment.tsx`
- Create: `src/compositions/ranking-towers/components/Favicon.tsx`
- Create: `src/compositions/ranking-towers/components/Flag.tsx`
- Create: `src/compositions/ranking-towers/effects/Shockwave.tsx`
- Create: `src/compositions/ranking-towers/effects/LaserStrike.tsx`
- Create: `src/compositions/ranking-towers/assets/texture-cache.ts`
- Create: `src/compositions/ranking-towers/assets/asset-urls.ts`
- Create: `src/compositions/ranking-towers/model/data.ts`
- Create: `src/compositions/ranking-towers/model/types.ts`
- Create: `src/compositions/ranking-towers/tests/scene-logic.test.ts`
- Modify: `src/Root.tsx`
- Modify: `src/index.ts`
- Modify: `src/Scene.camera.test.ts`

**Step 1: Write the failing test**

Create a scene-logic test in the new composition path and update imports so the tests target the new canonical module location.

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: FAIL because the new structure is not wired yet.

**Step 3: Write minimal implementation**

Move the modularized scene into `src/compositions/ranking-towers/` and update root composition imports. Keep compatibility shims only if they materially reduce migration risk.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers src/Root.tsx src/index.ts src/Scene.camera.test.ts
git commit -m "refactor: move ranking tower scene into composition structure"
```

### Task 6: Add universal modularity standards to the project rules

**Files:**
- Modify: `Rules/PROJECT_RULES.md`
- Modify: `docs/plans/2026-03-11-scene-modularity-design.md`

**Step 1: Write the failing test**

Write a short checklist in the design doc that the rules update must satisfy:
- universal wording, not project-specific wording
- clear module boundaries
- explicit anti-patterns
- guidance on scene-local versus shared modules

**Step 2: Run test to verify it fails**

Run: review `Rules/PROJECT_RULES.md`
Expected: FAIL because the modularity guidance is incomplete or too project-specific.

**Step 3: Write minimal implementation**

Add a universal modularity section and modularity anti-patterns to `Rules/PROJECT_RULES.md`, keeping the language applicable to future `Remotion + React + Three.js/3D` projects.

**Step 4: Run test to verify it passes**

Run: review `Rules/PROJECT_RULES.md`
Expected: PASS because the document now includes universal modularity rules and anti-patterns.

**Step 5: Commit**

```bash
git add Rules/PROJECT_RULES.md docs/plans/2026-03-11-scene-modularity-design.md
git commit -m "docs: add universal modularity rules for remotion projects"
```

### Task 7: Run full verification for the modular refactor baseline

**Files:**
- Modify: `docs/plans/2026-03-11-scene-modularity.md`

**Step 1: Run focused tests**

Run: `node --test src/Scene.camera.test.ts src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 2: Run static verification**

Run: `npm run lint`
Expected: PASS

**Step 3: Run bundle verification**

Run: `npm run build`
Expected: PASS

**Step 4: Run visual verification**

Run: `npm run dev`
Expected: Remotion Studio opens and critical frames can be inspected without structural regressions.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-11-scene-modularity.md
git commit -m "docs: finalize modular remotion refactor plan"
```
