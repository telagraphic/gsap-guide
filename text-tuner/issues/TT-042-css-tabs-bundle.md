---
id: TT-042
title: CSS tabs layer and npm bundle
phase: 4
status: done
blocked_by:
  - TT-041
tests: []
acceptance_tests: []
---

## What to build

Tab-specific CSS (properties stagger/prop-grid, scroll-trigger st-position), `text-tuner.css` import bundle, npm `styles.css` export path.

## Acceptance criteria

- [ ] `tabs/properties.css`, `tabs/scroll-trigger.css`
- [ ] `text-tuner.css` correct @import order (layers 0–4)
- [ ] Consumer can `import 'text-tuner/styles.css'`
- [ ] Demo page CSS stays separate (dark canvas, `--playground-*`)

## Blocked by

- TT-041

## Tests

Full panel visual parity with v2 on all four tabs.
