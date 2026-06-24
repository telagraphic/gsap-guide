---
id: TT-035
title: InstanceManager and session storage
phase: 3
status: done
blocked_by:
  - TT-020
  - TT-032
tests: []
acceptance_tests: []
---

## What to build

InstanceManager in attach layer: per-id InstanceSession (defaults, committed config, runner handles), `${storageKey}:${id}` sessionStorage, smart commit (rebuild only when typography/SplitText/targets change), `applyLive()`, `applyTypography()`, debounced rebuild, `tt-panel--syncing`.

```text
commit() → persist → rebuild if needed → ScrollTrigger.refresh → scroll top
applyLive() → runtime.applyLive (no persist)
```

## Acceptance criteria

- [ ] `attach/instance-manager.js` + `attach/instance-session.js`
- [ ] Smart rebuild per ADR-0002
- [ ] Live typography scoped to active instance element
- [ ] Panel calls manager methods only — no direct runner access
- [ ] Single-instance path works before multi-instance UI

## Blocked by

- TT-020
- TT-032

## Tests

Manual: change duration (live, no rebuild); change mask (pending → commit rebuild).
