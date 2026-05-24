# Playground v2 — Interface rules

**Status:** Active standard for the dev tuning panel.  
**Scope:** `#playground-v2-panel` in `playground-v2/playground-v2.css`, markup helpers in `playground-v2/playground-v2.js`.  
**Canvas:** Dark preview (`tuner/tuner.css`) is intentionally separate — light panel, dark stage.

**Related:** Historical audit and rationale → [INTERFACE_AUDIT.md](./INTERFACE_AUDIT.md)

---

## 1. Principles

1. **Light instrument, dark preview** — Panel is a neutral gray tool; animation frames stay dark.
2. **One control height** — Every interactive row is **40px** unless documented otherwise.
3. **Token-first spacing** — Use `--pg-space-*` and `--pg-control-inset-x`; avoid magic numbers in new CSS.
4. **Inline labels for dense controls** — Sliders, inline selects, and segment rows share the same row chrome.
5. **Segment bars for related options** — Tabs, toggles, and action groups sit inside one rounded track.
6. **CSS `text-transform` is cosmetic** — Uppercase display does not change stored form values.

---

## 2. Design tokens

All tokens live on `#playground-v2-panel` in `playground-v2.css`.

### Surfaces & color

| Token | Value | Use |
|-------|-------|-----|
| `--pg-bg` | `#f7f7f7` | Panel shell |
| `--pg-bg-elevated` | `#ffffff` | Focused inputs, elevated surfaces |
| `--pg-bg-input` | `#ececec` | Control track, default buttons |
| `--pg-bg-input-hover` | `#e0e0e0` | Hover |
| `--pg-bg-input-active` | `#d4d4d4` | Active / pressed |
| `--pg-border` | `rgb(0 0 0 / 0.08)` | Section dividers only |
| `--pg-text` | `#0a0a0a` | Primary copy, values |
| `--pg-text-muted` | `#525252` | Labels, inactive segments |
| `--pg-text-subtle` | `#737373` | Footer, hints |
| `--pg-accent` | `#4a7ae0` | Primary action (Copy config) |
| `--pg-accent-fill` | `#d3d3d3` | Slider track fill, **selected segment** |
| `--pg-accent-ring` | `rgb(74 122 224 / 0.35)` | Focus ring |

### Spacing scale

| Token | px | Use |
|-------|-----|-----|
| `--pg-space-1` | 4 | Segment inner pad, tight gaps |
| `--pg-space-2` | 6 | Label→control (stacked), grid gaps, stack gaps |
| `--pg-space-3` | 8 | Header internal, checkbox gap |
| `--pg-space-4` | 10 | **Default block gap**, horizontal control inset |
| `--pg-space-5` | 12 | Panel padding, stagger groups |
| `--pg-space-6` | 14 | Prop block list gap |

Derived:

| Token | Definition |
|-------|------------|
| `--pg-control-height` | `40px` |
| `--pg-chrome-pad` | `var(--pg-space-1)` — segment bar outer padding |
| `--pg-control-inset-x` | `var(--pg-space-4)` — label/value inset inside chrome |
| `--pg-segment-row-label-width` | `6.25rem` — fixed label column (Align / Transform dividers stay aligned) |

### Typography

| Token | Value |
|-------|-------|
| `--pg-font` | `var(--font-giest, "Giest"), system-ui, sans-serif` |
| `--pg-font-size` | `13px` (panel base) |
| `--pg-font-size-sm` | `12px` (values in inputs) |
| `--pg-label-size` | `11px` (`--pg-font-size-xs`) |
| `--pg-label-weight` | `600` |
| `--pg-label-tracking` | `0.04em` |

Panel root: `line-height: 1.4`, `text-transform: uppercase`, `letter-spacing: 0.03em`, antialiased.

### Radius & shadow

| Token | Value |
|-------|-------|
| `--pg-radius-sm` | `8px` |
| `--pg-radius-md` | `10px` |
| `--pg-shadow-control` | 1px ring + soft drop |
| `--pg-shadow-panel` | Left edge + ambient (panel vs canvas) |

**Depth:** Prefer `--pg-shadow-control` on controls. Use `--pg-border` only for horizontal rules (header/footer, fieldset legend).

---

## 3. Spacing rhythm

### Rule A — Block spacing

