# UI / CSS consistency audit — v3

> Answers: component count, token semantics, CSS layers, naming inconsistencies to fix during migration.

---

## 1. How many components?

**19 BEM blocks** in the panel (plus shell integration classes). Grouped by role:

### Shell & regions (layout layer — not reusable “controls”)

| Block / hook | Role |
|--------------|------|
| `#text-tuner-panel` | Panel root |
| `tt-panel` | Sticky shell; modifiers `--syncing` |
| `tt-panel__header`, `__body`, `__dock`, `__import`, `__instance`, `__header-actions` | Regions |
| `tt-tab-panel` | Tab content; modifiers `--typography`, `--properties`, `--split-text`, `--scroll` |
| `tt-subtab-panel` | Properties inner tabs (stagger / from-to) |
| `tt-footer` | Shortcuts + active instance hint |
| `body.text-tuner-active`, `.text-tuner-canvas` | Page integration |

### Reusable control components (components layer) — **11 blocks**

| # | BEM block | v2 equivalent | CSS file |
|---|-----------|---------------|----------|
| 1 | `tt-segment-bar` + `tt-segment` + `tt-segment__btn` | `.pg-segment-bar` | `components/segment.css` |
| 2 | `tt-segment-row` | `.pg-segment-row` | `components/segment.css` |
| 3 | `tt-track-slider` | `.pg-track-slider` | `components/track-slider.css` |
| 4 | `tt-select-row` | `.pg-select-row` | `components/select-row.css` |
| 5 | `tt-dropdown-field` | `.pg-dropdown-field` | `components/input.css` |
| 6 | `tt-control-bar` | `.pg-control-bar` | `components/control-bar.css` |
| 7 | `tt-field` / `tt-field-block` / `tt-fieldset` | `.pg-field*` | `components/field.css` |
| 8 | `tt-input` / `tt-select` | `.pg-input`, `.pg-select` | `components/input.css` |
| 9 | `tt-checkbox` | `.pg-checkbox` | `components/input.css` |
| 10 | `tt-prop-list` / `tt-prop-row` / `tt-prop-reset` | `.pg-prop-*` | `components/prop-grid.css` |
| 11 | `tt-control-stack` | `.pg-control-stack` | `components/field.css` |

### Domain / tab compositions (tabs layer) — **5 blocks**

| # | BEM block | Tab | CSS file |
|---|-----------|-----|----------|
| 12 | `tt-stagger-block` / `tt-stagger-timing-row` | Properties | `tabs/properties.css` |
| 13 | `tt-props-fieldset` | Properties | `tabs/properties.css` |
| 14 | `tt-scroll-section` / `tt-field--scrub` | ScrollTrigger | `tabs/scroll-trigger.css` |
| 15 | `tt-st-position` (+ `__edges`, `__offsets`, `__units`) | ScrollTrigger | `tabs/scroll-trigger.css` |
| 16 | `tt-import` (+ `__textarea`, `__warnings`, …) | Dock drawer (v3) | `components/import.css` |

### Utilities (base layer) — **2**

| # | Class | Role |
|---|-------|------|
| 17 | `tt-sr-only` | Screen-reader only |
| 18 | `tt-section-title` | In-tab section labels (was `.pg-section-title`) |
| 19 | `tt-label` | Shared label typography utility (new — reduces duplication) |

### JS markup helpers (`panel/components/`)

| Helper module | Builds |
|---------------|--------|
| `track-slider.js` | `tt-track-slider` |
| `segment-group.js` | `tt-segment-bar`, `tt-segment-row` |
| `select-row.js` | `tt-select-row`, `tt-dropdown-field` |
| `scroll-position-field.js` | `tt-st-position` |
| `import-drawer.js` | `tt-import` |

**Count summary:** 11 reusable control blocks + 5 tab-specific blocks + 3 utilities + shell regions.

---

## 2. Are tokens semantic?

**Mixed model — intentional (2-tier in practice: scale + semantic, with rare component tokens):**

### Tier A — Semantic role tokens (what it *means*)

Describe UI purpose. Prefer these for new styles.

