# Text Tuner — issue queue

Local issue tracker for the v3 migration. Issues are **phase-grouped** with **quality gates** at each phase boundary.

**Sources:** [PLAYGROUND_V3_PRD.md](../PLAYGROUND_V3_PRD.md) · [v3-refactor-plan.md](../migration-refactor/v3-refactor-plan.md) · [ACCEPTANCE_TESTS.md](../ACCEPTANCE_TESTS.md)

---

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `done` | Merged / verified; acceptance criteria checked |
| `open` | Ready to pick up (blockers satisfied) |
| `blocked` | Waiting on another issue |
| `gate` | Phase quality gate — run listed tests before closing phase |

---

## Queue process

1. Open [QUEUE.md](./QUEUE.md) — work **top to bottom** within the current phase.
2. Pick the first issue with status `open`.
3. Read the issue body: **What to build**, **Blocked by**, **Tests**.
4. Implement; check off acceptance criteria in the issue file.
5. Run issue **Tests** (`npm test` and/or manual AT-* from [ACCEPTANCE_TESTS.md](../ACCEPTANCE_TESTS.md)).
6. Set frontmatter `status: done` and update [QUEUE.md](./QUEUE.md).
7. When all issues in a phase are `done` except the gate, complete the **gate** issue (phase acceptance).
8. Do not start the next phase until its gate is `done`.

---

## Issue file format

Each issue is `TT-NNN-slug.md` with YAML frontmatter:

```yaml
---
id: TT-010
title: Extract core schema modules
phase: 1
status: done
blocked_by: []
tests:
  - npm test
acceptance_tests: []
---
```

| Field | Purpose |
|-------|---------|
| `phase` | 0–8 per refactor plan |
| `blocked_by` | Issue ids that must be `done` first |
| `tests` | Automated commands |
| `acceptance_tests` | Manual AT-* ids from ACCEPTANCE_TESTS.md |

---

## Phase map

| Phase | Goal | Gate issue |
|-------|------|------------|
| **0** | Spec & inventory docs | TT-005 |
| **1** | Pure `schema/` modules | TT-012 |
| **2** | Generic runner | TT-021 |
| **3** | Panel + InstanceManager + registry | TT-037 |
| **4** | Layered `tt-` CSS | TT-043 |
| **5** | Font tiers | TT-052 |
| **6** | v3-only features | TT-063 |
| **7** | npm package + demo cutover | TT-071 |
| **8** | Close-out — smart commit, manager lifecycle, decomposition sign-off | TT-091 |
| **9** | Post-close-out — typography × SplitText contract (P1) | TT-093 (done) |

Phase 8 issues (TT-080–TT-092) run after functional parity shipped via monolith port. TT-080 reconciles the queue; TT-081–TT-082 harden behavior; TT-030–TT-034 complete panel decomposition before gates TT-037–TT-071. Phase 9 (TT-093) verifies live typography across split types — see [CANVAS_TYPOGRAPHY.md](../migration-refactor/CANVAS_TYPOGRAPHY.md).

---

## Terminology

Use [CONTEXT.md](../CONTEXT.md): Instance, Registry, SplitScrollConfig, Runner, Copy code, Commit, Live update, InstanceManager.

Respect ADRs in [docs/adr/](../docs/adr/).
