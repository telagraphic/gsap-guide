---
id: TT-030
title: Panel UI components (builders)
phase: 3
status: done
blocked_by:
  - TT-082
tests: []
acceptance_tests: []
---

## What to build

Extract reusable panel HTML builders from v2: track slider, segment group, select row, scroll position field. Each module builds markup and binds its own chrome (fill sync, aria-pressed segments). No tab wiring yet.

## Acceptance criteria

- [ ] `panel/components/track-slider.js`
- [ ] `panel/components/segment-group.js`
- [ ] `panel/components/select-row.js`
- [ ] `panel/components/scroll-position-field.js`
- [ ] Builders use `tt-` class names (CSS can land in Phase 4; use class names from INTERFACE_RULES)
- [ ] No module-level panel state

## Blocked by

- TT-082

## Tests

Unit or snapshot: HTML builder output includes expected BEM blocks. Manual smoke in isolation optional.
