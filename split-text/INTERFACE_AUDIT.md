# Playground v2 — UI/UX design audit

**Scope:** `playground-v2.css` (control panel) and `tuner/tuner.css` (canvas / preview page). The panel is injected by `playground-v2.js` and styled almost entirely in `playground-v2.css`.

**Context:** Dev-only tuning sidebar (PRD: dark sidebar, ~320–360px, dense controls). Your observations on small type, weak contrast, flat borders, and timid radii are accurate and are the main drivers of the “unfinished tool” feel.

---

## Executive summary

The panel is **functionally dense** but **visually under-scaled** for a tool people stare at for long sessions. Typography tops out at **12px** with many controls at **9–10px**. Muted text at **45% white** lands around **~3.7:1** contrast on `#161616` — below WCAG AA for normal text. Surfaces rely on **hairline 8% white borders** everywhere instead of layered depth. Border radii cluster at **6–8px** with no concentric system, so nested chrome feels flat and mismatched.

**What’s already solid:** `tabular-nums` on slider values, explicit transition properties (no `transition: all`), canvas `antialiased` in `tuner.css`, sensible 36px control height on primary inputs/sliders, and a clear dark token block in `#playground-v2-panel`.

---

## Severity overview

| Area | Severity | Notes |
|------|----------|--------|
| Font scale (9–11px labels) | High | Hard to scan; worse with uppercase + letter-spacing |
| Muted text contrast | High | `--pg-text-muted` fails AA for body-sized UI copy |
| Border-only depth | Medium | Matches your “weak borders” note |
| Radius inconsistency | Medium | 4 / 6 / 8px mix; compact variants break the system |
| Hit targets (buttons/tabs) | Medium | Well below 40×40px minimum |
| Press feedback (`scale(0.98)`) | Low | Slightly heavy vs. 0.96 guideline |
| Canvas spacer copy (`opacity: 0.2`) | Low–Medium | Intentional, but very low contrast |

---

## Typography & readability

The panel sets a **12px base** and pushes hierarchy down instead of up:

```39:40:split-text/playground-v2/playground-v2.css
  font-size: 12px;
  line-height: 1.35;
```

Smallest sizes in the file:

| Element | Size | File |
|---------|------|------|
| Panel base | 12px | `playground-v2.css` |
| Buttons, tabs, toggles | 11px | `.pg-btn`, `.pg-tabs__btn`, `.pg-toggle` |
| Field labels, legends, section titles | 10px | `.pg-field__label`, `.pg-fieldset__legend` |
| Subtabs, compact labels | 10px | `.pg-subtabs__btn` |
| Label-above sliders, hints, compact prop labels | **9px** | `.pg-track-slider__label-above`, `.pg-st-position__hint`, `.pg-prop-block--text` |
| Footer `kbd` | **9px** | `.pg-footer kbd` |

**Issues:**
- **Uppercase + wide tracking** on 9–10px labels (`.pg-field__label` uses `letter-spacing: 0.06em`; legends use `0.08em`) shrinks perceived size and hurts legibility.
- **Inter at 12px** on a dark UI reads smaller than the same size on light UI; dev tools usually sit at **13–14px** base with **11–12px** secondary, not 10–9px.
- PRD calls for a **“strong sans-serif”** sidebar; implementation leans **light weight (500–600)** on tiny caps — opposite of “strong.”

### Typography — recommended direction

| Before | After |
|--------|--------|
| Panel `font-size: 12px` (`playground-v2.css` L39) | Base **13px** or **14px**; keep `line-height` ≥ **1.4** |
| Labels/legends at **10px** uppercase | **11–12px** sentence case or small caps; drop tracking to **0.02–0.04em** |
| **9px** hints / compact labels | Floor at **11px**; use weight/color for hierarchy, not size |
| Buttons/tabs at **11px** | **12–13px**; increase vertical padding |
| No `text-wrap` on panel copy | Optional `text-wrap: pretty` on footer/help strings |
| `font-smoothing` only in `tuner.css` | Add `-webkit-font-smoothing: antialiased` on `#playground-v2-panel` so BYO pages get it |

### Canvas (`tuner.css`)

| Before | After |
|--------|--------|
| Spacer frames: `opacity: 0.2` + `0.875rem` (`tuner.css` L62–64) | **0.35–0.45** opacity if still “background”; or keep 0.2 but don’t rely on it for instructions users must read |
| `max-width: 28ch` on spacers | Fine for de-emphasis; pair with higher opacity if copy matters |

---

## Color & contrast

Token block:

