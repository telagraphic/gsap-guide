---
id: TT-080
title: Queue reconciliation
phase: 8
status: done
blocked_by: []
tests: []
acceptance_tests: []
---

## What to build

Retroactively align the issue tracker with shipped work. No product code — docs only.

## Acceptance criteria

- [x] [QUEUE.md](./QUEUE.md) order and statuses updated
- [x] Marked **done** for issues whose code already exists:
  - TT-021 (gate file already done; QUEUE fixed)
  - TT-036 registry API
  - TT-040, TT-041, TT-042 CSS layers
  - TT-050, TT-051 font tiers
  - TT-060, TT-061, TT-062 v3 UI features
  - TT-070 package + demo migration
- [x] Updated `blocked_by` on TT-030–TT-035: unblocked from TT-021; TT-033 blocks on TT-082
- [x] Phase 8 — Close-out section added to [README.md](./README.md)

## Verification notes

Shipped via monolith port (June 2025): `discover.js`, `define.js`, `attach.js`, `styles/*`, `fonts/`, panel v3 header UI, `package.json` exports, demo at `examples/sample-playground/`. Panel decomposition (TT-030–034) and smart commit (TT-081) remain open.

## Tests

None (meta issue).
