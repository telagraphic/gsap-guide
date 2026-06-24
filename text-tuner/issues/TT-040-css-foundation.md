---
id: TT-040
title: CSS tokens, base, layout layers
phase: 4
status: done
blocked_by:
  - TT-037
tests: []
acceptance_tests:
  - AT-020
---

## What to build

Migrate v2 CSS foundation: `tokens.css` (`--tt-*`), `base.css` (sr-only, focus), `layout.css` (body grid, panel regions, header/body/dock/footer). Rename `pg-` → `tt-`, `#playground-v2-panel` → `#text-tuner-panel`. Fix `--pg-label-size-sm` bug.

## Acceptance criteria

- [ ] tokens.css on `#text-tuner-panel` per COMPONENT_AUDIT
- [ ] layout.css — `text-tuner-active`, `text-tuner-canvas`, panel grid
- [ ] `tt-panel--syncing` styles
- [ ] Panel chrome Geist via `panel-fonts.css` import path (binaries in Phase 5)
- [ ] Scoped under `#text-tuner-panel`

## Blocked by

- TT-037

## Tests

Manual AT-020 — panel layout matches v2 dimensions (~400px, sticky).
