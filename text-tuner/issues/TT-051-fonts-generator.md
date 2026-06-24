---
id: TT-051
title: fonts generate CLI
phase: 5
status: done
blocked_by:
  - TT-050
tests: []
acceptance_tests: []
---

## What to build

Port `generate-fonts.mjs` as `npx text-tuner fonts generate` (or package script). Defaults: cwd `./fonts` → `./fonts.css` + `./fonts.manifest.json`.

## Acceptance criteria

- [ ] CLI scans font binaries and emits css vars + manifest
- [ ] Documented in ADDING_FONTS.md
- [ ] Demo regenerate workflow works
- [ ] v3-refactor-plan checklist §G complete

## Blocked by

- TT-050

## Tests

Add a family to test `fonts/` folder, run generate, confirm dropdown updates.
