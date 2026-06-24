---
id: TT-020
title: Extract generic runner
phase: 2
status: done
blocked_by:
  - TT-012
tests:
  - npm test
acceptance_tests:
  - AT-010
---

## What to build

Port v2 `tuner/animation.js` to `createSplitScrollRunner(config)` returning `{ teardown, runtime: { applyLive, getConfig } }`. Import shared logic from `schema/` — delete duplicate `typeIncludes`, `deepMerge`, stagger normalization in runner. Remove inline runner duplicate from sample-playground script.

Runner receives full SplitScrollConfig; never reads form DOM.

## Acceptance criteria

- [x] `runner/create-split-scroll-runner.js` exports factory per PRD §7.4
- [x] `applyLive` updates tween + ScrollTrigger without re-split
- [x] Zero duplicate schema helpers in runner
- [x] Sample script imports runner from text-tuner; tuner uses `animation.mjs` bridge
- [x] GSAP plugin registration documented in `src/runner/README.md`

## Blocked by

- TT-012

## Tests

```bash
cd text-tuner && npm test
```

Manual: load demo page, confirm SplitText + ScrollTrigger run from config object (AT-010 partial).
