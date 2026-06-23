# Text Tuner v3 — Acceptance tests

Manual test scenarios mapped to [PLAYGROUND_V3_PRD.md](./PLAYGROUND_V3_PRD.md).  
Use for QA before release and regression after changes.

**Format:** GIVEN / WHEN / THEN  
**Priority:** P0 = ship blocker, P1 = should have, P2 = nice to have

**Test page:** `split-text/playground-v2/examples/sample-playground/` until `text-tuner/examples/` exists.

---

## 1. Boot & API

### AT-001 — Discover cold-start instance (P0)

**GIVEN** a page with `<p data-playground="cold-start-lines">` and no `define()` entry for that id  
**WHEN** `discover()` and `attach({ activeId: "cold-start-lines" })` run  
**THEN** the instance appears in the registry  
**AND** the runner creates SplitText on that element  
**AND** opening the panel shows scaffold defaults (lines mask, yPercent 100→0, scrub on)

### AT-002 — Define overrides scaffold (P0)

**GIVEN** `define({ "config-header": { animate: "words", … } })` and matching DOM node  
**WHEN** `discover()` builds registry  
**THEN** `config-header` defaults match `define()` not global scaffold  
**AND** `cold-start-lines` (undefined) still uses scaffold

### AT-003 — DOM ↔ registry validation (P1)

**GIVEN** `define({ "orphan-id": { … } })` with no `[data-playground="orphan-id"]` in DOM  
**WHEN** `discover()` runs  
**THEN** console warns about missing DOM node  

**GIVEN** `<p data-playground="no-config">` with no define entry  
**WHEN** `discover()` runs  
**THEN** scaffold config is created (not an error)  
**AND** no orphan warning for that id

### AT-004 — Duplicate data-playground id (P1)

**GIVEN** two elements with `data-playground="duplicate"`  
**WHEN** `discover()` runs  
**THEN** console warns about duplicate id  
**AND** first match is used

### AT-005 — v2 compat attach (P1)

**GIVEN** `attach({ init: fn, defaults: obj, storageKey: "legacy" })` without registry  
**WHEN** panel opens  
**THEN** single instance tunes identically to v2 tuner behavior

### AT-006 — isActive guard (P1)

**GIVEN** panel is attached  
**WHEN** `isActive()` is called  
**THEN** returns `true`  

**GIVEN** panel not loaded  
**WHEN** `isActive()` is called  
**THEN** returns `false`

---

## 2. Strategy A — execution ownership

### AT-010 — Runner owns playground target (P0)

**GIVEN** Strategy A dev page with `[data-playground="imported-paragraph"]`  
**AND** no imperative SplitText for that selector in script  
**WHEN** page loads with attach  
**THEN** exactly one SplitText split exists on that element  
**AND** panel live edits update the animation

### AT-011 — Overlap warning (P1)

**GIVEN** a `[data-playground]` element already has SplitText wrapper classes before runner init  
**WHEN** `discover()` / attach runs  
**THEN** console warns about overlap / competing code

### AT-012 — Coexistence on different elements (P1)

**GIVEN** spaghetti runs on `.site-footer__copy` (no data-playground)  
**AND** runner tunes `[data-playground="config-header"]`  
**WHEN** user scrolls the page  
**THEN** both animations run independently without error

### AT-013 — Competing code fails predictably (P0 doc)

**GIVEN** imperative `SplitText.create` on same node as `[data-playground]` AND runner attach  
**WHEN** user edits panel  
**THEN** overlap warning appears (AT-011)  
**AND** documentation states panel is unsupported until spaghetti removed

---

## 3. Control panel — layout & navigation

### AT-020 — Toggle panel (P0)

**GIVEN** playground attached  
**WHEN** user presses ⌘K / Ctrl+K  
**THEN** panel opens and canvas column shrinks  

**WHEN** user presses ⌘K again  
**THEN** panel closes and commit runs

### AT-021 — Tab shortcuts (P1)

**GIVEN** panel open  
**WHEN** user presses ⌘1 through ⌘4  
**THEN** corresponding tab is selected

### AT-022 — Esc blur then close (P1)

**GIVEN** focus in a panel text input  
**WHEN** user presses Esc  
**THEN** input blurs and panel stays open  

**WHEN** user presses Esc again  
**THEN** panel closes and commit runs

### AT-023 — Instance dropdown (P0)

**GIVEN** registry with 3 instances  
**WHEN** panel opens  
**THEN** dropdown lists all ids (or labels)  