| Token | Role |
|-------|------|
| `--tt-bg`, `--tt-bg-elevated`, `--tt-bg-input` | Surface hierarchy |
| `--tt-bg-input-hover`, `--tt-bg-input-active` | Interactive surface states |
| `--tt-text`, `--tt-text-muted`, `--tt-text-subtle` | Text hierarchy |
| `--tt-border` | Dividers |
| `--tt-accent` | Primary action color |
| `--tt-accent-ring` | Focus ring |
| `--tt-font`, `--tt-font-mono` | Panel chrome typefaces |

### Tier B — Functional layout tokens (what it *does*)

Named for behavior, not appearance.

| Token | Role |
|-------|------|
| `--tt-control-height` | Standard 40px interactive row |
| `--tt-control-inset-x` | Horizontal padding inside chrome |
| `--tt-segment-pad` | Outer padding inside `tt-segment-bar--start` only (header chip row; tabs/dock stay full-bleed). Was v2 `--pg-chrome-pad`. |
| `--tt-segment-row-label-width` | Fixed label column width |
| `--tt-prop-reset-col` | Prop grid reset column width |

### Tier C — Abstract scale tokens (systematic, not semantic)

| Token | Role |
|-------|------|
| `--tt-space-1` … `--tt-space-6` | Spacing scale (like t-shirt sizes) |
| `--tt-radius-sm`, `--tt-radius-md` | Corner radius scale |
| `--tt-font-size`, `--tt-font-size-sm` | Type scale |
| `--tt-label-size`, `--tt-label-weight`, `--tt-label-tracking` | Label recipe |

### Tier D — Appearance tokens that blur semantic/functional

| Token | Issue | v3 recommendation |
|-------|-------|-------------------|
| `--tt-accent-fill` | Used for **slider fill** and **selected segment** — describes look, not role | **Keep for v3 parity**; alias later: `--tt-fill-selected` + `--tt-fill-track` if they diverge |
| `--tt-shadow-control`, `--tt-shadow-panel` | Appearance | OK as effect tokens |

### Separate namespaces (not `--tt-*`)

| Namespace | Scope | Semantic? |
|-----------|-------|-----------|
| `--playground-*` | Canvas preview typography on `[data-playground]` | Yes — preview config |
| `--font-{slug}` | Preview font families | Registry from manifest |

**Rule for new tokens:** prefer **Tier A or B** names. Use **Tier C** only for scales. Component-specific tokens only when truly unique (e.g. `--tt-segment-row-label-width`).

### Why semantic surface names (`--tt-bg`, `--tt-bg-elevated`, …)?

Tokens name **role in a visual hierarchy**, not hex values or components. That lets you retheme (e.g. dark panel) by swapping tokens once.

```text
┌─────────────────────────────────────┐  ← --tt-bg-elevated (raised: on top of base)
│  focused input / white surface      │
├─────────────────────────────────────┤  ← --tt-bg-input (recessed: control track)
│  segment bar / slider track         │
├─────────────────────────────────────┤  ← --tt-bg (floor: panel shell)
│  panel shell                        │
└─────────────────────────────────────┘
```

| Token | Designer question it answers |
|-------|------------------------------|
| `--tt-bg` | What is the default panel floor? |
| `--tt-bg-elevated` | What sits *above* the floor (focused fields)? |
| `--tt-bg-input` | What color is the recessed control track? |
| `--tt-bg-input-hover` / `--active` | Interactive feedback on tracks |
| `--tt-text` / `--muted` / `--subtle` | Primary → secondary → tertiary copy |
| `--tt-accent` | Primary action (Copy config) |
| `--tt-accent-fill` | Selection fill (tabs, slider) — **weak name**; consider `--tt-fill-selected` later |
| `--tt-accent-ring` | Focus ring |
| `--tt-border` | Section dividers only |

Figma equivalent: semantic styles like “Surface/Default”, “Surface/Raised”, “Text/Secondary” — not “Gray 100”.

### Two tiers vs three (primitives → semantic → component)

