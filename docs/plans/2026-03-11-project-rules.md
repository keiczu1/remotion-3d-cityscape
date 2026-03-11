# Project Rules Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a permanent `Rules/PROJECT_RULES.md` document in Russian for humans and AI agents working on this Remotion project.

**Architecture:** Use a single top-level rules document as the canonical project standard. Keep the content structured enough to split later if the project grows.

**Tech Stack:** Markdown, project repository conventions, Remotion, React, Three.js

---

### Task 1: Create the top-level Rules directory and main document

**Files:**
- Create: `Rules/PROJECT_RULES.md`

**Step 1: Draft the document structure**

Include sections for:
- project principles
- FPS and performance
- Remotion workflow
- React / Three / 3D
- assets and preload
- animation and timing
- anti-patterns
- verification checklist

**Step 2: Write the document**

Use Russian. Make it useful to both humans and AI agents. Include both required practices and mistakes to avoid.

**Step 3: Review the document**

Check that the wording is specific, not generic, and reflects the current project constraints.

### Task 2: Save supporting design note

**Files:**
- Create: `docs/plans/2026-03-11-project-rules-design.md`

**Step 1: Save the approved document design**

Record the chosen structure, audience, and intent.

### Task 3: Verify repository consistency

**Files:**
- Create: `docs/plans/2026-03-11-project-rules.md`

**Step 1: Confirm placement**

Verify that the project now contains:
- `Rules/PROJECT_RULES.md`
- the corresponding design note
- this implementation plan

**Step 2: Final review**

Ensure the rules explicitly cover common FPS regressions, Remotion mistakes, code structure, and required verification steps.
