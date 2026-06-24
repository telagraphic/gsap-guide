# UI & markup maintenance — v2 vs v3

> Will the new CSS layers and INTERFACE_RULES streamline UI changes?  
> **Short answer:** Yes for **styling and layout**; **moderately** for **new config fields**; **significantly** for **orientation and consistency**.

---

## What was painful in v2

| Pain | Cause |
|------|--------|
| Hard to find styles | 1078-line `playground-v2.css`, mixed scoping (`#panel` vs global `.pg-*`) |
| Hard to find markup | 220-line `injectPanel()` string in 1910-line JS file |
| Fragile DOM access | `cacheElements()` + scattered `getElementById('pg-st-…')` |
| Every new field = archaeology | Touch injectPanel, cacheElements, readConfigFromForm, fillFormFromConfig, bind*, sometimes export |
| No single checklist | Patterns documented late in INTERFACE_RULES v2 |

---

## What v3 improves

### CSS — yes, clearly simpler

| v3 change | Benefit |
|-----------|---------|
| **Layered files** (`tokens.css`, `components/track-slider.css`, `tabs/scroll-trigger.css`) | Edit one concern; ~100–200 lines per file instead of 1000+ |
| **`--tt-*` tokens** on `#text-tuner-panel` | Change spacing once; checklist forbids magic numbers |
| **BEM `tt-*` blocks** | Class name tells you which file to open |
| **INTERFACE_RULES** | Label pattern (inline vs dropdown vs segment bar) decided before coding |
| **Panel vs canvas split** | Never hunt panel rules in demo page CSS |

**Example — add a new slider style tweak:** open `styles/components/track-slider.css`, use existing tokens. No side effects on scroll-trigger or dock.

### Markup — yes, simpler to navigate

| v3 change | Benefit |
|-----------|---------|
| **`panel/templates/tab-*.js`** | Edit Typography without scrolling past ScrollTrigger HTML |
| **`panel/components/*.js` helpers** | `buildTrackSliderHTML()` reused; markup + class names stay consistent |
| **`panel/dom.js` only** | One file lists all element refs; bindings import `el` |
| **Shell template** | Header / dock / import drawer wired once in `templates/shell.js` |

**Example — add Import drawer:** `templates/shell.js` + `import-drawer.js` + `styles/components/import.css` — not buried in monolith.

### Behavior / new fields — better, not automatic

Adding a **new config field** (e.g. new tween prop) still requires coordinated updates, but the **checklist is fixed**:

| Step | File |
|------|------|
| 1. Schema constant | `schema/anim-props.js` or `SplitScrollConfig` typedef |
| 2. Markup | Tab template or component helper |
| 3. DOM ref | `panel/dom.js` |
| 4. Read / hydrate | `panel/form-state.js` |
| 5. Bind events | `panel/bindings/{tab}.js` |
| 6. Live vs commit | InstanceManager policy (already centralized) |
| 7. Export / canonical | `canonical/build-block.js` if in Copy code |

v3 does **not** remove those steps — it **names the files** and INTERFACE_RULES §11 gives a checklist. Optional future: field registry code-gen (out of v3 scope).

---

## Will it feel simpler day-to-day?

| Task | v2 | v3 |
|------|----|-----|
| Change tab padding | Search 1078-line CSS | `tokens.css` or `layout.css` |
| Add slider to a tab | Copy-paste HTML in injectPanel; hope classes match | `buildTrackSliderHTML()` + bind in tab bindings |
| Fix dock button style | `playground-v2.css` dock section | `layout.css` or `components/segment.css` |
| Rename a class | grep `pg-` across JS + CSS | grep `tt-` in one component file + template |
| Understand panel regions | Read injectPanel | Read `INTERFACE_RULES` §10 layout diagram |
| Add 5th tuning tab | Risky — entangled with keyboard, cache, bindings | New `tab-*.js` + `bindings/*.js` + `tabs/*.css` (still work, but bounded) |

**Tradeoff:** More files on disk. Grep / folder structure replaces scrolling one giant file. Net win after ~1 week of familiarity.

---

## Markup refactoring strategy (implementation order)

1. **Extract component builders first** (sliders, segments, select-row) — copy from v2 with `pg-` → `tt-` rename.
2. **Extract tab templates** — one tab at a time; visual parity before deleting monolith.
3. **Split CSS by component** — move blocks from `playground-v2.css` into layered files; no visual change.
4. **Wire `dom.js`** — generate ref map from templates (ids stay stable during migration: `tt-font-size` vs `pg-font-size`).
5. **Delete monolith** only when acceptance tests pass.

**ID migration:** Prefer one-shot `pg-` → `tt-` on element ids when splitting templates (e.g. `pg-duration` → `tt-duration`). Do not alias both.

---

## CSS refactoring strategy

```
tokens.css          ← move --pg-* values, rename --tt-*
base.css            ← sr-only, focus, tt-label utility
layout.css          ← body grid, tt-panel regions, dock, import drawer
components/*.css    ← one BEM block per file (segment, track-slider, prop-grid, …)
tabs/*.css          ← tab-specific sections (st-position, stagger-block)
text-tuner.css      ← @import bundle
```

**Rule:** If a selector is not under `#text-tuner-panel`, it does not belong in the package styles bundle.

---

## INTERFACE_RULES as the contract

Before any UI PR:

- [ ] Which **label pattern**? (inline slider / dropdown / segment bar)
- [ ] Which **component helper**?
- [ ] Which **CSS file**?
- [ ] **Live** or **commit** update?
- [ ] Updated **dom.js** + **form-state.js**?

This is the main “streamlining” — decisions precede code, not discovered mid-edit.

---

## Related ADRs

- [0004](../docs/adr/0004-tt-css-prefix-and-bem.md) — `tt-` prefix
- [0006](../docs/adr/0006-import-in-dock.md) — dock + import drawer markup
- [INTERFACE_RULES.md](./INTERFACE_RULES.md) — tokens, BEM catalog, checklist
