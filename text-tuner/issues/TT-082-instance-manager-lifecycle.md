---
id: TT-082
title: InstanceManager lifecycle ownership
phase: 8
status: done
blocked_by:
  - TT-081
tests:
  - npm test
acceptance_tests:
  - AT-050
  - AT-051
  - AT-071
  - AT-072
  - AT-073
---

## What to build

Complete [ADR-0001](../docs/adr/0001-instance-manager-owns-session-state.md). Move from panel into `attach/instance-manager.js` (+ `instance-session.js`):

- Per-id `teardown` / `runtime` handles
- `commit(config)` — persist + smart rebuild
- `applyLive(config)` — delegate to `runtime.applyLive`
- Debounced rebuild + `tt-panel--syncing` coordination

Panel becomes a view: `readConfigFromForm` → `manager.commit()` / `manager.applyLive()` — no direct `attachConfig.init()` calls.

## Acceptance criteria

- [ ] Panel has zero `teardownFn` / `runtime` module state
- [ ] `switchToInstance` commits via manager before hydrate
- [ ] Multi-instance isolation (AT-071)
- [ ] Closes remaining TT-035 criteria; mark TT-035 `done` when this ships

## Blocked by

- TT-081

## Tests

```bash
cd text-tuner && npm test
```

Manual AT-050, AT-051, AT-071, AT-072, AT-073.
