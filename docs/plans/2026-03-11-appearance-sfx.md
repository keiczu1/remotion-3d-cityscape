# Appearance SFX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an automatic appearance-sound system for the `ranking-towers` composition so object reveals are accompanied by relevant cinematic SFX chosen from reveal semantics.

**Architecture:** The implementation keeps reveal sound policy in scene-local pure modules. Scene logic emits appearance events with explicit descriptors, a sound resolver maps them to curated reveal profiles and layered sound recipes, and one scene-level soundtrack component renders the resulting `<Audio />` cues. This keeps sound behavior deterministic, testable, and aligned with the repository's existing scene-logic architecture.

**Tech Stack:** Remotion 4, React 19, `@remotion/media`, TypeScript, node:test, Markdown

---

### Task 1: Define appearance-sound domain types

**Files:**
- Modify: `src/compositions/ranking-towers/model/types.ts`
- Test: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Write the failing test**

Add type-driven fixture coverage in `src/compositions/ranking-towers/tests/scene-logic.test.ts` that imports the new appearance-sound exports and builds one valid sample descriptor, event, and resolved cue object.

**Step 2: Run test to verify it fails**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: FAIL because the appearance-sound types do not exist yet.

**Step 3: Write minimal implementation**

Add the new scene-local types to `src/compositions/ranking-towers/model/types.ts`:
- `AppearanceKind`
- `AppearanceSoundProfile`
- `AppearanceDescriptor`
- `AppearanceEvent`
- `ResolvedSoundCue`
- `ResolvedSoundLayer`

Keep the types minimal and specific to appearance SFX.

**Step 4: Run test to verify it passes**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/model/types.ts src/compositions/ranking-towers/tests/scene-logic.test.ts
git commit -m "feat: add appearance sound domain types"
```

### Task 2: Add profile classification helpers

**Files:**
- Create: `src/compositions/ranking-towers/sound/appearance-profile.ts`
- Modify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Write the failing test**

Add pure tests for profile resolution:
- `fade` + low intensity resolves to `soft-reveal`
- `scale` + overshoot resolves to `pop-reveal`
- `slide` + direction resolves to `sweep-reveal`
- high intensity + settle resolves to `impact-reveal`
- `tech` resolves to `tech-reveal`

**Step 2: Run test to verify it fails**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: FAIL because the classifier module does not exist yet.

**Step 3: Write minimal implementation**

Create `src/compositions/ranking-towers/sound/appearance-profile.ts` with a pure resolver:
- `resolveAppearanceSoundProfile(descriptor)`
- any tiny helper functions needed for readability

Do not include asset selection yet.

**Step 4: Run test to verify it passes**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/sound/appearance-profile.ts src/compositions/ranking-towers/tests/scene-logic.test.ts
git commit -m "feat: classify appearance descriptors into sound profiles"
```

### Task 3: Define the curated appearance sound library

**Files:**
- Create: `src/compositions/ranking-towers/sound/appearance-library.ts`
- Create: `public/sfx/appearance/.gitkeep`
- Modify: `.gitignore`

**Step 1: Write the failing test**

Add a narrow test fixture that imports the appearance library and asserts every supported profile has at least one configured recipe and each recipe layer references a `staticFile`-compatible relative asset path.

**Step 2: Run test to verify it fails**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: FAIL because the appearance library module does not exist yet.

**Step 3: Write minimal implementation**

Create `src/compositions/ranking-towers/sound/appearance-library.ts` with:
- profile-to-recipe configuration
- per-layer variant arrays
- relative asset path strings under `sfx/appearance/...`

Create `public/sfx/appearance/.gitkeep` so the target asset directory exists even before final sound files are added.

Update `.gitignore` only if needed so the library path is tracked while real binary assets can still be managed intentionally.

**Step 4: Run test to verify it passes**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/sound/appearance-library.ts public/sfx/appearance/.gitkeep .gitignore src/compositions/ranking-towers/tests/scene-logic.test.ts
git commit -m "feat: add curated appearance sound library config"
```

### Task 4: Resolve events into layered sound cues

**Files:**
- Create: `src/compositions/ranking-towers/sound/resolve-appearance-cues.ts`
- Modify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Write the failing test**

Add tests for cue resolution:
- deterministic variant selection from the same `seed`
- different seeds can select different variants within one profile
- `intensity` changes layer gain or harder/softer variant choice
- `durationFrames` and directional descriptors influence timing metadata without breaking determinism

**Step 2: Run test to verify it fails**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: FAIL because the cue resolver does not exist yet.

**Step 3: Write minimal implementation**

Create `src/compositions/ranking-towers/sound/resolve-appearance-cues.ts` with pure helpers that:
- resolve the profile
- choose recipe variants from `seed`
- build one or more `ResolvedSoundCue` records with `startFrame`, `src`, `volume`, and any timing offsets

Keep it deterministic and free of React code.

**Step 4: Run test to verify it passes**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/sound/resolve-appearance-cues.ts src/compositions/ranking-towers/tests/scene-logic.test.ts
git commit -m "feat: resolve appearance events into layered sound cues"
```

### Task 5: Emit appearance events from scene logic

**Files:**
- Modify: `src/compositions/ranking-towers/scene/scene-logic.ts`
- Modify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`
- Modify: `src/Scene.camera.test.ts`

**Step 1: Write the failing test**

Add pure scene-logic tests that assert:
- the intro title reveal emits the expected appearance event
- tower arrival frames emit appearance events with stable `startFrame`
- reveal semantics are expressed as descriptors instead of JSX-only timing assumptions

If tower reveal behavior is not yet explicit, start with the intro title and one tower reveal contract.

**Step 2: Run test to verify it fails**

Run: `node --test src/Scene.camera.test.ts src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: FAIL because scene logic does not emit appearance events yet.

