---
id: TT-032
title: DOM gateway, form-state, typography
phase: 3
status: done
blocked_by:
  - TT-031
tests:
  - npm test
acceptance_tests: []
---

## What to build

Panel data layer: single DOM gateway (`cacheElements` replacement), `readConfigFromForm` / `fillFormFromConfig`, and typography helpers. Scope live typography CSS vars to active `[data-playground="id"]` — not `:root` (ADR-0002).

## Acceptance criteria

- [ ] `panel/dom.js` — all element refs; no `getElementById` outside this file
- [ ] `panel/form-state.js` — read/hydrate SplitScrollConfig including scroll position UI and scrub tri-state
- [ ] `panel/typography.js` — applyTypography, exportTypographyCss, waitForFonts
- [ ] Round-trip: fillForm → readConfig preserves config (test with mock DOM or jsdom optional)
- [ ] `createPanelController` closure holds panel state (no module `let` soup)

## Blocked by

- TT-031

## Tests

```bash
cd text-tuner && npm test
```

Add form-state unit tests where practical.
