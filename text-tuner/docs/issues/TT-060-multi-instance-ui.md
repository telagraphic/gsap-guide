---
id: TT-060
title: Instance dropdown and switch-with-commit
phase: 6
status: done
blocked_by:
  - TT-052
tests: []
acceptance_tests:
  - AT-050
  - AT-051
---

## What to build

Multi-instance UI: header dropdown above tabs listing all registry ids (hidden when one instance). Switch commits current → hydrates next. Per-id session already in InstanceManager; wire UI per PRD §10.2.

## Acceptance criteria

- [ ] `.tt-panel__instance` dropdown in header
- [ ] `switchTo(id)` commits before hydrate
- [ ] Footer shows active instance hint when multi-instance
- [ ] Export scoped to active instance only
- [ ] Remove URL `?playground=` interim from demo docs when dropdown ships

## Blocked by

- TT-052

## Tests

Manual AT-050, AT-051 (multi-instance switch, no cross-contamination).