**WHEN** user selects another instance  
**THEN** form hydrates that instance config  
**AND** previous instance is committed to sessionStorage

### AT-024 — Hide dropdown for single instance (P2)

**GIVEN** registry with 1 instance  
**WHEN** panel opens  
**THEN** dropdown is hidden or shows single static label

---

## 4. Live vs rebuild tiers

### AT-030 — Live ScrollTrigger start (P0)

**GIVEN** panel open on active instance  
**WHEN** user changes ScrollTrigger start  
**THEN** animation updates without full page rebuild  
**AND** DOM split structure unchanged

### AT-031 — Live tween yPercent (P0)

**GIVEN** panel open  
**WHEN** user changes from/to yPercent  
**THEN** tween updates live

### AT-032 — Rebuild on SplitText type change (P0)

**GIVEN** panel open, type includes lines  
**WHEN** user toggles off lines (invalid) or changes type  
**THEN** SplitText tab shows pending indicator  

**WHEN** user closes panel  
**THEN** full rebuild runs and scroll resets to top

### AT-033 — Rebuild on typography change (P0)

**GIVEN** panel open  
**WHEN** user changes font size significantly  
**THEN** Typography tab shows pending  

**WHEN** user closes panel  
**THEN** rebuild runs (line breaks may change)

### AT-034 — Scrub tri-state (P1)

**GIVEN** panel open  
**WHEN** user sets scrub Off / On / Smooth (numeric)  
**THEN** live preview matches: no scrub, scrub true, scrub number

---

## 5. Workflows

### AT-040 — Workflow 1 cold start end-to-end (P0)

**GIVEN** new element with only `data-playground="new-block"`  
**WHEN** user discovers, tunes duration and start, copies code, removes playground from HTML  
**THEN** pasted Copy code runs standalone with GSAP only  
**AND** animation matches tuned preview

### AT-041 — Workflow 2 import apply (P0)

**GIVEN** canonical spaghetti block in Import tab  
**AND** active instance `imported-paragraph`  
**WHEN** user Convert → Apply  
**THEN** warnings shown (if any)  
**AND** panel fields match imported values  
**AND** runner rebuilds with imported config  
**AND** `targets.text` is `[data-playground="imported-paragraph"]`

### AT-042 — Workflow 2 no stale spaghetti on dev page (P0)

**GIVEN** Workflow 2 on dev page  
**WHEN** Import Apply completed  
**THEN** original spaghetti block is not executed on that page (Strategy A)

### AT-043 — Workflow 3 define tune export (P0)

**GIVEN** `define({ "config-header": config })`  
**WHEN** user tunes stagger and copies code  
**THEN** Copy code reflects tuned stagger  
**AND** Copy config matches define-shaped object

### AT-044 — Multi-element ship sequence (P1)

**GIVEN** two instances on page  
**WHEN** user ships first (Copy code, remove attribute)  
**AND** tunes second  
**THEN** first instance no longer in dropdown / registry  
**AND** second still tunable

---

## 6. Export

### AT-050 — Copy code format (P0)

**GIVEN** tuned active instance  
**WHEN** user clicks Copy code  
**THEN** clipboard contains `SplitText.create(…)` with `onSplit`, `gsap.set`, `gsap.to`, `scrollTrigger`  
**AND** no panel or runner references

### AT-051 — Copy config format (P1)

**GIVEN** tuned active instance  
**WHEN** user clicks Copy config  
**THEN** clipboard contains valid JSON/JS object matching SplitScrollConfig

### AT-052 — Copy CSS (P1)

**GIVEN** typography tab values set  
**WHEN** user clicks Copy CSS  
**THEN** clipboard contains `:root` block with `--playground-*` vars

### AT-053 — Export scoped to active instance (P0)

**GIVEN** two instances with different stagger values  
**WHEN** active is `config-header` and user Copy code  
**THEN** exported block matches header config only

### AT-054 — Copy code round-trip (P0)

**GIVEN** Copy code from instance A  
**WHEN** pasted into Import tab → Convert → Apply on instance A  
**THEN** panel values match within floating-point tolerance  
**AND** warnings count is 0 for canonical block

---

## 7. Import converter

### AT-060 — Canonical paste converts (P0)

**GIVEN** Copy code output as Import input  
**WHEN** Convert runs  
**THEN** `config` object produced with splitText, from, to, stagger, scrollTrigger

### AT-061 — Non-canonical paste warns (P1)

