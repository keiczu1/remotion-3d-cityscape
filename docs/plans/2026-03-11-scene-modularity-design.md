# Scene Modularity Design

**Goal:** Restructure the current Remotion scene into a modular architecture that preserves behavior now, scales to multiple compositions later, and adds universal modularity guidance to the project rules.

**Scope**
- Refactor the current single-scene structure without changing visible behavior as the first milestone.
- Introduce a target folder structure that supports multiple compositions in one repository.
- Update `Rules/PROJECT_RULES.md` with universal modularity rules for `Remotion + React + Three.js/3D` projects.

**Constraints**
- Keep current camera behavior, timing, reveal choreography, materials, and visible output unchanged during the first refactor pass.
- Avoid premature generalization into `shared` modules.
- Keep pure logic testable outside the Remotion canvas.
- Keep the rules document universal rather than specific to this repository.

**Chosen Approach**
- Use a hybrid path:
  - first, split the current scene into responsibility-based modules with no intended behavior change;
  - second, move the modularized scene into a composition-oriented folder structure for future scenes;
  - third, let new scenes follow the new structure from the start.

**Design**

## 1. Target Architecture
- The repository should support multiple scenes by organizing code around compositions instead of one flat `src/` layout.
- Each scene keeps its own orchestration, scene logic, camera logic, preload strategy, local components, and model types.
- Reusable modules move into `shared/` only after actual repeated use or when the abstraction is already stable and scene-agnostic.

Example direction:

```text
src/
  compositions/
    ranking-towers/
      index.tsx
      scene/
        Scene.tsx
        scene-logic.ts
        camera.ts
        preloader.ts
      components/
        Tower.tsx
        HologramDashboard.tsx
        BackgroundEnvironment.tsx
      effects/
        Shockwave.tsx
        LaserStrike.tsx
      assets/
        texture-cache.ts
        asset-urls.ts
      model/
        data.ts
        types.ts
      tests/
        scene-logic.test.ts
  shared/
    remotion/
    three/
    assets/
    ui/
    utils/
```

## 2. Module Boundaries
- `scene/` owns orchestration and scene-level policy: timeline, camera path, render modes, preload windows, scene assembly.
- `components/` owns visual units that should not know the whole story of the video.
- `effects/` owns isolated visual effects that would otherwise bloat JSX and hot-path code.
- `assets/` owns texture URL helpers, caches, and preload utilities.
- `model/` owns scene data, stable types, and scene-specific content.
- `shared/` owns only modules that are proven reusable across multiple compositions.

Dependency direction should remain one-way:
- `model -> logic -> components -> scene`

## 3. Universal Modularity Rules
- A scene must not remain a single large file once it mixes orchestration, pure logic, asset policy, preload, effects, and JSX assembly.
- New code should default to scene-local modules. Promotion to `shared` requires real reuse or a clearly stable abstraction.
- Pure logic must be separated from JSX and Three.js assembly.
- Camera logic, preload logic, asset cache logic, model/data, and visual components should be separated by responsibility.
- One module should answer one primary question. A file that decides timing, renders UI, warms assets, and drives the camera at once is poorly bounded.
- Reusability should not be guessed in advance. Premature `shared` is as harmful as a monolithic scene.
- Logic that can be tested without canvas rendering should be extracted into testable modules.

Universal anti-patterns:
- one giant `Scene.tsx` containing most project behavior;
- a `shared` directory that becomes a dump for unrelated helpers;
- duplicated timing logic across multiple components;
- preload and cache code hidden inside arbitrary UI components;
- scene-specific code pushed into `shared` too early;
- behavior changes performed through ad hoc JSX edits instead of logic modules.

## 4. Migration Strategy
- Step 1: Extract modules from the current scene without changing intended behavior.
- Step 2: Move the modularized scene into a composition-oriented folder structure.
- Step 3: Create future scenes directly in the new structure.

Migration guardrails:
- Do not mix behavior changes with structural refactors in the same step.
- Do not generalize APIs at the same time as moving files unless there is a proven use case.
- Preserve testable contracts for camera state, render mode, preload windows, and duration.
- If a module is hard to extract without rewriting half the scene, the boundary is probably too broad.

## 5. Verification
- Keep logic-level tests for camera state, focus handoff, render modes, preload windows, and duration behavior.
- Add or update tests as modules move so contracts remain explicit.
- Run static checks (`eslint`, `tsc`) after each extraction batch.
- Perform manual visual verification in Remotion Studio on critical frames:
  - tower arrival;
  - tower-to-tower handoff;
  - cinematic tail;
  - asset-heavy reveal windows.

**Success Criteria**
- The current scene is no longer a monolithic file.
- Scene-local and shared responsibilities are clearly separated.
- The repository can host multiple compositions without flattening all code into one folder.
- `Rules/PROJECT_RULES.md` defines universal modularity standards, not project-specific shortcuts.
