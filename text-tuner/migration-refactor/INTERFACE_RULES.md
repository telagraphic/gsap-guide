# Text Tuner v3 — Interface rules

**Status:** Active standard for the v3 dev tuning panel.  
**Scope:** `#text-tuner-panel` in `text-tuner/styles/`, markup helpers in `text-tuner/src/panel/`.  
**Canvas:** Dark preview lives in consumer/demo CSS (`examples/sample-playground/styles.css`) — light panel, dark stage.  
**Supersedes:** v2 `INTERFACE_RULES` (legacy playground-v2, removed from repo).

**Related:** [COMPONENT_AUDIT.md](./COMPONENT_AUDIT.md) · [v3-refactor-plan.md](./v3-refactor-plan.md) · [UI_MAINTENANCE.md](./UI_MAINTENANCE.md) · [PLAYGROUND_V3_PRD.md](../PLAYGROUND_V3_PRD.md)

---

## 1. Principles

1. **Light instrument, dark preview** — Panel is a neutral gray tool; animation frames stay dark.
2. **One control height** — Every interactive row is **40px** unless documented otherwise.
3. **Token-first spacing** — Use `--tt-space-*` and `--tt-control-inset-x`; avoid magic numbers in new CSS.
4. **Inline labels for dense controls** — Sliders, inline selects, and segment rows share the same row chrome.
5. **Segment bars for related options** — Tabs, toggles, and action groups sit inside one rounded track.
6. **CSS `text-transform` is cosmetic** — Uppercase display does not change stored form values.
7. **BEM everywhere in panel UI** — Block–element–modifier on `.tt-*`; no ad-hoc class names in tab markup.

---

## 2. Naming

### Shell (page integration — not BEM blocks)

| Class / ID | Purpose |
|------------|---------|
| `body.text-tuner-active` | Panel attached; enables layout grid |
| `body.text-tuner-panel-open` | Sidebar column visible |
| `#text-tuner-panel` | Panel root (`role` complementary) |
| `.text-tuner-canvas` | Main content column (consumer markup) |

### Panel UI prefix

All panel components use **`tt-`** (text-tuner). No `pg-` aliases in v3.

| Pattern | Example |
|---------|---------|
| Block | `.tt-panel`, `.tt-segment`, `.tt-track-slider`, `.tt-field` |
| Element | `.tt-panel__header`, `.tt-segment__btn`, `.tt-field__label` |
| Modifier (block) | `.tt-segment-bar--tabs`, `.tt-track-slider--compact` |
| Modifier (element) | `.tt-segment__btn--accent`, `.tt-segment__btn--pending` |
| Panel state (block) | `.tt-panel--syncing` — inputs disabled during rebuild |

### State styling

| Kind | Convention |
|------|------------|
| Segment / toggle selection | `[aria-pressed="true"]`, `[aria-selected="true"]` — not `.is-active` |
| Scroll position UI | `.is-edge-selected`, `.is-offset-active`, `.is-timing-amount` — JS hooks on ST controls only |
| Pending tab | `.tt-segment__btn--pending` on Typography / SplitText tabs |
| Hidden | `[hidden]` attribute on tab panels |

### Preview typography (canvas — not panel tokens)

CSS vars applied to **`[data-playground="id"]`** for live typography and Copy CSS export:

| Var | Purpose |
|-----|---------|
| `--font-sans-serif` | Resolved from config `typography.fontVar` |
| `--playground-font-size` | rem |
| `--playground-line-height` | unitless |
| `--playground-letter-spacing` | em |
| `--playground-text-align` | left / center / right |
| `--playground-text-transform` | none / uppercase / etc. |

Keep `--playground-*` names for Copy CSS round-trip and PRD compatibility. Do **not** set these on `:root` in multi-instance pages.

**SplitText descendants:** Live Type tab preview requires consumer canvas CSS so `.word`, `.line`, `.char` inherit typography from the scoped target. Runtime clears baked inline `font-size` on each apply. Full contract: [CANVAS_TYPOGRAPHY.md](./CANVAS_TYPOGRAPHY.md).

