---
id: TT-061
title: Import drawer, canonical, convert
phase: 6
status: done
blocked_by:
  - TT-034
  - TT-052
tests: []
acceptance_tests:
  - AT-041
  - AT-042
---

## What to build

Full Import workflow: dock Import toggles drawer, paste → `convert()` → warnings → Apply to active instance. Shared `canonical/` parse + build (ADR-0003, ADR-0006). Optional CLI `text-tuner-convert` stdout only.

## Acceptance criteria

- [ ] `convert/parse-canonical-block.js` round-trips with Copy code export
- [ ] Import drawer UI: textarea, Convert, warnings list, Apply
- [ ] Apply updates in-memory config for active id (not script.js)
- [ ] `productionEnabled: false` guard on attach (PRD §17)
- [ ] AT-042 round-trip stable within major version

## Blocked by

- TT-034
- TT-052

## Tests

Manual AT-041, AT-042. Paste Copy code → Apply → panel matches.
