# Ranking Towers FPS Optimization Design

**Date:** 2026-03-11

## Goal

Improve `ranking-towers` preview and render performance without visible design degradation.

## Constraints

- Keep the current camera path, lighting, composition timing, and visual language.
- Do not reduce the number of towers or remove visible scene elements.
- Prefer optimizations that reduce repeated CPU / React / GPU work while preserving the same output.

## Chosen Approach

The first optimization pass will focus on internal efficiency only:

1. Precompute per-frame tower state once in scene logic instead of recalculating focus and render mode inside every tower.
2. Skip expensive dashboard string scrambling and effect math for towers that render the static standby / cinematic card.
3. Reuse more shared Three.js geometry and materials for repeated decorative tower meshes.
4. Reduce unnecessary asset-preload churn by avoiding repeated work for already requested tower assets.

## Not In Scope For This Pass

- Design simplification or reduced scene density.
- Replacing cards with impostors.
- Lowering visual quality settings for final output.
- Large-scale environment instancing refactors unless the first pass is insufficient.

## Success Criteria

- Scene logic does less repeated work per frame.
- Standby and cinematic towers avoid full animated dashboard computation.
- Existing tests still pass and new tests cover the extracted frame-state behavior.
- Visual output remains materially unchanged.
