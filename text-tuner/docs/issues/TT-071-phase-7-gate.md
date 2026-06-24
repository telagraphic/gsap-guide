---
id: TT-071
title: Phase 7 gate — release cutover
phase: 7
status: done
blocked_by:
  - TT-070
tests:
  - npm test
acceptance_tests: []
---

## What to build

Final cutover: deprecate legacy playground-v2, update root README links, confirm all refactor plan success criteria. `split-text/` removed from repo after fonts migrated to `examples/fonts-full/fonts/`.

## Acceptance criteria

- [ ] TT-070 done
- [ ] Deprecation notice in v2 folder README
- [ ] text-tuner README status → implementation complete / beta
- [ ] All 6 refactor plan success criteria met
- [ ] QUEUE.md all issues `done`

## Blocked by

- TT-070

## Tests

Full regression: `npm test` + spot-check P0 acceptance on migrated demo.
