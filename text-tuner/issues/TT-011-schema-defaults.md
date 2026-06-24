---
id: TT-011
title: Schema defaults and anim-props constants
phase: 1
status: done
blocked_by:
  - TT-010
tests:
  - npm test
acceptance_tests: []
---

## What to build

Complete the schema layer: global scaffold defaults, per-id `buildScaffoldConfig(id)`, and panel constants (`ANIM_PROPS`, `EASE_OPTIONS`, `STAGGER_FROM`, default font list placeholder). Export via schema barrel. Add tests for scaffold shape and id-based selectors.

Scaffold must set:

```javascript
{
  targets: {
    element: `[data-playground-trigger="${id}"]`,
    text: `[data-playground="${id}"]`,
  },
  scrollTrigger: { trigger: `[data-playground-trigger="${id}"]`, /* … */ },
  __schema: SCHEMA_VERSION,
}
```

## Acceptance criteria

- [x] `schema/defaults.js` — DEFAULT_CONFIG + buildScaffoldConfig(id, overrides?)
- [x] `schema/anim-props.js` — ANIM_PROPS, EASE_OPTIONS, STAGGER_FROM (fonts list deferred to manifest in Phase 5)
- [x] Barrel exports updated
- [x] Tests: scaffold for unknown id has correct selectors; deepMerge with define patch works
- [x] No DOM/GSAP imports

## Blocked by

- TT-010

## Tests

```bash
cd text-tuner && npm test
```
