---
id: TT-052
title: Phase 5 gate — fonts optional
phase: 5
status: done
blocked_by:
  - TT-051
tests: []
acceptance_tests: []
---

## What to build

Phase 5 quality gate: package works without consumer fonts; demo loads full preview library.

## Acceptance criteria

- [ ] TT-050–TT-051 done
- [ ] npm consumer can use system fonts + optional `fonts.css`
- [ ] Panel chrome never depends on preview font pack
- [ ] Success criterion #5 from refactor plan met

## Blocked by

- TT-051

## Tests

Load package without `fonts.css` — panel opens; typography uses fallback or attach override only.