| Approach | Fit for text-tuner |
|----------|-------------------|
| **1 tier** (raw values in CSS) | Too brittle |
| **2 tiers** (scale + semantic + rare component tokens) | **Recommended** — current model |
| **3 tiers** (+ color primitives like `--tt-color-gray-100`) | Overkill unless multi-theme soon |

```text
GOOD (2-tier):
  --tt-space-1: 4px;
  --tt-segment-pad: var(--tt-space-1);
  --tt-bg: #f7f7f7;

SKIP (3-tier) for v3 unless theming expands:
  --tt-color-neutral-100: #f7f7f7;
  --tt-bg: var(--tt-color-neutral-100);
  --tt-panel-background: var(--tt-bg);
```

### `--tt-segment-pad` (renamed from `--tt-chrome-pad`)

v2 `--pg-chrome-pad` is used **only** on `.pg-segment-bar--start` (header action chips), not on full-bleed tab or dock bars.

| Name | Notes |
|------|-------|
| **`--tt-segment-pad`** | **Locked** — matches segment component family |
| `--tt-segment-bar-pad` | Acceptable alternative; more explicit |

Definition: `var(--tt-space-1)` — padding inside `tt-segment-bar--start`; button height uses `calc(var(--tt-control-height) - 2 * var(--tt-segment-pad))`.

---

## 3. CSS layers

Five layers, imported bottom-up in `text-tuner.css`:

```text
┌─────────────────────────────────────────────────────────┐
│ 5. text-tuner.css          npm entry — @import order only │
├─────────────────────────────────────────────────────────┤
│ 4. tabs/                   domain compositions          │
│    properties.css, scroll-trigger.css, (typography.css) │
├─────────────────────────────────────────────────────────┤
│ 3. components/             reusable BEM blocks          │
│    segment, field, input, track-slider, control-bar,    │
│    select-row, prop-grid, import                        │
├─────────────────────────────────────────────────────────┤
│ 2. layout.css              shell + panel regions        │
│    body grid, tt-panel, header/body/dock/import/footer  │
├─────────────────────────────────────────────────────────┤
│ 1. base.css                utilities + global panel rules│
│    sr-only, tt-label, [hidden], focus defaults          │
├─────────────────────────────────────────────────────────┤
│ 0. tokens.css              custom properties only       │
│    + panel-fonts.css       @font-face (separate import) │
└─────────────────────────────────────────────────────────┘
```

| Layer | Contains | Must NOT contain |
|-------|----------|------------------|
| **0 tokens** | `--tt-*` custom properties on `#text-tuner-panel` | Component selectors |
| **1 base** | Utilities, element defaults under panel | Tab-specific layout |
| **2 layout** | Grid, flex regions, dock/import placement | Slider chrome |
| **3 components** | Reusable blocks used across tabs | ScrollTrigger-only grids |
| **4 tabs** | Stagger block, st-position, scroll-section | Generic segment buttons |
| **5 bundle** | `@import` chain only | Rules |

**Also outside package:** `styles/panel-fonts.css` (Geist `@font-face`), consumer `fonts.css` (`--font-*`), demo canvas CSS.

Optional v3.1: wrap layers 1–4 in `@layer tt-tokens, tt-base, tt-layout, tt-components, tt-tabs`.

---

## 4. Naming inconsistencies to fix in migration

### A. Document vs document

| Issue | Location | Fix |
|-------|----------|-----|
| Panel font: “system stack” vs Geist `panel-fonts.css` | INTERFACE_RULES §2 | **Geist shipped**; system stack is fallback in `var(--tt-font, system-ui)` only |
| `--tt-label-size` vs missing `--tt-font-size-xs` | v2 had both; v2 bug `--pg-label-size-sm` undefined | v3: use `--tt-label-size` for section titles; `--tt-font-size-xs` for footer/hints only |
| `tt-footer` vs `tt-panel__footer` | §6 says sibling block `tt-footer` | **Lock `tt-footer`** as top-level block inside panel (matches v2 `.pg-footer`) |
| Dock segment bar modifier | §6 missing `--dock` | **Add `tt-segment-bar--dock`** to catalog (4 segments: Import·Config·Code·CSS) |
| Import block parent | `tt-panel__import` region vs `tt-import` content | **Region:** `tt-panel__import`; **block:** `tt-import` inside it |