Every standalone field uses **`.pg-field-block`** → `margin-bottom: var(--pg-space-4)`.

When a block is wrapped in **`.pg-field`** (label + control), the inner block has no bottom margin:

```css
.pg-field > .pg-field-block {
  margin-bottom: 0;
}
```

### Rule B — Label placement

| Pattern | Class / helper | When |
|---------|----------------|------|
| **Inline label in chrome** | `.pg-track-slider`, `.pg-select-row`, `.pg-segment-row` | Duration, Ease, Animate, Align, Transform, prop Start/End |
| **Label above control** | `.pg-dropdown-field` + `buildDropdownFieldHTML()` | Typography **Font** only (long option lists) |
| **Segment bar (no side label)** | `.pg-segment-bar` + `buildSegmentBarHTML()` | Tabs, header actions, toggles, subtabs |

### Rule C — Control height

- Chrome height: **`var(--pg-control-height)`** (40px).
- **Segment bars (tabs, toggles):** `padding: 0`, `overflow: hidden` — buttons are **full-bleed** (100% height, no inner track padding).
- **Action row** (`.pg-segment-bar--start`): keeps `--pg-chrome-pad` — separate chips, not one exclusive segment.
- **Selected state:** `--pg-accent-fill` fill only — **no** nested pill shadow.

Do not introduce 36px compact sliders; prop grid uses the same 40px chrome.

### Rule D — Group spacing

| Group | Gap | Outer margin |
|-------|-----|----------------|
| `.pg-control-stack` | `--pg-space-2` between children | `--pg-space-4` below stack |
| `.pg-prop-list` | `--pg-space-6` between blocks | — |
| `.pg-prop-block__header` → controls | `--pg-space-2` | — |
| `.pg-prop-block__controls` grid | `--pg-space-2` | — |

### Rule E — Horizontal insets

- Labels and values inside chrome: **`left` / `right: var(--pg-control-inset-x)`** (10px).
- Segment row label column: **`min-width: 4.5rem`**, row padding-left `--pg-control-inset-x`.

---

## 4. Control patterns

### Track slider (inline label)

- **Helper:** `buildTrackSliderHTML({ id, label, min, max, step, value, … })`
- **Classes:** `.pg-track-slider.pg-field-block`
- Fill: `--pg-accent-fill` (`#d3d3d3`)
- Values: `font-variant-numeric: tabular-nums`

### Select row (inline label)

- **Helper:** `buildSelectRowHTML({ id, label, optionsHtml })`
- **Classes:** `.pg-select-row.pg-field-block`, `.pg-select.pg-select--row`
- Use for Properties **Ease**, **Animate** (matches slider rhythm).

### Dropdown (stacked label)

- **Helper:** `buildDropdownFieldHTML()`
- **Classes:** `.pg-dropdown-field.pg-field-block`
- Reserved for Typography font picker and Stagger **From / Ease** dropdowns.
- **Stagger tab:** single `.pg-stagger-block` — Amount · Each timing row, From, Ease (no Simple/Advanced toggle).
- **Advanced timing row:** `.pg-stagger-timing-row` — Amount · Each sliders (2 columns); last touched slider sets `stagger.timing`.

### Segment row (label + icon/text buttons)

- **Helper:** `buildSegmentRowHTML()` — Align, Transform
- **Classes:** `.pg-segment-row.pg-field-block`
- **Label column:** fixed `width` via `--pg-segment-row-label-width` (longest label is Transform — do not use `min-width` alone or the column grows per row)
- **Exception:** `.pg-segment__text` keeps `text-transform: none` for Aa / AA / aa / Ab.

### Segment bar (full-width button group)

- **Helper:** `buildSegmentBarHTML({ className, role, buttonsHtml })`
- **Classes:** `.pg-segment-bar.pg-field-block`
- **Visual:** Track = `--pg-bg-input`; selected segment = full cell `--pg-accent-fill`; dividers = `border-left: var(--pg-border)`.
- Modifiers:
  - `.pg-segment-bar--start` — left-aligned **separate** chips — not full-bleed
  - `.pg-segment-bar--dock` — full-bleed **Config · Code · CSS** export segment (pinned dock)
