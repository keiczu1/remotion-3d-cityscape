# Appearance SFX Design

**Goal:** Add an automatic sound layer that accompanies object appearances with relevant, cinematic reveal sounds chosen by the character of the animation rather than by object type.

**Scope**
- Cover automatic sound accompaniment for object appearance events.
- Base sound selection on the reveal motion profile, not on domain entity type.
- Keep sound logic in scene-level logic and audio-specific modules, not inside visual leaf components.
- Preserve a cinematic, show-oriented sound language that stays consistent across scenes.

**Constraints**
- Sound timing must be deterministic and frame-based.
- The system must avoid sound spam during dense reveal windows.
- Similar appearance motions should sound stylistically consistent while still allowing light variation.
- The approach should fit the repository's existing preference for scene logic, explicit timing, and testable pure modules.

**Chosen Approach**
- Use a hybrid system:
  - define a small set of curated appearance profiles;
  - describe each object reveal with an explicit `appearance descriptor`;
  - resolve the descriptor into a `sound recipe` made of one to three audio layers;
  - render all resolved cues from one scene-level soundtrack layer.

**Design**

## 1. Appearance Profiles
- The system should use five reveal profiles:
  - `soft-reveal`
  - `pop-reveal`
  - `sweep-reveal`
  - `impact-reveal`
  - `tech-reveal`
- These profiles are not object categories. They are cinematic motion gestures.
- The same object can produce different sounds in different scenes if its reveal behavior changes.

Profile intent:
- `soft-reveal`: fade-in, blur-out, gentle materialization, low aggression.
- `pop-reveal`: scale-in with overshoot, UI-like snap, quick materialize.
- `sweep-reveal`: directional arrival, slide-in, whoosh-based reveal.
- `impact-reveal`: heavy arrival, strong lock-in, large visual emphasis.
- `tech-reveal`: scan, digital build-up, glitch or neon-style reveal.

## 2. Appearance Descriptor
- The system should not infer reveal semantics by scraping arbitrary JSX or animation formulas.
- Scene logic should emit an explicit `appearance descriptor` for each reveal event.
- Recommended descriptor fields:
  - `kind`: `fade | scale | slide | impact | tech`
  - `durationFrames`
  - `intensity`: `0..1`
  - `direction`: `left | right | up | down | none`
  - `hasOvershoot`
  - `hasSettle`
  - `sizeClass`: `small | medium | large`

Why this is preferred:
- the reveal intent remains stable even when JSX details change;
- the logic is testable without canvas rendering;
- timing and sound stay aligned with the scene-logic architecture already preferred by the project.

## 3. Automatic Profile Resolution
- A pure resolver should map the descriptor into one of the five profiles.
- Baseline mapping:
  - `fade` + low intensity -> `soft-reveal`
  - `scale` + overshoot -> `pop-reveal`
  - `slide` + direction -> `sweep-reveal`
  - high intensity + settle -> `impact-reveal`
  - `tech` -> `tech-reveal`
- The resolver should stay semantic and curated, not overfit to every low-level motion parameter.

## 4. Sound Recipe Model
- A profile should map to a `sound recipe`, not to a single file.
- A recipe may contain up to three layers:
  - `transient`: marks the exact appearance beat;
  - `body`: carries the main gesture;
  - `tail`: adds space, polish, and cinematic finish.

Example recipe direction:
- `soft-reveal` -> soft transient + airy body + shimmer tail
- `pop-reveal` -> click transient + pop body + tiny sparkle tail
- `sweep-reveal` -> whoosh body + settle accent
- `impact-reveal` -> hit transient + low body + short tail
- `tech-reveal` -> digital transient + synth body + bright tail

## 5. Variation and Modifiers
- To avoid repetition, each recipe should expose a small curated set of variants per layer.
- Variant choice should be deterministic via `seed`.
- Modifiers should adjust the chosen recipe without changing its identity:
  - `intensity` adjusts volume and harder/softer variant choice;
  - `sizeClass` adjusts weight and tail length;
  - `direction` influences directional sweep selection;
  - `durationFrames` can adjust trim or playback feel for the body layer.

This preserves style while preventing obvious copy-paste repetition.

## 6. Timing Model
- Sound playback must remain frame-based and deterministic.
- Each appearance event should include:
  - `id`
  - `startFrame`
  - `descriptor`
  - `seed`
- Default timing policy:
  - `transient` starts on reveal start;
  - `body` may shift by a few frames depending on profile;
  - `tail` is either embedded in the chosen asset or rendered as a second/third layer.

## 7. Architecture
- Scene logic should emit `appearance events`.
- A pure `sound resolver` should convert events into `resolved sound cues`.
- One scene-level React component should render all `<Audio />` instances through `<Sequence>`.

Recommended module direction:
- `model/` defines types for descriptors, events, and resolved cues.
- `scene/` or `model/` emits reveal events with `startFrame`.
- `sound/` resolves profile and recipe selection.
- `components/SceneSoundtrack.tsx` renders cues.
- `public/sfx/appearance/...` stores the curated sound library.

This keeps sound policy out of leaf visual components and aligned with the project's scene-logic principles.

## 8. Density and Mix Guardrails
- Do not allow more than one dominant appearance cue in a very short window unless the scene intentionally stages a compound reveal.
- Minor repeated reveals should fall back to lighter or shortened variants.
- When a stronger musical or narrative hit already exists, appearance SFX should reduce to a lighter cue or a transient-only version.
- The system should support simple density throttling so clustered reveal events do not collapse into noise.

## 9. Verification Strategy
- Unit-test profile resolution from descriptors.
- Unit-test deterministic recipe selection from `seed` and modifiers.
- Unit-test density reduction behavior for clustered events.
- Perform manual audio review in Remotion Studio on critical reveal windows:
  - soft panel reveal;
  - directional object entrance;
  - heavy hero reveal;
  - repeated small object reveals in a short window.

**Success Criteria**
- Appearance sounds are selected automatically from reveal semantics.
- Similar reveal motions sound consistent across the composition.
- Repeated appearance cues vary slightly without losing identity.
- Dense scenes remain readable and do not devolve into whoosh/pop spam.
- The implementation fits the existing scene-logic architecture and remains testable without relying on JSX inspection.

## Rules Update Checklist
- Reveal sound semantics must come from scene logic, not from ad hoc JSX placement.
- Sound selection must be keyed by appearance profile, not by object type.
- Dense reveal windows must use throttling or cue reduction rules.
- Sound rendering must stay out of leaf visual components and live in scene-level sound modules.
