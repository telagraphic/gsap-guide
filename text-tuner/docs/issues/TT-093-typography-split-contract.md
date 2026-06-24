---
id: TT-093
title: Typography × SplitText canvas contract
phase: 9
status: done
blocked_by: []
tests:
  - npm test
acceptance_tests:
  - AT-033a
  - AT-033b
  - AT-033c
  - AT-033d
priority: P1
---

## What to build

Close the spec gap discovered post–Phase 8: live Type tab settings must work consistently across SplitText **type** (`chars`, `words`, `lines`) and **mask** combinations — not only vars on `[data-playground]`.

Document the two-layer contract (runtime + consumer canvas CSS) and verify with acceptance tests.

**Spec:** [CANVAS_TYPOGRAPHY.md](../migration-refactor/CANVAS_TYPOGRAPHY.md)

## Acceptance criteria

- [x] [CANVAS_TYPOGRAPHY.md](../migration-refactor/CANVAS_TYPOGRAPHY.md) linked from PRD, INTERFACE_RULES, ADR-0002
- [x] AT-033a–d manual pass recorded in [test-runs/2025-06-24-tt093.md](./test-runs/2025-06-24-tt093.md)
- [x] `char-reveal` demo instance (`chars`, mask `none`) for AT-033d
- [x] Mask wrapper typography edge cases documented (live preview caveat; commit fixes geometry)
- [x] Ship `canvas-typography.css` export (`text-tuner/canvas-typography.css`)
- [x] Demo imports package canvas CSS; layout-only rules remain in `sample-playground/styles.css`
- [x] Unit tests: `tests/panel/typography.test.js`

## Shipped

- `styles/canvas-typography.css` + package export
- `applyTypographyToScope` exported from `panel/index.js`
- Runtime clears inline `font-size` on `.word`, `.line`, `.char` after each apply
- Sample playground: 4 instances including `char-reveal`

## Tests

- `npm test` (32/32)
- Manual: AT-033a–d — see [test-runs/2025-06-24-tt093.md](./test-runs/2025-06-24-tt093.md)
