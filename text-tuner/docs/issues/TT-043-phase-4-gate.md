---
id: TT-043
title: Phase 4 gate — visual parity
phase: 4
status: done
blocked_by:
  - TT-042
tests: []
acceptance_tests:
  - AT-020
  - AT-021
  - AT-022
---

## What to build

Phase 4 quality gate: panel visually matches v2 light sidebar instrument. v3-refactor-plan checklist §F complete.

## Acceptance criteria

- [ ] TT-040–TT-042 done
- [ ] Token → component mapping verified against COMPONENT_AUDIT
- [ ] No magic numbers outside `--tt-space-*` in new CSS
- [ ] INTERFACE_RULES checklist §11 satisfied

## Blocked by

- TT-042

## Tests

Visual QA all tabs + dock + footer. Keyboard navigation AT-021, AT-022.