### Panel chrome font

Shipped in npm via `styles/panel-fonts.css` (Geist + Geist Mono). Tokens:

```css
--tt-font: var(--tt-font-geist, "Giest"), system-ui, sans-serif;
--tt-font-mono: var(--tt-font-geist-mono, "Giest Mono"), ui-monospace, monospace;
```

`system-ui` is **fallback only** if panel font files fail to load. Not the preview `fonts/` library.

Demo pages load `examples/preview-fonts/fonts.css` for Typography tab families. Preview font list comes from generated `fonts.manifest.json`, not a hand-maintained JS array.

See [FONT_MANAGEMENT.md](./FONT_MANAGEMENT.md).

---

## 3. Design tokens

All tokens live on `#text-tuner-panel` in `text-tuner/styles/tokens.css`.

### Token tiers

| Tier | Examples | Use for |
|------|----------|---------|
| **Semantic** | `--tt-bg`, `--tt-text-muted`, `--tt-accent` | Surfaces, text roles, brand actions |
| **Functional** | `--tt-control-height`, `--tt-control-inset-x` | Layout behavior |
| **Scale** | `--tt-space-4`, `--tt-radius-sm`, `--tt-font-size-sm` | Systematic steps |
| **Canvas** (not `--tt-`) | `--playground-font-size`, `--font-fh-enso` | Preview target only |

See [COMPONENT_AUDIT.md](./COMPONENT_AUDIT.md) for full token audit and **token → component reference** (§6–8).

### Surfaces & color

| Token | Value | Use |
|-------|-------|-----|
| `--tt-bg` | `#f7f7f7` | Panel shell |
| `--tt-bg-elevated` | `#ffffff` | Focused inputs, elevated surfaces |
| `--tt-bg-input` | `#ececec` | Control track, default buttons |
| `--tt-bg-input-hover` | `#e0e0e0` | Hover |
| `--tt-bg-input-active` | `#d4d4d4` | Active / pressed |
| `--tt-border` | `rgb(0 0 0 / 0.08)` | Section dividers only |
| `--tt-text` | `#0a0a0a` | Primary copy, values |
| `--tt-text-muted` | `#525252` | Labels, inactive segments |
| `--tt-text-subtle` | `#737373` | Footer, hints |
| `--tt-accent` | `#4a7ae0` | Primary action (Copy config) |
| `--tt-accent-fill` | `#d3d3d3` | Slider track fill, **selected segment** |
| `--tt-accent-ring` | `rgb(74 122 224 / 0.35)` | Focus ring |

### Spacing scale

| Token | px | Use |
|-------|-----|-----|
| `--tt-space-1` | 4 | Tight gaps; `--tt-segment-pad` basis |
| `--tt-space-2` | 6 | Label→control (stacked), grid gaps |
| `--tt-space-3` | 8 | Header internal, checkbox gap |
| `--tt-space-4` | 10 | **Default block gap**, horizontal control inset |
| `--tt-space-5` | 12 | Panel padding, stagger groups |
| `--tt-space-6` | 14 | Prop block list gap |

Derived:

| Token | Definition |
|-------|------------|
| `--tt-control-height` | `40px` |
| `--tt-segment-pad` | `var(--tt-space-1)` — outer padding inside `tt-segment-bar--start` only (header chips; tabs/dock full-bleed) |
| `--tt-control-inset-x` | `var(--tt-space-4)` — label/value inset inside chrome |
| `--tt-segment-row-label-width` | `6.25rem` — fixed label column (Align / Transform aligned) |
| `--tt-prop-reset-col` | reset button column in prop grid |

### Typography (panel chrome)

