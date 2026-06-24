---
id: TT-041
title: CSS components layer
phase: 4
status: done
blocked_by:
  - TT-040
tests: []
acceptance_tests: []
---

## What to build

Port reusable component styles: segment, field, input, track-slider, control-bar, select-row, prop-grid. Follow INTERFACE_RULES 40px control height and `--tt-segment-pad` on header chips only.

## Acceptance criteria

- [ ] All files under `styles/components/` per refactor plan
- [ ] BEM blocks match COMPONENT_AUDIT catalog
- [ ] No `--pg-*` tokens remain
- [ ] Import drawer shell styles in `import.css` (content minimal until TT-061)

## Blocked by

- TT-040

## Tests

Visual compare v2 panel vs v3 side-by-side on sample playground.
