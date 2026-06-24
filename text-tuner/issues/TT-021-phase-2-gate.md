---
id: TT-021
title: Phase 2 gate — runner + schema
phase: 2
status: done
blocked_by:
  - TT-020
tests:
  - npm test
acceptance_tests:
  - AT-001
  - AT-010
---

## What to build

Phase 2 quality gate: runner works end-to-end with schema config on a `[data-playground]` element (panel not required yet).

## Acceptance criteria

- [x] TT-020 done
- [x] Single config → runner → visible scroll animation on demo element (manual — user test)
- [x] `applyLive` changes duration or ST start without full re-split (manual)
- [x] v3-refactor-plan checklist §C complete
- [x] `npm test` green (23 tests)

## Blocked by

- TT-020

## Tests

```bash
cd text-tuner && npm test
npm run demo
```

Open `http://localhost:3000/examples/sample-playground/` — manual AT-001 and AT-010.
