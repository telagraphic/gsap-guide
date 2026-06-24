---
id: TT-012
title: Phase 1 gate — schema quality
phase: 1
status: done
blocked_by:
  - TT-011
tests:
  - npm test
acceptance_tests: []
---

## What to build

Phase 1 quality gate: schema layer is complete, tested, and ready for runner import. No duplicated `typeIncludes` / `normalizeStagger` outside schema.

## Acceptance criteria

- [x] TT-010 and TT-011 done
- [x] All schema modules importable from `schema/index.js`
- [x] `npm test` green (15 tests)
- [x] v3-refactor-plan checklist §B fully checked
- [x] Runner/panel code not started yet (schema-only phase)

## Blocked by

- TT-011

## Tests

```bash
cd text-tuner && npm test
```

Manual: verify `buildScaffoldConfig("hero-lines")` produces valid SplitScrollConfig shape per PRD §6.
