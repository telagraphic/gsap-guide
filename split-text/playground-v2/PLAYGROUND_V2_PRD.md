# Playground v2 — Product Requirements

> **Status:** Spec locked via design review (grill session).  
> **Scope:** Dev-only tuning harness for a single SplitText + ScrollTrigger + scrubbed tween.  
> **Out of scope for v2:** Advanced ScrollTrigger sub-tab, Club SplitText options, localStorage pin, npm plugin packaging.

---

## 1. Goals

- Fine-tune **one** SplitText + ScrollTrigger animation in a **test page** before copying to production.
- Expose **SplitText**, **ScrollTrigger**, **tween properties** (from/to), **stagger**, and **typography** in a unified control panel.
- Provide **fast feedback** while editing (tiered live updates) and a **realistic commit** step when closing the panel (structural rebuild + scroll reset).
- Export **Copy config** (testing / harness) and **Copy code** (literals for production, refactor later).

---

## 2. Non-goals (v2)

- Multi-demo gallery pages (v1 `basics/` stays as-is).
- Multiple SplitText instances on one page.
- Full ScrollTrigger surface (pin, toggleActions, etc.) — deferred to “Advanced” sub-tab.
- Full SplitText Club option surface — deferred to “Advanced” sub-tab.
- Bundler / ESM as the default load path (script tags first).
- Plugin distribution (npm/CDN) — see [§12 Future: Plugin](#12-future-plugin).

---

## 3. Product shape

| Decision | Choice |
|----------|--------|
| Version | **v2 fresh start** — do not break v1 |
| Location | `split-text/playground-v2/` |
| Tuning page | `playground-v2/tuner/index.html` (canonical template) + BYO HTML checklist in README |
| Frames | **3×** `section.frame` at `100vh` — spacer → animation (frame 2) → spacer |
| Default targets | `CONFIGURATION.targets.element = ".frame--2"`, `targets.text = ".frame--2 .frame__copy"` (overridable in code + panel) |
| Animations per page | **One** SplitText + one scrubbed tween |

---

## 4. Control panel UX

### 4.1 Layout

- **Fixed right sidebar** (~320–360px); document uses CSS grid — canvas column shrinks when panel open.
- **Overlay is not used** — canvas must remain visible for preview while tuning.
- **Theme:** Dark sidebar (reference mockups) — strong sans-serif, smooth transitions on toggles/inputs.
- **Toggle:** `⌘K` / `Ctrl+K` opens/closes panel.
- **Tab shortcuts:** `⌘1`–`⌘4` / `Ctrl+1`–`4` when playground is active (Typography, Properties, SplitText, ScrollTrigger).
- **Esc:** Same as close (commit). If focus is in a text/number input, first Esc blurs; second Esc closes.
- **Cheat sheet:** Shortcuts listed in panel footer (`?` or similar).

### 4.2 Tabs

| # | Tab | Contents |
|---|-----|----------|
| 1 | **Typography** | Font, size, line-height, letter-spacing, align, transform — CSS custom properties on `:root` (v1 parity). **Copy CSS**. |
| 2 | **Properties** | `duration`, `ease` (header) + start \| end grid for animatable props. **Animate target:** lines \| words \| chars. |
| 3 | **SplitText** | Core options + target selector overrides. |
| 4 | **ScrollTrigger** | Essential scrub harness only. |

### 4.3 Header actions

- **Copy config** — merged JSON/JS object for `setupAnimation(config)`.
- **Copy code** — ready-to-paste GSAP block with literals (production-oriented).
- **Reset to defaults** — clears session storage, rebuilds from `DEFAULT_CONFIG`.

---

## 5. Update & commit model

### 5.1 Tier B — live while panel is open

- **Properties tab:** from/to values, `duration`, `ease`, stagger (simple + advanced).
- **ScrollTrigger tab:** `trigger`, `start`, `end`, `scrub` (including smooth numeric), `markers`.
- **Animate target:** retarget tween to `self.lines` / `self.words` / `self.chars` when that collection exists; **disabled** when not split.

Implementation: patch active tween vars, update ScrollTrigger, `ScrollTrigger.refresh()` as needed — **no** full DOM re-split.

### 5.2 Queued — rebuild on panel close

- **SplitText tab** changes (`type`, `mask`, `autoSplit`, `smartSplit`, target selectors if they change DOM).
- **Typography tab** changes (affect metrics / line breaks).

UI: subtle **pending** indicator on affected tab(s).

### 5.3 On panel close (commit)

1. Merge form state → config object.
2. Save to **sessionStorage** (key from `attach({ storageKey })`).
3. Run full **teardown** → `setupAnimation(config)`.
4. `ScrollTrigger.refresh(true)` + update.
5. **`window.scrollTo({ top: 0, behavior: "instant" })`** — replay full scroll from top.

---

## 6. Source of truth

| Concern | Owner |
|---------|--------|
| Typography | CSS variables (`--playground-*`) via Typography tab |
| Animation “from” state | **`gsap.set` only** — not CSS custom properties on split targets |
| Animation “to” state | **`gsap.to`** |
| Initial layout of frames | Page CSS (non-animated) |

**Rationale:** `gsap.set` runs after CSS; motion intent is clearer in copied JS than duplicated CSS vars.

---

## 7. Config object schema (conceptual)

```javascript
const DEFAULT_CONFIG = {
  targets: {
    element: ".frame--2",      // ScrollTrigger trigger
    text: ".frame--2 .frame__copy", // SplitText selector
  },
  splitText: {
    type: "words,lines",       // comma-separated
    mask: "lines",             // "lines" | "words" | "chars" | ""
    autoSplit: true,
    smartSplit: true,
  },
  animate: "lines",            // "chars" | "words" | "lines"
  from: { yPercent: 100 },
  to: {
    yPercent: 0,
    duration: 1,
    ease: "power2.out",
  },
  stagger: {
    mode: "simple",            // "simple" | "advanced"
    value: 0.1,                // when simple → stagger: 0.1
    amount: 0.1,
    each: undefined,
    from: "start",
    ease: undefined,
  },
  scrollTrigger: {
    trigger: ".frame--2",
    start: "top 25%",
    end: "top top",
    scrub: true,               // false | true | number (smooth)
    markers: false,
  },
  typography: {
    fontVar: "--font-giest",
    fontSize: 1.25,
    lineHeight: 1.5,
    letterSpacing: 0,
    textAlign: "left",
    textTransform: "none",
  },
};
```

---

## 8. Control mappings

### 8.1 SplitText (v2 panel)

| Priority | Option | UI control | Commit |
|----------|--------|------------|--------|
| 1 | `type` | Multi-toggle: chars / words / lines | Rebuild on close |
| 2 | `mask` | Select or 3-way toggle | Rebuild on close |
| 3 | `autoSplit` | Boolean toggle | Rebuild on close |
| 4 | `smartSplit` | Boolean toggle | Rebuild on close |
| 5 | `targets.text` | Text input | Rebuild on close |
| 6 | `targets.element` | Text input (ST trigger; display in ST tab or shared) | Rebuild on close |

**Deferred (Advanced sub-tab):** `tag`, `*Class`, `aria`, `reduceWhiteSpace`, `deepSlice`, `smartWrap`, `propIndex`, `wordDelimiter`, `ignore`.  
**Not in UI:** `prepareText`, `onSplit`, `onRevert` (live in `setupAnimation` factory).

### 8.2 ScrollTrigger (v2 essential)

| Priority | Option | UI control | Live |
|----------|--------|------------|------|
| 1 | `start` | Text (`top 25%`) | Yes |
| 2 | `end` | Text | Yes |
| 3 | `scrub` | **Off \| On \| Smooth** + number input when Smooth | Yes |
| 4 | `trigger` | Text | Yes |
| 5 | `markers` | Boolean toggle | Yes |

**Deferred:** `pin`, `toggleActions`, `anticipatePin`, `invalidateOnRefresh`, `id`, etc.

### 8.3 Properties tab

| Property | Control | Columns |
|----------|---------|---------|
| `opacity` | Slider 0–1 | Start \| End |
| `x`, `y` | Slider (px) | Start \| End |
| `xPercent`, `yPercent` | Slider (%) | Start \| End |
| `scale` | Slider | Start \| End |
| `rotation`, `rotationX`, `rotationY` | Slider (deg) | Start \| End |
| `filter` | Text input | Start \| End |
| `duration` | Slider | Header (single) |
| `ease` | Dropdown | Header |
| **Animate target** | Select: lines \| words \| chars | Header (disabled if invalid) |

### 8.4 Stagger

| Mode | UI | Output |
|------|-----|--------|
| **Simple** | Slider | `stagger: 0.1` |
| **Advanced** | `amount`, `each` (optional), `from` (icon toggle), `ease` (dropdown) | `stagger: { amount, from, … }` |

Mode switch: **Simple \| Advanced** (default Simple).

---

## 9. Code architecture

### 9.1 Pattern

**Factory:** `setupAnimation(config) → teardown`

- `animation.js` (user): `DEFAULT_CONFIG`, `setupAnimation`, registers plugins.
- `playground-v2.js`: UI, persistence, tier B vs rebuild, `attach()`.

### 9.2 Script load order (vanilla HTML)

```html
<!-- 1. GSAP -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>

<!-- 2. User animation -->
<script src="./my-animation.js"></script>

<!-- 3. DEV ONLY -->
<link rel="stylesheet" href="../playground-v2/playground-v2.css" />
<script src="../playground-v2/playground-v2.js"></script>
<script>
  SplitTextPlaygroundV2.attach({
    init: setupAnimation,
    defaults: DEFAULT_CONFIG,
    storageKey: "my-tuner-session",
    targets: ".split-target",
  });
</script>
```

### 9.3 Production port

Remove DEV ONLY block (CSS + playground script + `attach()`). Call `setupAnimation(DEFAULT_CONFIG)` once, or paste **Copy code** output.

### 9.4 Optional ESM (later)

Same contract with `export function setupAnimation` — not required for v2.

---

## 10. Persistence

| Mechanism | When |
|-----------|------|
| **sessionStorage** | Auto-save merged config on panel close (commit) |
| **Reset to defaults** | Header action — clear storage, rebuild from `DEFAULT_CONFIG` |
| **localStorage pin** | v2.1 — explicit “Pin settings” |

---

## 11. Deliverables (implementation checklist)

- [x] `playground-v2/playground-v2.js` — panel, attach API, tier B, commit pipeline
- [x] `playground-v2/playground-v2.css` — dark sidebar, grid layout, tab transitions
- [x] `playground-v2/tuner/index.html` — 3-frame template
- [x] `playground-v2/tuner/animation.js` — reference `setupAnimation` + `DEFAULT_CONFIG`
- [x] `playground-v2/README.md` — load order, BYO HTML checklist, attach options, porting guide
- [x] Copy config / Copy code generators
- [x] Tab pending indicators + footer shortcut legend

---

## 12. Future: Plugin

**Intent:** After v2 works in-repo, explore packaging for others (npm, CDN, or GSAP community pattern).

**Feasibility:** Yes — core is already isolated (`playground-v2.js` + CSS + `attach()`). Plugin step is mostly **packaging and API hardening**, not a rewrite.

**Likely plugin boundaries:**

| Package | Responsibility |
|---------|----------------|
| **Plugin runtime** | `attach()`, config schema, UI shell, tier B engine, export/copy, no demo markup |
| **User project** | HTML frames, `setupAnimation`, `DEFAULT_CONFIG` |

**Work before publishing:**

1. **Zero globals** (optional UMD + ESM builds; `SplitTextPlayground` as named export).
2. **Peer dependencies:** `gsap`, `ScrollTrigger`, `SplitText` (document Club license for SplitText).
3. **Configurable** `attach({ root, position, theme })` — sidebar vs future dock.
4. **No hard-coded selectors** — all defaults from `attach({ defaults })`.
5. **Versioned config schema** — migrations if panel adds fields.
6. **Tree-shakeable CSS** or CSS-in-JS injection option.
7. **Docs site** — minimal tuner example + “strip DEV block” porting guide (this PRD → public README).

**Not a GSAP “official” plugin** unless submitted to GreenSock; more accurate label: **devtools panel** or **companion library** for SplitText workflows.

**Save for later:** npm package name, licensing (MIT), demo deployment, GreenSock forum announcement — after v2 ships in this repo.

---

## 13. Decision log (grill session)

| # | Topic | Decision |
|---|--------|----------|
| 1 | Product shape | A — new dedicated tuning page |
| 2 | Tabs | A — 4 tabs including Typography |
| 3 | Update model | B tiered + C commit: live Properties/ST; queue SplitText/Typography |
| 4 | Esc | Same as Cmd+K; blur input first |
| 5 | Panel layout | A — fixed right sidebar, canvas shrinks |
| 6 | Export | C — Copy config + Copy code |
| 7 | Motion vs CSS | A — GSAP only for animated props |
| 8 | Animate target | A — explicit; live when valid |
| 9 | Stagger | D — Simple / Advanced |
| 10 | ScrollTrigger scope | A essential; scrub tri-state; advanced later |
| 11 | Properties scope | C — standard + filter |
| 12 | duration/ease | A — Properties header |
| 13 | Scroll on commit | **Revised:** scroll to page top (`scrollTo(0)`) |
| 14 | Persistence | D — sessionStorage + reset; pin later |
| 15 | Shortcuts | A — Cmd+K, Cmd+1–4 |
| 16 | SplitText scope | B — core + target overrides |
| 17 | Folder | A — `playground-v2/` |
| 18 | Architecture | A — factory `setupAnimation` |
| 19 | Markup | C — template + BYO checklist |
| 20 | Theme | A — dark sidebar |

---

## 14. References

- v1 implementation: `split-text/split-text-playground/`
- SplitText API notes: `split-text/basics/SPLITTEXT_GUIDE.md`
- UI reference: sidebar mockups (Style/Layout-inspired — dark, tabbed, two-column property rows)
