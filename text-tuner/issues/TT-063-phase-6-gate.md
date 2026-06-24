---
id: TT-063
title: Phase 6 gate — full P0 acceptance
phase: 6
status: done
blocked_by:
  - TT-061
  - TT-062
tests:
  - npm test
acceptance_tests:
  - AT-001
  - AT-002
  - AT-005
  - AT-010
  - AT-020
  - AT-030
  - AT-031
  - AT-032
  - AT-033
  - AT-040
  - AT-041
  - AT-042
  - AT-050
  - AT-051
---

## What to build

Phase 6 quality gate: all v3 features complete. Run full P0 suite from ACCEPTANCE_TESTS.md. PRD §19 success criteria checked.

## Acceptance criteria

- [ ] TT-060–TT-062 done
- [ ] All listed AT-* P0 scenarios pass
- [ ] `npm test` green
- [ ] v3-refactor-plan checklist §H complete
- [ ] Ready for package publish prep

## Blocked by

- TT-061
- TT-062

## Tests

Full P0 manual pass documented in test run notes (create `issues/test-runs/` log optional).
