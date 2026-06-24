---
id: TT-050
title: Migrate font tiers (panel + starter)
phase: 5
status: done
blocked_by:
  - TT-043
tests: []
acceptance_tests: []
---

## What to build

Implement font tier layout: panel Geist in `styles/fonts/panel/`, starter pack at package root `fonts/` + generated `fonts.css` + `fonts.manifest.json`, full library in `examples/fonts-full/`.

## Acceptance criteria

- [ ] Panel chrome fonts load without consumer `fonts/`
- [ ] Starter pack copied from v2 fonts subset
- [ ] Typography dropdown reads manifest (not hardcoded FONTS array)
- [ ] `attach({ fonts })` override still works
- [ ] ADDING_FONTS.md workflow verified manually

## Blocked by

- TT-043

## Tests

Manual: typography tab lists starter families; panel UI uses Geist.