### B. v2 classes missing from v3 catalog (must migrate)

| v2 class | v3 name | Notes |
|----------|---------|-------|
| `.pg-segment__btn--muted` | `tt-segment__btn--muted` | Ghost reset style |
| `.pg-segment__btn--done` | `tt-segment__btn--done` | Copy flash state |
| `.pg-segment__btn--icon` | `tt-segment__btn--icon` | Header reset |
| `.pg-input--compact` | `tt-input--compact` | Prop grid text fields |
| `.pg-control-bar--value-only` | `tt-control-bar--value-only` | |
| `.pg-prop-row--text` | `tt-prop-row--text` | Filter prop row |
| `.pg-section-title` | `tt-section-title` | |
| `.pg-field--scrub` | `tt-field--scrub` | ScrollTrigger scrub group |

### C. State hooks — intentional non-BEM

Keep as documented exceptions (INTERFACE_RULES §2):

- `.is-edge-selected`, `.is-offset-active`, `.is-timing-amount` — ScrollTrigger / stagger JS only
- Prefer `aria-pressed` / `aria-selected` for segments

### D. ID naming

| v2 | v3 |
|----|-----|
| `pg-*` element ids | `tt-*` (e.g. `tt-duration`, `tt-st-start-element`) |

One prefix everywhere: **classes, tokens, and ids** use `tt-` (tokens as `--tt-*`).

---

## 5. Consistency rules (locked)

1. **Prefix:** `tt-` for BEM; `--tt-` for panel tokens; `--playground-` / `--font-` for canvas only.
2. **BEM:** `block`, `block__element`, `block--modifier`, `block__element--modifier`.
3. **No bare `.is-active`** for segments — use ARIA attributes.
4. **Scoping:** all package CSS under `#text-tuner-panel` except `layout.css` body grid.
5. **New component** → pick layer 3 vs 4: if used in 2+ tabs → `components/`; else `tabs/`.

---

## 6. Token → component reference

### 6.1 Surface & color tokens

| Token | Primary components / regions |
|-------|------------------------------|
| `--tt-bg` | `tt-panel`, `tt-panel__header`, `tt-panel__body`, `tt-panel__dock`, `tt-footer` |
| `--tt-bg-elevated` | `tt-input`, `tt-select` (focus), `tt-control-bar` (focus) |
| `--tt-bg-input` | `tt-segment-bar`, `tt-track-slider__chrome`, `tt-select-row`, `tt-segment-row`, `tt-control-bar`, `tt-st-position__units`, footer `kbd`, `tt-prop-reset` hover |
| `--tt-bg-input-hover` | `tt-segment__btn` hover (non-selected) |
| `--tt-bg-input-active` | `tt-segment__btn` pressed |
| `--tt-border` | `tt-scroll-section` dividers, `tt-panel__dock` top rule, segment inner dividers |
| `--tt-text` | Panel default text, values, inputs |
| `--tt-text-muted` | `tt-field__label`, `tt-segment-row__label`, inactive segment labels |
| `--tt-text-subtle` | `tt-footer`, `tt-st-position__hint`, `tt-prop-reset` default |
| `--tt-accent` | `tt-segment__btn--accent` (Config copy), `tt-checkbox` |
| `--tt-accent-fill` | Selected `tt-segment__btn`, `tt-track-slider__fill`, ST edge select highlight |
| `--tt-accent-ring` | Focus rings on segments, inputs, sliders, `tt-prop-reset` |

### 6.2 Spacing & layout tokens

| Token | Primary components / regions |
|-------|------------------------------|
| `--tt-space-1` | Tight gaps; basis for `--tt-segment-pad` |
| `--tt-space-2` | `tt-control-stack`, `tt-st-position` gaps, `tt-field--scrub`, prop grid |
| `--tt-space-3` | `tt-checkbox` gap |
| `--tt-space-4` | `tt-field-block` margin, dock padding, default block rhythm |
| `--tt-space-5` | `tt-panel__body` padding, `tt-scroll-section` spacing |
| `--tt-space-6` | `tt-prop-list` block gap |
| `--tt-control-height` | All 40px rows: sliders, segments, select-row, checkbox |
| `--tt-control-inset-x` | Label/value inset in slider, control-bar, select-row |
| `--tt-segment-pad` | `tt-segment-bar--start` only (header chips) |
| `--tt-segment-row-label-width` | `tt-segment-row` (Align, Transform) |
| `--tt-prop-reset-col` | `tt-prop-row` reset column |

