---
id: TT-010
title: Extract core schema modules
phase: 1
status: done
blocked_by:
  - TT-005
tests:
  - npm test
acceptance_tests: []
---

## What to build

First schema extraction: pure modules for config merge, stagger normalization, SplitText type helpers, and ScrollTrigger position parse/format. No DOM or GSAP imports. Add `SCHEMA_VERSION`, barrel export, and unit tests.

Prototype decisions (from v2 port):

```javascript
export const SCHEMA_VERSION = "split-scroll-v1";
// parseScrollPosition("top 25%") ↔ formatScrollPosition round-trip
// normalizeStaggerConfig handles legacy { mode: "simple", value }
```

## Acceptance criteria

- [x] `schema/config.js` — deepClone, deepMerge, typeIncludes, normalizeStaggerConfig, stagger grid parse/format
- [x] `schema/scroll-position.js` — parse/format ST start/end strings + constants
- [x] `schema/version.js` — SCHEMA_VERSION
- [x] `schema/index.js` barrel
- [x] `npm test` passes (8 tests)
- [x] Minimal `package.json` with `"type": "module"`

## Blocked by

- TT-005

## Tests

```bash
cd text-tuner && npm test
```
