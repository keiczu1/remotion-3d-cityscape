# FPS Optimization Design

**Goal:** Keep the Remotion render smooth through the full video, especially during tower focus and dashboard appearance, without visible design degradation.

**Constraints**
- Preserve the existing camera language, timing, palette, materials, and animation feel in visible shots.
- Optimize internal render cost only; no visible simplification of in-frame content.
- Prioritize stable final renders and keep Studio preview responsive when possible.

**Problem Summary**
- FPS drops when the camera focuses on a tower and the dashboard starts appearing.
- The current hot path stacks several expensive operations on the same frames:
  - `Text` mesh creation and content churn in `HologramDashboard`
  - `RoundedBox` and transient effect mounts
  - favicon texture loading and GPU initialization
  - flag shader updates and transparent materials
  - full-scene background animation continuing while the camera only needs a small visible subset

**Chosen Approach**
- Keep the visible design identical in camera-facing content.
- Remove hidden performance spikes by preloading resources, reusing mounted structures, and culling work that cannot affect the current frame.
- Add camera-aware visibility rules so off-screen towers and background actors stop consuming work without changing the rendered image.

**Design**

## 1. Resource Preloading
- Preload favicon and flag textures before their tower becomes active.
- Replace per-instance texture initialization spikes with a shared cache.
- Ensure GPU resources exist before the corresponding appearance animation begins.

## 2. Stable Dashboard Mounts
- Restructure `HologramDashboard` so the heavy visual tree stays mounted once a tower becomes relevant.
- Animate transforms and opacity instead of creating multiple heavy nodes on the exact reveal frame.
- Keep the same visual choreography for the active tower.

## 3. Camera-Aware Culling
- Compute which towers can materially affect the current camera shot.
- Skip dashboard, flag, and optional tower-side detail for towers outside the current focus window.
- Cull only when the object is guaranteed to be off-screen or visually irrelevant.

## 4. Background Budgeting
- Keep skyline and large-scale scene composition intact.
- Reduce per-frame updates for clouds, trees, birds, and the airplane when they cannot influence the visible frame.
- Preserve the visible atmosphere while removing waste outside the camera cone.

## 5. Shared Geometry and Material Reuse
- Move repeated transient geometry and material creation into shared caches where practical.
- Avoid recreating buffers for reveal effects on hot frames.

## 6. Verification
- Keep existing camera behavior tests passing.
- Add tests around focus-window logic to ensure visible towers are not culled too early.
- Validate with linting, type-checking, and a render/build pass.