**GIVEN** spaghetti with variables or timeline  
**WHEN** Convert runs  
**THEN** warnings list unmapped sections  
**AND** partial config may still apply on user confirm

### AT-062 — CLI convert stdout (P2)

**GIVEN** canonical snippet file  
**WHEN** `text-tuner-convert snippet.js --id x --format define` runs  
**THEN** define-shaped snippet printed to stdout  
**AND** no files written

---

## 8. Persistence & reset

### AT-070 — Session persist on commit (P0)

**GIVEN** user changes duration and closes panel  
**WHEN** page reloads  
**THEN** duration restored from sessionStorage for that id

### AT-071 — Per-id session isolation (P0)

**GIVEN** instance A duration 2s, instance B duration 0.5s, both committed  
**WHEN** user switches dropdown A ↔ B  
**THEN** each shows its own duration

### AT-072 — Reset instance (P0)

**GIVEN** session overrides on active instance  
**WHEN** user Reset instance  
**THEN** config returns to define/discover defaults  
**AND** session key cleared  
**AND** rebuild runs

### AT-073 — Reset all (P1)

**GIVEN** multiple instances with session overrides  
**WHEN** user Reset all  
**THEN** all instances return to defaults  
**AND** all session keys cleared

---

## 9. Multi-instance scroll

### AT-080 — All instances init (P0)

**GIVEN** registry with 3 ids  
**WHEN** attach completes  
**THEN** scrolling triggers all three animations (when in view)

### AT-081 — Follow viewport (P1)

**GIVEN** Follow viewport toggle on and panel open  
**WHEN** user scrolls until `config-header` section is ≥50% visible  
**THEN** dropdown switches to `config-header`  

**GIVEN** panel closed  
**WHEN** user scrolls  
**THEN** dropdown does not change

### AT-082 — Manual override pins selection (P2)

**GIVEN** Follow viewport on  
**WHEN** user manually selects instance A  
**THEN** selection stays A until another instance crosses threshold or toggle reset

---

## 10. Production boundary

### AT-090 — No panel in production build (P0)

**GIVEN** consumer sets `IS_DEV = false` or omits attach  
**WHEN** page loads with Copy code only  
**THEN** no panel DOM, no body grid classes, no sessionStorage writes from tuner

### AT-091 — npm productionEnabled false (P1)

**GIVEN** `attach({ productionEnabled: false })` in production NODE_ENV  
**WHEN** attach called  
**THEN** panel does not mount or no-ops with warning

---

## 11. Regression — v2 parity

### AT-100 — Single-instance tuner parity (P1)

**GIVEN** v2-style `attach({ init, defaults })` on 3-frame tuner markup  
**WHEN** user tunes ST start live and SplitText mask on commit  
**THEN** behavior matches `split-text/playground-v2/tuner/` reference

---

## 12. Test matrix summary

| Area | P0 count | Key IDs |
|------|----------|---------|
| Boot & API | 2 | AT-001, AT-002 |
| Ownership | 2 | AT-010, AT-013 |
| Panel | 2 | AT-020, AT-023 |
| Live/rebuild | 3 | AT-030, AT-032, AT-033 |
| Workflows | 4 | AT-040–AT-043 |
| Export | 3 | AT-050, AT-053, AT-054 |
| Import | 1 | AT-060 |
| Persistence | 3 | AT-070, AT-071, AT-072 |
| Multi-instance | 1 | AT-080 |
| Production | 1 | AT-090 |

---

## 13. Running tests (manual)

1. Serve: `split-text/serve.sh`
2. Open sample playground or text-tuner example when available
3. DevTools console open for warnings (AT-003, AT-011)
4. Record pass/fail per release in checklist below

### Release checklist

| ID | Pass | Notes |
|----|------|-------|
| AT-001 | ☐ | |
| AT-010 | ☐ | |
| AT-020 | ☐ | |
| AT-023 | ☐ | |
| AT-030 | ☐ | |
| AT-040 | ☐ | |
| AT-041 | ☐ | |
| AT-050 | ☐ | |
| AT-054 | ☐ | |
| AT-070 | ☐ | |
| AT-080 | ☐ | |
| AT-090 | ☐ | |

---

## 14. Future automation mapping

| Scenario | Suggested automation |
|----------|---------------------|
| AT-054 round-trip | Unit test on `convert()` + export |
| AT-001 discover | DOM fixture + jsdom |
| AT-050 copy format | Snapshot test on export string |
| AT-030 live ST | Playwright + scroll + slider interaction |
| AT-090 prod boundary | Build fixture without attach import |
