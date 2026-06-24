---
id: TT-034
title: Dock copy export actions
phase: 3
status: done
blocked_by:
  - TT-032
tests: []
acceptance_tests:
  - AT-040
---

## What to build

Dock one-shot copy actions: Copy config (Tier 1 JSON), Copy code (canonical SplitText block), Copy CSS (typography vars). Use `canonical/` module for Copy code shape (ADR-0003). Import segment toggles drawer only — full import in Phase 6.

## Acceptance criteria

- [ ] `panel/export.js` — serializeConfig, exportCopyCode, exportTypographyCss
- [ ] `canonical/build-canonical-block.js` — shared template for Copy code
- [ ] Dock Config / Code / CSS copy to clipboard with done flash state
- [ ] Copy code matches PRD §10.4 canonical shape
- [ ] Import dock segment toggles drawer region (paste UI stub OK until TT-061)

## Blocked by

- TT-032

## Tests

Manual: paste Copy code into empty GSAP page and run (AT-040 partial). Round-trip test with convert deferred to TT-061.