**Step 3: Write minimal implementation**

Extend `src/compositions/ranking-towers/scene/scene-logic.ts` with pure exports such as:
- `getAppearanceEvents()`
- optional helpers for intro or tower reveal descriptors

Use explicit frame values already present in scene logic. Do not derive sound semantics from JSX.

**Step 4: Run test to verify it passes**

Run: `node --test src/Scene.camera.test.ts src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/scene/scene-logic.ts src/compositions/ranking-towers/tests/scene-logic.test.ts src/Scene.camera.test.ts
git commit -m "feat: emit appearance events from ranking towers scene logic"
```

### Task 6: Add density throttling for clustered reveals

**Files:**
- Create: `src/compositions/ranking-towers/sound/density-policy.ts`
- Modify: `src/compositions/ranking-towers/tests/scene-logic.test.ts`

**Step 1: Write the failing test**

Add tests for clustered events:
- two major reveals in a very short window reduce the secondary cue
- repeated minor reveals collapse to lighter variants
- spacing outside the configured window preserves both cues

**Step 2: Run test to verify it fails**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: FAIL because no density policy exists yet.

**Step 3: Write minimal implementation**

Create `src/compositions/ranking-towers/sound/density-policy.ts` with a pure reducer that adjusts or filters resolved cues based on event density and simple priority rules.

Integrate it into the cue resolution path with the smallest possible surface area.

**Step 4: Run test to verify it passes**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/sound/density-policy.ts src/compositions/ranking-towers/tests/scene-logic.test.ts src/compositions/ranking-towers/sound/resolve-appearance-cues.ts
git commit -m "feat: add density policy for appearance cues"
```

### Task 7: Render the resolved cues in one scene soundtrack component

**Files:**
- Create: `src/compositions/ranking-towers/components/SceneSoundtrack.tsx`
- Modify: `src/compositions/ranking-towers/scene/Scene.tsx`
- Modify: `package.json`

**Step 1: Write the failing test**

Add a light integration test or smoke-level assertion that the scene soundtrack component can be imported and built from resolved cues without throwing.

If the repo does not yet support React component tests, add a pure smoke test around a helper exported from the soundtrack module and document that visual/audio verification will cover final integration.

**Step 2: Run test to verify it fails**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: FAIL because the soundtrack component or helper does not exist yet.

**Step 3: Write minimal implementation**

Ensure `@remotion/media` is available in `package.json`.

Create `src/compositions/ranking-towers/components/SceneSoundtrack.tsx` that:
- imports the resolved cues
- renders `<Sequence>` + `<Audio>` per cue
- uses `staticFile()` with the configured sound asset paths

Mount `SceneSoundtrack` from `src/compositions/ranking-towers/scene/Scene.tsx` at the scene root, outside the Three.js canvas where appropriate.

**Step 4: Run test to verify it passes**

Run: `node --test src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/compositions/ranking-towers/components/SceneSoundtrack.tsx src/compositions/ranking-towers/scene/Scene.tsx package.json src/compositions/ranking-towers/tests/scene-logic.test.ts
git commit -m "feat: render automatic appearance soundtrack in ranking towers scene"
```

### Task 8: Document the appearance-sound workflow for future scenes

**Files:**
- Modify: `Rules/PROJECT_RULES.md`
- Modify: `docs/plans/2026-03-11-appearance-sfx-design.md`

**Step 1: Write the failing test**

Add a checklist to `docs/plans/2026-03-11-appearance-sfx-design.md` for the rules update:
- reveal sound semantics come from scene logic
- sounds are keyed by appearance profile, not object type
- dense reveal windows require throttling
- sound rendering stays out of leaf visual components

**Step 2: Run test to verify it fails**

Run: review `Rules/PROJECT_RULES.md`
Expected: FAIL because these sound-system rules are not documented yet.

**Step 3: Write minimal implementation**

Add a short universal rules section to `Rules/PROJECT_RULES.md` describing:
- explicit appearance descriptors
- scene-level cue generation
- density throttling
- avoidance of JSX-driven ad hoc sound placement

Keep wording reusable for future Remotion scenes.

**Step 4: Run test to verify it passes**

Run: review `Rules/PROJECT_RULES.md`
Expected: PASS because the project rules now capture the sound-system guidance.

**Step 5: Commit**

```bash
git add Rules/PROJECT_RULES.md docs/plans/2026-03-11-appearance-sfx-design.md
git commit -m "docs: add appearance sound system rules"
```

### Task 9: Run full verification for the appearance-sound baseline

**Files:**
- Modify: `docs/plans/2026-03-11-appearance-sfx.md`

**Step 1: Run focused tests**

Run: `node --test src/Scene.camera.test.ts src/compositions/ranking-towers/tests/scene-logic.test.ts`
Expected: PASS

**Step 2: Run static verification**

Run: `npm run lint`
Expected: PASS

**Step 3: Run build verification**

Run: `npm run build`
Expected: PASS

**Step 4: Run manual audio verification**

Run: `npm run dev`
Expected: Remotion Studio opens and the following moments can be reviewed with synchronized appearance SFX:
- intro title reveal
- first tower reveal
- mid-sequence reveal
- clustered reveal window
- final cinematic tail with no appearance-sound spam

**Step 5: Commit**

```bash
git add docs/plans/2026-03-11-appearance-sfx.md
git commit -m "docs: finalize appearance sound implementation plan"
```
