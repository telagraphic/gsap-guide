---
id: TT-033
title: Tab bindings and keyboard
phase: 3
status: done
blocked_by:
  - TT-032
  - TT-082
tests: []
acceptance_tests:
  - AT-030
  - AT-031
  - AT-032
  - AT-033
  - AT-034
---

## What to build

Wire all panel listeners: Properties + ScrollTrigger call InstanceManager `applyLive()`; Typography calls `applyTypography()` + dirty flag; SplitText marks pending; keyboard ⌘1–4, Esc; sub-tab switching; prop reset buttons; `tt-panel--syncing` during rebuild.

Panel delegates to InstanceManager — never calls runner directly (ADR-0001).

## Acceptance criteria

- [ ] `panel/bindings/*` per tab + shell + dock (copy actions stubbed until TT-034)
- [ ] `panel/keyboard.js` — ⌘K, ⌘1–4, Esc behavior per PRD §10.1
- [ ] Live tabs update animation without re-split (AT-030, AT-031)
- [ ] SplitText / typography show pending indicator (AT-032, AT-033)
- [ ] Scrub tri-state works (AT-034)

## Blocked by

- TT-032
- TT-082

## Tests

Manual AT-030, AT-031, AT-032, AT-033, AT-034 with single instance.

**Note:** Implement alongside TT-035 or immediately after — bindings need `manager.applyLive()` / `manager.commit()`.