```17:24:split-text/playground-v2/playground-v2.css
  --pg-bg: #161616;
  --pg-bg-elevated: #1f1f1f;
  --pg-bg-input: #2a2a2a;
  --pg-border: rgb(255 255 255 / 0.08);
  --pg-text: #f2f2f2;
  --pg-text-muted: rgb(255 255 255 / 0.45);
  --pg-accent: #5b8def;
```

**Approximate contrast (on `#161616`):**

| Pair | Ratio | WCAG AA (normal) |
|------|-------|------------------|
| `#f2f2f2` on `#161616` | ~**15:1** | Pass |
| Muted `white/45%` (~`#7f7f7f`) on `#161616` | ~**3.7:1** | **Fail** (needs 4.5:1) |
| Border `white/8%` | Decorative only | Reads as “barely there” |
| Disabled `.pg-toggle` `opacity: 0.35` | ~**2:1** effective | **Fail** (acceptable only if non-essential) |
| Syncing body `opacity: 0.55` | Temporary state | OK if brief |

**Issues:**
- **Muted color is used for primary UI labels** (tabs inactive, field labels, legends, slider labels) — not just tertiary hints.
- **Ghost buttons** (`.pg-btn--ghost`) use muted on transparent — same failure.
- **Dropdown chevron** SVG fill `%23ffffff80` (~50% white) is borderline for a functional affordance.
- **Elevation** is only ~5–6 RGB steps (`#161616` → `#1f1f1f` → `#2a2a2a`) — surfaces don’t separate much without stronger borders.

### Color & contrast — recommended direction

| Before | After |
|--------|--------|
| `--pg-text-muted: rgb(255 255 255 / 0.45)` | **`/ 0.62–0.70`** for labels (~**5:1+** on `#161616`) |
| Separate token for **tertiary** hints only | e.g. `--pg-text-subtle: / 0.45` for footer hints, not field labels |
| `--pg-border: white / 0.08` on all controls | **`/ 0.12–0.14`** for inputs, or replace container borders with shadow ring (see Surfaces) |
| Hover `#353535` on `#2a2a2a` inputs | Slightly larger step or **lighten border** on hover for feedback |
| Disabled `opacity: 0.35` | **0.5** minimum + `cursor: not-allowed`; don’t use opacity alone for text |

---

## Surfaces, border radius & depth

**Radius system today:**

| Token / use | Value |
|-------------|--------|
| `--pg-radius` | **8px** (inputs, sliders, toggles) |
| Buttons, tabs, subtabs | **6px** |
| Compact sliders | **6px** (overrides 8px) |
| Footer `kbd` | **4px** |

**Issues (matches your “weak curves” note):**
- **6px vs 8px** with no rule — compact prop grid uses 6px chrome while standard sliders use 8px.
- **No concentric radii** where it matters: e.g. `.pg-control-bar` is 8px with `padding` implied by label inset; inner `.pg-input` is `border-radius: 0` (correct for flush inner), but sibling **buttons at 6px** don’t relate to **8px** fields.
- **4px on `kbd`** feels chip-like and cheap next to 8px controls.
- **Borders everywhere** — panel `border-left`, header `border-bottom`, legend `border-bottom`, every input/slider/toggle — without shadow lift reads flat and “wireframe.”

PRD asks for smooth, polished dark chrome; the skill’s guidance fits: **layered `box-shadow` for elevation**, reserve **1px borders for dividers** (header/footer separators are fine).

### Concentric border radius

| Before | After |
|--------|--------|
| Mixed **6px / 8px / 4px** without formula | Pick scale: e.g. **10px** controls → outer **10px**; nested **6px** if `4px` padding |
| `--pg-radius: 8px` + buttons `6px` | Single **`--pg-radius-sm: 8px`**, **`--pg-radius-md: 10px`**, **`--pg-radius-lg: 12px`**; map buttons/tabs to `sm`, fields to `md` |
| `kbd` `border-radius: 4px` | **`6px`** aligned with `sm` |

### Shadows instead of borders (containers)

| Before | After |
|--------|--------|
| `border: 1px solid var(--pg-border)` on `.pg-input`, `.pg-track-slider__chrome`, `.pg-control-bar`, `.pg-toggle` | **Divider borders** only between sections; controls use e.g. `box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.2)` |
| Panel `border-left: 1px solid` | **`box-shadow: -1px 0 0 rgba(255,255,255,0.08)`** or slightly stronger ring + soft ambient shadow |
| Focus: border-color + light `box-shadow` ring (L299–301) | Keep; bump ring opacity slightly when borders are removed |

---

## Layout, density & hierarchy

**Strengths:**
- Sticky full-height panel, grid canvas shrink — good for preview-first workflow.
- **36px** `--pg-control-height` on sliders/inputs is a solid touch target for drag controls.
- Property grid and stagger blocks use consistent **6–12px** gaps.