| Token | Value |
|-------|-------|
| `--tt-font-size` | `13px` | Panel base |
| `--tt-font-size-sm` | `12px` | Values in inputs, prop grid |
| `--tt-font-size-xs` | `11px` | Footer, hints, unit toggles |
| `--tt-label-size` | `11px` | Section titles (alias of xs) |
| `--tt-label-weight` | `600` |
| `--tt-label-tracking` | `0.04em` |

Panel root: `line-height: 1.4`, `text-transform: uppercase`, `letter-spacing: 0.03em`, antialiased.

### Radius & shadow

| Token | Value |
|-------|-------|
| `--tt-radius-sm` | `8px` |
| `--tt-radius-md` | `10px` |
| `--tt-shadow-control` | 1px ring + soft drop |
| `--tt-shadow-panel` | Left edge + ambient (panel vs canvas) |

**Depth:** Prefer `--tt-shadow-control` on controls. Use `--tt-border` only for horizontal rules.

---

## 4. CSS file layers

```
text-tuner/styles/
├── tokens.css
├── base.css              # sr-only, [hidden], focus, tt-label utility
├── layout.css            # body.text-tuner-active grid, panel regions
├── components/
│   ├── segment.css       # tt-segment-bar, tt-segment-row, tt-segment__btn
│   ├── field.css         # tt-field, tt-fieldset, tt-field-block
│   ├── input.css         # tt-input, tt-select, tt-checkbox
│   ├── track-slider.css
│   ├── control-bar.css
│   ├── select-row.css
│   ├── prop-grid.css
│   └── import.css
├── tabs/
│   ├── typography.css    # tt-dropdown-field (if not in input.css)
│   ├── properties.css    # tt-stagger-block, tt-props-fieldset
│   └── scroll-trigger.css  # tt-st-position*, tt-scroll-section
└── text-tuner.css        # @import bundle — npm export
```

**Scoping rule:** All component rules are descendants of `#text-tuner-panel` (or use `@layer tt-components` with the same constraint).

**Not in package:** Canvas frames, dark background, demo layout — `examples/sample-playground/styles.css`.

---

## 5. Spacing rhythm

### Rule A — Block spacing

Every standalone field uses **`.tt-field-block`** → `margin-bottom: var(--tt-space-4)`.

```css
.tt-field > .tt-field-block {
  margin-bottom: 0;
}
```

### Rule B — Label placement

| Pattern | Classes | When |
|---------|---------|------|
| Inline label in chrome | `.tt-track-slider`, `.tt-select-row`, `.tt-segment-row` | Duration, Ease, Animate, Align, Transform, prop Start/End |
| Label above control | `.tt-dropdown-field` | Typography **Font**; Stagger From / Ease |
| Segment bar (no side label) | `.tt-segment-bar` | Tabs, header actions, toggles, subtabs |

### Rule C — Control height

- Chrome height: **`var(--tt-control-height)`** (40px).
- Tab/toggle segment bars: full-bleed buttons (`padding: 0` on bar).
- Action row (`.tt-segment-bar--start`): uses `--tt-segment-pad` — separate chips, not full-bleed.
- Selected state: `--tt-accent-fill` only — no nested pill shadow.

### Rule D — Group spacing

| Group | Gap | Outer margin |
|-------|-----|--------------|
| `.tt-control-stack` | `--tt-space-2` | `--tt-space-4` below |
| `.tt-prop-list` | `--tt-space-6` between blocks | — |
| `.tt-prop-block__controls` grid | `--tt-space-2` | — |

---

## 6. Component catalog (BEM blocks)

### `tt-panel`

Regions: `tt-panel__header` → `tt-panel__body` → `tt-panel__dock` → `tt-footer` (footer is sibling block inside panel).

| Element / modifier | Use |
|--------------------|-----|
| `tt-panel__header-actions` | Reset instance, follow viewport toggle (v3) |
| `tt-panel__instance` | Instance dropdown slot (v3; hidden when one id) |
| `tt-panel--syncing` | Rebuild in progress |

### `tt-segment` / `tt-segment-bar`

