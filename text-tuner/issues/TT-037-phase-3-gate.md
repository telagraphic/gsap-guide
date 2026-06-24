---
id: TT-037
title: Phase 3 gate — v2 single-instance parity
phase: 3
status: done
blocked_by:
  - TT-033
  - TT-034
  - TT-035
  - TT-036
tests:
  - npm test
acceptance_tests:
  - AT-005
  - AT-020
  - AT-021
  - AT-022
  - AT-030
  - AT-031
  - AT-032
  - AT-033
  - AT-034
---

## What to build

Phase 3 quality gate: full control panel works for a single instance with v2-equivalent behavior. CSS may be unstyled/minimal until Phase 4 — function parity first.

## Acceptance criteria

- [ ] TT-030 through TT-036 done
- [ ] `npm test` green
- [ ] Panel open/close, tabs, live ST/tween, commit rebuild, dock copy
- [ ] v2 compat attach tunes identically (AT-005)
- [ ] v3-refactor-plan checklist §D + §E complete
- [ ] No file > ~400 lines in panel/attach

## Blocked by

- TT-033
- TT-034
- TT-035
- TT-036

## Tests

Run P0 panel tests AT-020–022, AT-030–034, AT-005. Document any visual gaps deferred to Phase 4.