**Issues:**
- **~360px** width + 12px type + 2-column prop grid → cramped **9px** compact labels.
- **Double labeling** on track sliders (uppercase label inside bar *and* field labels elsewhere) adds noise without adding clarity.
- Header action row wraps with **6px** gap — buttons feel like chips, not a toolbar.
- Tab order in markup (Typography → Properties → SplitText → ScrollTrigger) differs from PRD tab numbering (Properties vs SplitText swap) — cognitive, not visual, but adds friction.

### Layout — recommended direction

| Before | After |
|--------|--------|
| `padding: 6px 10px` on `.pg-btn` | **`8px 12px`** min; consider **40px** min-height |
| `.pg-tabs__btn` `padding: 7px 4px` | **`10px 8px`**; min-height **40px** |
| 2-column prop grid always | Single column under **380px** panel width, or widen panel to **400px** |
| Uppercase labels inside + outside sliders | **One** label pattern: label above (12px) + value inside bar only |

---

## Interaction & motion

| Check | Status |
|-------|--------|
| Specific transition properties | Good — no `transition: all` |
| `tabular-nums` on slider values | Good (L369) |
| Press scale | `.pg-btn:active { scale(0.98) }` — use **0.96** per guideline |
| Panel open/close | Opacity + grid — fine; no staggered enter (OK for dev panel) |
| Focus visible | Background/border change; consider **2px focus ring** for keyboard users |
| Hit area on small buttons | **Below 40×40px** — extend with `::after` pseudo hit pad |

### Interaction — recommended direction

| Before | After |
|--------|--------|
| `.pg-btn:active { transform: scale(0.98) }` | **`scale(0.96)`** + `transition-property: transform, background-color, color` |
| Tab/button ~24–28px tall | **`min-height: 40px`** or invisible `::after` 40×40 hit slop |
| No `:focus-visible` ring on tabs | **`outline: 2px solid`** accent at **`outline-offset: 2px`** |

---

## Accessibility checklist (current)

| Criterion | Pass? |
|-----------|-------|
| Body text contrast ≥ 4.5:1 | Primary text yes; **labels/muted no** |
| Large text / UI components ≥ 3:1 | Some large controls OK; **small caps labels no** |
| Target size ≥ 24×24 (WCAG 2.2) | Sliders/inputs yes; **buttons/tabs no** |
| Focus indicators | Partial — inputs yes; tabs/buttons weak |
| Disabled state distinguishable | Low contrast |

---

## File-by-file summary

### `playground-v2.css` (primary)

Dev sidebar — **all findings above apply here.** This is where to invest: type scale, tokens, radii, borders/shadows, hit targets.

### `tuner/tuner.css` (secondary)

Preview canvas only — small file, mostly good (`antialiased`, sensible `1.25rem` playground type). Main issue is **intentionally faint spacer copy** (`opacity: 0.2`), which is fine for decoration but poor if users treat frame 1/3 instructions as primary content.

---

## Suggested token refresh (reference)

Not a mandate — a coherent target system:

```css
/* Example target — for implementation in Agent mode */
--pg-font-size: 13px;
--pg-font-size-sm: 12px;
--pg-font-size-xs: 11px;   /* floor — no 9px */
--pg-text-muted: rgb(255 255 255 / 0.65);
--pg-text-subtle: rgb(255 255 255 / 0.45);
--pg-border: rgb(255 255 255 / 0.12);
--pg-radius-sm: 8px;
--pg-radius-md: 10px;
--pg-control-height: 40px;
```

---

## Prioritized fix order

1. **Raise muted contrast** and stop using tertiary opacity for field/tab labels.  
2. **Bump type scale** (kill 9px; 12→13–14 base).  
3. **Unify radius scale** and align compact variants.  
4. **Replace control borders with shadow rings**; keep borders as section dividers.  
5. **Enlarge button/tab hit areas** and set press scale to **0.96**.  
6. **Polish focus rings** and disabled-state contrast.

---

## Review checklist (skill)

| Principle | Status |
|-----------|--------|
| Concentric border radius | Needs work |
| Shadows vs borders on controls | Needs work |
| Tabular numbers | Done |
| Font smoothing on panel | Partial (inherits from tuner only) |
| Scale on press 0.96 | Off (0.98) |
| Min 40×40 hit area | Fails on buttons/tabs |
| No `transition: all` | Pass |
| text-wrap on headings | N/A in panel |

---

I’m in **Ask mode**, so this is audit-only. If you want these applied in the repo, switch to **Agent mode** and I can implement the token + type + surface pass in `playground-v2.css` first, then tune `tuner.css` if needed.