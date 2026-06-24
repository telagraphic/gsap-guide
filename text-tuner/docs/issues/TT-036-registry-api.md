---
id: TT-036
title: discover, define, attach (v2 shim)
phase: 3
status: done
blocked_by: []
tests: []
acceptance_tests:
  - AT-001
  - AT-002
  - AT-003
  - AT-005
  - AT-006
---

## What to build

Public API: `discover()`, `define()`, `attach()` wiring registry → InstanceManager → panel. Port from sample-playground §4. v2 compat: `attach({ init, defaults, storageKey })` → single-entry registry (ADR-0008). Export `isActive()`, `SCHEMA_VERSION` from index.

## Acceptance criteria

- [x] `discover.js` — scan DOM, buildRegistry, validateDom warnings
- [x] `define.js` — Tier 1 merge
- [x] `attach.js` — wire panel + initAll for scroll preview
- [x] v2 shim path works without registry object
- [x] `src/index.js` public exports (ESM only, ADR-0007)
- [x] Published `.d.ts` stubs or JSDoc types (ADR-0009) — minimal for this issue

## Blocked by

- TT-035

## Tests

Manual AT-001, AT-002, AT-003, AT-005, AT-006.
