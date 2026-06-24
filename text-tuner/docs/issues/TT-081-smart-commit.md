---
id: TT-081
title: Smart commit (ADR-0002)
phase: 8
status: done
blocked_by:
  - TT-080
tests:
  - npm test
acceptance_tests:
  - AT-030
  - AT-031
  - AT-032
  - AT-033
  - AT-070
---

## What to build

On panel close / explicit commit, merge form → `committedConfig` + persist. **Full rebuild only when** typography, SplitText, or `targets` changed since last commit. Live-only changes (duration, ease, stagger, ScrollTrigger scrub/start/end) skip re-split — runner already reflects them via `applyLive()`.

## Implementation

- `needsRebuild(prev, next)` helper in `schema/config.js` comparing typography, splitText, targets slices
- `commitAndRebuild()` branches: persist-only vs `runFullRebuild()`
- `typographyDirty` / `splitTextDirty` flags as source of truth until commit clears them

## Acceptance criteria

- [ ] Change duration → close panel → no SplitText re-split (animation still correct)
- [ ] Change mask or font size → close panel → full rebuild (AT-032, AT-033)
- [ ] Session persists on commit (AT-070)

## Blocked by

- TT-080

## Tests

```bash
cd text-tuner && npm test
```

Manual AT-030, AT-031, AT-032, AT-033, AT-070.
