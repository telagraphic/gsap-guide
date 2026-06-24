---
id: TT-092
title: Demo typography CSS polish
phase: 8
status: done
blocked_by:
  - TT-037
tests: []
acceptance_tests: []
priority: P2
---

## What to build

`examples/sample-playground/styles.css` — `.frame__title` currently hardcodes `font-size: clamp(...)` and `line-height: 1.1`, so Typography sliders have no visible effect on `config-header`. Use `--playground-*` vars like `.frame__copy`.

## Acceptance criteria

- [x] `config-header` responds to Typography tab font size, line-height, letter-spacing live preview (see [CANVAS_TYPOGRAPHY.md](../migration-refactor/CANVAS_TYPOGRAPHY.md))
- [x] Title scale preserved via unitless `--playground-title-scale` multiplier (not `rem × vw` calc)

Follow-up verification across all split types: [TT-093](./TT-093-typography-split-contract.md).

## Blocked by

- TT-037

## Tests

Manual: open panel → Typography → adjust sliders on `config-header` instance.

**Note:** P2 — does not block TT-071.
