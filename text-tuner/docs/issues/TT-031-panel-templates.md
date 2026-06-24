---
id: TT-031
title: Panel templates and shell markup
phase: 3
status: done
blocked_by:
  - TT-030
tests: []
acceptance_tests:
  - AT-020
---

## What to build

Split v2 `injectPanel` into templates: shell (header, body, dock, footer), and one file per tab (Typography, Properties, SplitText, ScrollTrigger). Properties includes stagger sub-tab + from/to grid markup. Instance dropdown slot empty (wired in Phase 6).

## Acceptance criteria

- [ ] `panel/templates/shell.js` — `#text-tuner-panel` structure per INTERFACE_RULES §10
- [ ] Tab template modules render full tab bodies
- [ ] Dock segment order: Import · Config · Code · CSS (Import drawer region present, logic later)
- [ ] `createPanelController` can inject shell + tabs into DOM
- [ ] ⌘K toggle shell opens/closes (minimal wiring)

## Blocked by

- TT-030

## Tests

Manual AT-020 (toggle panel) once wired to attach stub.