### 6.3 Typography tokens

| Token | Primary components / regions |
|-------|------------------------------|
| `--tt-font` | Panel root, most UI |
| `--tt-font-mono` | Prop labels, scrub units, import textarea, monospace values |
| `--tt-font-size` | Panel base, segment buttons |
| `--tt-font-size-sm` | Slider values, prop grid inputs |
| `--tt-font-size-xs` | `tt-footer`, `tt-st-position__hint`, unit buttons |
| `--tt-label-size` / `--tt-label-weight` / `--tt-label-tracking` | Labels, section titles, dock segments |

### 6.4 Radius & shadow

| Token | Primary components |
|-------|-------------------|
| `--tt-radius-sm` | Segment buttons, inputs, `tt-prop-reset`, footer `kbd` |
| `--tt-radius-md` | `tt-segment-bar` outer track, unit toggle group |
| `--tt-shadow-control` | Optional control depth |
| `--tt-shadow-panel` | Panel edge vs canvas |

---

## 7. Component → token reference (reverse map)

| Component | Main tokens |
|-----------|-------------|
| **`tt-panel`** | `--tt-bg`, `--tt-text`, `--tt-font-size`, `--tt-shadow-panel` |
| **`tt-segment-bar` (tabs/dock)** | `--tt-bg-input`, `--tt-accent-fill` (selected), `--tt-radius-md` |
| **`tt-segment-bar--start`** | `--tt-segment-pad`, `--tt-control-height` |
| **`tt-segment-row`** | `--tt-bg-input`, `--tt-segment-row-label-width`, `--tt-control-inset-x` |
| **`tt-track-slider`** | `--tt-bg-input`, `--tt-accent-fill`, `--tt-control-height`, `--tt-control-inset-x` |
| **`tt-select-row`** | `--tt-bg-input`, `--tt-control-height`, `--tt-text-muted` labels |
| **`tt-dropdown-field`** | `--tt-bg-input`, `--tt-bg-elevated` (focus), label tokens |
| **`tt-control-bar`** | `--tt-bg-input`, `--tt-bg-elevated` (focus), `--tt-control-inset-x` |
| **`tt-prop-row`** | `--tt-prop-reset-col`, `--tt-font-mono`, `--tt-font-size-sm` |
| **`tt-scroll-section`** | `--tt-border`, `--tt-space-5` |
| **`tt-st-position`** | `--tt-space-2`, `--tt-accent-fill`, `--tt-bg-input`, `--tt-font-size-xs` |
| **`tt-import`** | `--tt-font-mono`, `--tt-bg-input`, `--tt-border` |
| **`tt-footer`** | `--tt-text-subtle`, `--tt-font-size-xs`, `--tt-bg-input` on `kbd` |

---

## 8. Tab → dominant tokens

| Tab | Token-heavy components |
|-----|------------------------|
| **Typography** | `--tt-track-slider-*`, `--tt-dropdown-field`, `--tt-segment-row` |
| **Properties** | `--tt-prop-*`, `--tt-stagger-block`, `--tt-control-stack`, `--tt-space-6` |
| **SplitText** | `--tt-segment-bar`, `--tt-control-bar`, `--tt-field` |
| **ScrollTrigger** | `--tt-st-position-*`, `--tt-scroll-section`, `--tt-field--scrub` |

---

## 9. Doc sync checklist

- [x] This audit (component count, layers, mappings)
- [x] INTERFACE_RULES §2 panel font
- [x] INTERFACE_RULES §6 component catalog
- [x] `--tt-segment-pad` rename (was `--tt-chrome-pad`)
- [ ] Apply token/component tables to `styles/tokens.css` during Phase 4 migration
