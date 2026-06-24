---
id: TT-062
title: Follow viewport, reset all, overlap warning
phase: 6
status: done
blocked_by:
  - TT-060
tests: []
acceptance_tests:
  - AT-011
  - AT-052
  - AT-053
---

## What to build

Remaining v3 header actions: follow viewport (IO on trigger, default off), reset instance, reset all. Overlap boot warning in discover validateDom when split artifacts exist on `[data-playground]`.

## Acceptance criteria

- [ ] Follow viewport toggle in header actions
- [ ] Reset instance → code defaults + clear session key
- [ ] Reset all → all ids + all `storageKey:*` keys
- [ ] Overlap warning per AT-011
- [ ] Follow viewport switches active instance when enabled + panel open (PRD §12)

## Blocked by

- TT-060

## Tests

Manual AT-011, AT-052, AT-053.