| Modifier | Use |
|----------|-----|
| `tt-segment-bar--tabs` | Primary tabs (Typography, Properties, SplitText, ScrollTrigger) |
| `tt-segment-bar--subtabs` | Properties stagger / from-to |
| `tt-segment-bar--start` | Header icon actions (non-exclusive) |
| `tt-segment-bar--dock` | Import · Config · Code · CSS |
| `tt-segment__btn--tab` | `role="tab"` |
| `tt-segment__btn--accent` | Primary dock action (Config copy) |
| `tt-segment__btn--muted` | Ghost / secondary |
| `tt-segment__btn--done` | Copy flash feedback |
| `tt-segment__btn--icon` | Icon-only (header reset) |
| `tt-segment__btn--pending` | Queued rebuild (Typography / SplitText) |
| `tt-segment__text` | Mixed-case exception (Aa / AA / aa) |

### `tt-track-slider`

Inline numeric scrubber. Fill via `--tt-accent-fill`. Values: `font-variant-numeric: tabular-nums`.

### `tt-control-bar`

Text input in chrome (target selectors, compact prop values). Modifiers: `--value-only`, `--no-focus-ring`, `--compact` (with `tt-control-bar__label--prop`).

### `tt-control-stack` / `tt-section-title`

- **Control stack:** vertical group with `--tt-space-2` gap.
- **Section title:** in-tab uppercase section labels.

### `tt-checkbox` / `tt-input` / `tt-select`

Primitives in `input.css`. Modifiers: `tt-input--compact`, `tt-select--row`.

### `tt-import`

Import drawer content block (inside `tt-panel__import`). Elements: `__label`, `__textarea`, `__convert`, `__warnings`, `__apply`.

### `tt-select-row` / `tt-dropdown-field`

- **Select row:** Ease, Animate (inline with slider rhythm).
- **Dropdown field:** Font picker, stagger From / Ease.

### `tt-prop-list` / `tt-prop-row`

Properties from/to grid: **start (label inside) · reset · end (value only)**.

| Element | Use |
|---------|-----|
| `tt-prop-row--head` | Start / End column labels |
| `tt-prop-reset` | Per-property reset + header reset icon |

### `tt-stagger-block` / `tt-stagger-timing-row`

Stagger Amount · Each timing; grid / axis fields when in schema UI scope.

### `tt-scroll-section` / `tt-st-position` / `tt-field--scrub`

ScrollTrigger tab: section dividers (`tt-scroll-section`), scrub field group (`tt-field--scrub`), position UI (`tt-st-position` + `__edges`, `__offsets`, `__units`). JS hooks: `.is-edge-selected`, `.is-offset-active` only here.

### `tt-tab-panel`

| Modifier | Tab |
|----------|-----|
| `tt-tab-panel--typography` | Typography |
| `tt-tab-panel--properties` | Properties |
| `tt-tab-panel--split-text` | SplitText |
| `tt-tab-panel--scroll` | ScrollTrigger |

---

## 7. Typography & casing

| Region | Casing |
|--------|--------|
| Panel default | `text-transform: uppercase` |
| Header / segment buttons | Uppercase + `--tt-label-tracking` |
| Inputs, selects, slider values | Uppercase display; stored values unchanged |
| Transform segment | Mixed case (`.tt-segment__text`) |

---

## 8. Interaction

| Behavior | Rule |
|----------|------|
| Press | `transform: scale(0.96)` on buttons / segments |
| Focus | `outline: 2px solid var(--tt-accent-ring)` |
| Transitions | List properties explicitly — never `transition: all` |
| Disabled / syncing | `.tt-panel--syncing` sets `pointer-events: none` on body; opacity on controls |
| Min hit area | **40×40px** via `--tt-control-height` |

---

## 9. Layout

| Item | Value |
|------|-------|
| Panel width (open) | `min(400px, 92vw)` |
| Panel body padding | `--tt-space-5` |
| Header padding | `12px 12px 0` |
| Body grid (open) | `grid-template-columns: 1fr min(400px, 92vw)` |