- **Panel header:** `.pg-panel__header-actions` — global **reset** icon (`.pg-prop-reset`, same SVG as prop resets)
- **Panel dock:** `.pg-panel__dock` — pinned above `.pg-footer`; export segment visible on every tab
  - `.pg-segment-bar--tabs` / `--subtabs` — tab lists (full-bleed selection)
  - `.pg-segment__btn--accent` — primary action
  - `.pg-segment__btn--muted` — ghost-style Reset
  - `.pg-segment__btn--tab` — `role="tab"`, `aria-selected`
  - `.pg-segment__btn--pending` — dirty-tab dot (Typography / SplitText)

### Prop block (Properties tab)

- **Duration / Ease / Animate** sit above `.pg-props-fieldset` (top border + `--pg-space-5` pad/margin).
- **Properties · Stagger** subtabs + panels live inside the fieldset; legend is `.pg-sr-only`.
- **Prop grid:** `.pg-prop-row--head` (Start / End column labels) + rows: **start (prop label inside) · reset · end (value only)**.
- **Prop row:** property name as inline label on the start control; end column is value-only
- Reset: `resetAnimProp(key)` → defaults from `ANIM_PROPS`, then live update

---

## 5. Typography & casing

| Region | Casing |
|--------|--------|
| Panel default | `text-transform: uppercase` |
| Header segment buttons | Explicit uppercase + `--pg-label-tracking` |
| Inputs, selects, slider values | Uppercase **display**; `.value` unchanged in JS |
| Transform segment labels | **Mixed case** (`.pg-segment__text` exception) |

**Font:** Load `fonts.css` so `--font-giest` resolves. Panel sets `--pg-font: var(--font-giest, "Giest")`.

---

## 6. Interaction

| Behavior | Rule |
|----------|------|
| Press | `transform: scale(0.96)` on buttons / segments |
| Focus | `outline: 2px solid var(--pg-accent-ring); outline-offset: 1px–2px` |
| Transitions | List properties explicitly — never `transition: all` |
| Disabled | `opacity: 0.5`, `cursor: not-allowed` |
| Min hit area | Target **40×40px** via `--pg-control-height` on primary controls |

---

## 7. Layout

| Item | Value |
|------|-------|
| Panel width (open) | `min(400px, 92vw)` |
| Panel body padding | `--pg-space-5` (12px) |
| Header padding | `12px 12px 0` |

Canvas (`playground-v2-canvas`) is unchanged; do not apply panel tokens to preview frames.

### ScrollTrigger tab sections

Blocks with **`.pg-scroll-section`** (Trigger, Start, End, Scrub, Debug) are separated by:

- `border-top: var(--pg-border)`
- `padding-top: var(--pg-space-5)` (12px)

First section has no top rule. Use `.pg-tab-panel--scroll` wrapper.

---

## 8. Adding a new control — checklist

- [ ] Uses `--pg-space-*` for margin/gap/padding (no raw `10px` unless adding a new token).
- [ ] Control chrome is **40px** tall with **`--pg-control-inset-x`** for text.
- [ ] Wrapped in **`.pg-field-block`** OR inside **`.pg-control-stack`** / **`.pg-field`** with margins zeroed on children.
- [ ] Correct label pattern (inline row vs stacked dropdown vs segment bar).
- [ ] Focus and press states match existing `.pg-segment__btn` / `.pg-select` patterns.
- [ ] Markup built via shared JS helper when possible (keeps class names consistent).
- [ ] If uppercase display matters for UX, confirm `text-transform` does not break case-sensitive values (selectors, ease names, filters).

---

## 9. File map

| File | Responsibility |
|------|----------------|
| `playground-v2/playground-v2.css` | Tokens, all `.pg-*` rules |
| `playground-v2/playground-v2.js` | `buildTrackSliderHTML`, `buildSelectRowHTML`, `buildDropdownFieldHTML`, `buildSegmentRowHTML`, `buildSegmentBarHTML` |
| `playground-v2/tuner/tuner.css` | Canvas / frame typography only |
| `split-text-playground/fonts.css` | `@font-face` for Giest |

---

## 10. Changelog

| Date | Change |
|------|--------|
| 2026-05 | Light theme, spacing tokens, segment bars, inline Ease/Animate, rhythm rules documented |
| 2026-05 | Full-bleed segment selection (no nested pill); `--pg-accent-fill` as selected fill |

When tokens or patterns change, update **this file** and the token block in `playground-v2.css` together.