`.text-tuner-canvas` is consumer-owned; do not apply `--tt-*` tokens to preview frames.

---

## 10. v3 panel layout

### Header (global — all tabs)

```text
┌──────────────────────────────────────────┐
│  Instance [ hero-lines ▼ ]  [↻] [follow] │  row 1 — hide if 1 instance
│  Typography │ Properties │ Split │ ST    │  row 2 — ⌘1–⌘4
├──────────────────────────────────────────┤
│  …scrollable tab body…                   │
├──────────────────────────────────────────┤
│  tt-panel__import (when Import open)     │  paste · Convert · warnings · Apply
├──────────────────────────────────────────┤
│  Import │ Config │ Code │ CSS            │  dock — [ADR-0006](../docs/adr/0006-import-in-dock.md)
├──────────────────────────────────────────┤
│  footer shortcuts · editing: {activeId}  │
└──────────────────────────────────────────┘
```

| UI | Block / placement |
|----|-------------------|
| Instance dropdown | `.tt-panel__instance` — header row 1, above tabs |
| Follow viewport | `.tt-panel__header-actions` |
| Reset instance / Reset all | Header actions |
| Import drawer | `.tt-panel__import` — between body and dock; toggled by dock **Import** |
| Dock | `.tt-panel__dock` — `Import · Config · Code · CSS` |
| Active instance hint | `.tt-footer` when multi-instance |

### Dock behavior

| Segment | Type | Behavior |
|---------|------|----------|
| **Import** | Toggle | `aria-pressed` / drawer open; does not copy |
| **Config** | Copy | Clipboard + flash (accent) |
| **Code** | Copy | Clipboard + flash |
| **CSS** | Copy | Clipboard + flash |

### Import drawer contents

| Element | Class / id pattern |
|---------|-------------------|
| Label | `tt-import__label` — "Paste canonical Copy code" |
| Textarea | `tt-import__textarea` — monospace, min-height ~8rem |
| Convert | `tt-import__convert` button |
| Warnings | `tt-import__warnings` — list after convert |
| Apply | `tt-import__apply` — "Apply to {activeId}"; disabled until convert OK |

Module: `panel/import-drawer.js` + `panel/bindings/dock.js`

**Not** a fifth header tab. No ⌘5 shortcut.

---

## 11. Adding a new control — checklist

- [ ] BEM: block `tt-*`, element `__`, modifier `--`.
- [ ] Uses `--tt-space-*` (no raw px unless new token).
- [ ] Chrome **40px** with `--tt-control-inset-x`.
- [ ] Wrapped in `.tt-field-block` or `.tt-control-stack` with correct margin rules.
- [ ] Correct label pattern (inline / dropdown / segment bar).
- [ ] Markup via shared JS helper in `panel/components/`.
- [ ] Focus / press match existing segment and input patterns.
- [ ] Wired in `panel/dom.js`, `form-state.js`, and one `bindings/*.js` file.
- [ ] Live vs commit behavior matches PRD (Properties/ST live; SplitText commit; Typography live + commit re-split).

---

## 12. File map

| File | Responsibility |
|------|----------------|
| `text-tuner/styles/*.css` | Tokens, components, tabs |
| `text-tuner/src/panel/components/*.js` | HTML builders (track slider, segment, etc.) |
| `text-tuner/src/panel/templates/*.js` | Tab shell markup |
| `examples/.../styles.css` | Canvas, frames, dark stage |
| `text-tuner/fonts/` | Starter preview binaries (npm; copy to project) |
| `text-tuner/examples/fonts-full/` | Full maintainer library |

When tokens or patterns change, update **this file** and `styles/tokens.css` together.

---

## 13. Changelog

| Date | Change |
|------|--------|
| 2026-06 | v3 initial: `tt-` prefix, BEM catalog, scoped `--playground-*`, system UI font, file layers |
