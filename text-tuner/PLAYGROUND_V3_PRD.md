# Text Tuner v3 — Product Requirements

> **Status:** Spec locked.  
> **Location:** `text-tuner/` (implementation); reference v2 in `split-text/playground-v2/`.  
> **Audience:** Dev-only SplitText + ScrollTrigger tuning for learning, drafting, and export to production.

---

## 1. Summary

Text Tuner is a **dev-only control panel** for basic SplitText scroll animations. While tuning, a **generic runner** executes GSAP from an **in-memory config** the panel edits. Production ships **Copy code** — imperative `SplitText.create` blocks with no panel and no runner.

**Core model:** Runner + in-memory config (dev) → Copy code spaghetti (production).

---

## 2. Goals

- Fine-tune **basic** animations: `gsap.set`, `gsap.to`, stagger, essential ScrollTrigger (start/end/scrub/trigger/markers).
- Support **multiple instances** per page via `data-playground` ids.
- **Three onboarding paths:** cold start (HTML only), import spaghetti, Tier 1 config.
- **Live preview** for tween/ST fields; **rebuild on commit** for SplitText + typography.
- Export **Copy code** (production), **Copy config** (Tier 1 persistence), **Copy CSS** (typography).
- Teach GSAP SplitText patterns without a full timeline IDE.

---

## 3. Non-goals (v3)

- GUI for timelines, nested tweens, or custom `onSplit` logic (Tier 2 hook — future).
- Runtime hooking / introspection of live GSAP on page.
- Auto-read or auto-write consumer source files in browser.
- Parse arbitrary dynamic spaghetti (Import = **canonical** subset only).
- Full ScrollTrigger surface (pin, toggleActions, anticipatePin, etc.).
- Full Club SplitText advanced options tab.
- Click-to-select on canvas (Agentation-style) — deferred.
- MCP / Vite file write-back — deferred.
- localStorage “pin settings” — deferred (sessionStorage only in v3).

---

## 4. Architecture

```text
HTML  data-playground="id"
        ↓
Tier 0 discover()  |  Tier 1 define({ id: config })
        ↓
In-memory config (per id)  ←  Panel  |  Import Apply
        ↓
Generic runner  →  SplitText + gsap + ScrollTrigger
        ↓
sessionStorage (per id, on commit)
        ↓
Copy code  →  production script.js
```

### 4.1 Ownership rule

| Context | Owner of `[data-playground]` element |
|---------|--------------------------------------|
| Dev page (Strategy A — default) | **Runner only** — no spaghetti for that selector |
| Dev page, other elements | Any GSAP OK |
| Production | **Copy code spaghetti only** — no panel, no runner |

Config does **not** override spaghetti. Both on same element = broken (warn in console).

### 4.2 Strategy A (default dev page)

No imperative SplitText for any `[data-playground]` target on the tuning page.

**Strategy B (optional):** `if (!TextTuner.isActive()) { …spaghetti… }` when one script serves dev + prod.

---

## 5. HTML contract

```html
<section data-playground-trigger="hero-lines">
  <p data-playground="hero-lines" class="split-target">…</p>
</section>
```

| Attribute | On | Purpose |
|-----------|-----|---------|
| `data-playground` | SplitText text target | Instance id (kebab-case); registry key |
| `data-playground-trigger` | Section / container (optional) | ScrollTrigger trigger; maps to `targets.element` |

- One unique id per page (duplicate → boot warning).
- Remove `data-playground` from production HTML when shipped (recommended).
- Tuner pages: 3× `100vh` frames (spacer → animation → spacer) recommended for scroll testing.

---

## 6. Config schema (`SplitScrollConfig`)

Per instance:

```javascript
{
  __schema: "split-scroll-v1",  // optional; for session migration
  targets: {
    element: string,   // ScrollTrigger trigger selector
    text: string,      // '[data-playground="id"]'
  },
  splitText: {
    type: string,      // "words,lines" etc.
    mask: "lines" | "words" | "chars" | "none",
    autoSplit: boolean,
    smartSplit: boolean,
  },
  animate: "lines" | "words" | "chars",
  from: { /* tween props */ },
  to: {
    duration: number,
    ease: string,
    /* tween props */
  },
  stagger: {
    timing: "amount" | "each",
    amount?: number,
    each?: number,
    from: string,
    ease?: string | null,
    grid?: [number, number] | null,
    axis?: "both" | "x" | "y",
  },
  scrollTrigger: {
    trigger: string,
    start: string,
    end: string,
    scrub: false | true | number,
    markers: boolean,
  },
  typography: {
    fontVar: string,
    fontSize: number,
    lineHeight: number,
    letterSpacing: number,
    textAlign: string,
    textTransform: string,
  },
}
```

**Animatable props (from/to grid):** opacity, x, y, xPercent, yPercent, scale, rotation, rotationX, rotationY, filter.

---

## 7. Public API

### 7.1 Tier 0 — `discover(options?)`

- Scans `[data-playground]` in DOM.
- For ids **without** `define()` entry: builds config from `buildScaffoldConfig(id)`.
- Returns registry `{ [id]: { label, defaults, init } }`.
- Validates DOM ↔ registry (warnings).

### 7.2 Tier 1 — `define(entries)`

```javascript
define({
  "hero-lines": { /* SplitScrollConfig */ },
});
```

- Merged at registry build; overrides scaffold for those ids.
- Keys must match `data-playground` values.

### 7.3 `attach(options)`

```javascript
attach({
  registry,           // from discover() or built internally
  activeId: string,
  storageKey: string,  // per-id: `${storageKey}:${id}`
  targets: string,      // typography sample selector, default ".split-target"
  productionEnabled: false,
  fonts?: FontEntry[], // optional override
});
```

- Inits **all** registry instances for scroll preview.
- Panel edits **active** instance only.
- v2 compat: `attach({ init, defaults, storageKey, targets })` → single-entry registry.

### 7.4 Runner — `createSplitScrollRunner(config)`

- `(config) => { teardown, runtime: { applyLive, getConfig, … } }`
- Used by registry; exportable for advanced consumers (discouraged in prod).

### 7.5 Import — `convert(source, { id })`

- `{ config, warnings[] }`
- Canonical input = Copy code export shape.
- Panel Import tab: Convert → **Apply** → in-memory config (not `script.js`).

### 7.6 Utilities

- `isActive()` — true when panel attached (Strategy B guard).
- `SCHEMA_VERSION` — config schema string.

---

## 8. Onboarding tiers

| Tier | Input | Use |
|------|-------|-----|
| **0** | HTML + `data-playground` only | Cold start, teaching |
| **1** | `define({ id: config })` | Git-friendly starting values |
| **2** | Custom `registry[id].init` | Timelines / custom logic (future) |

Generic runner handles Tier 0 and 1. Same panel, same export.

---

## 9. Official workflows

### Workflow 1 — Cold start

1. Markup + styles; `data-playground="my-id"`.
2. `discover()` + `attach()`.
3. Tune panel.
4. **Copy code** → production `script.js`.
5. Remove playground from production HTML.
6. Remove `data-playground` (recommended).

### Workflow 2 — Import spaghetti

1. Playground page (Strategy A): no old spaghetti for this target.
2. Add `data-playground` (+ trigger attribute).
3. Import tab: paste canonical block → Convert → **Apply**.
4. Delete source spaghetti from dev page (never run both).
5. Tune → **Copy code** → **replace** old block in production `script.js`.
6. Remove `data-playground`; next element.

### Workflow 3 — Config in script

1. `define({ id: config })` on dev page.
2. Tune; optional **Copy config** to update `define()` in repo.
3. **Copy code** → replace config with spaghetti in production.
4. Remove playground + attribute from production.

### Multi-element progression

Finish one id (ship + remove attribute) before starting the next on the same page.

### Stale code rule

**Replace**, never append duplicate spaghetti for the same selector.

---

## 10. Control panel

### 10.1 Layout (inherits v2)

- Fixed right sidebar ~320–400px; canvas visible; dark/light theme TBD (v2 light sidebar).
- `⌘K` / `Ctrl+K` toggle panel.
- `⌘1`–`⌘4` tabs: Typography, Properties, SplitText, ScrollTrigger.
- Esc: blur input first, then close + commit.
- Footer: shortcuts + overlap reminder.

### 10.2 v3 additions

| Feature | Spec |
|---------|------|
| **Instance dropdown** | Header; all registry ids; hide if `length === 1` |
| **Follow viewport** | Toggle default off; IO on `targets.element`; idle when panel closed |
| **Import tab** | Bottom; paste → convert → warnings → Apply to selected instance |
| **Reset instance** | Active id → code defaults; clear session key |
| **Reset all** | All ids + all session keys |
| **Overlap warning** | Console if split artifacts on `[data-playground]` before runner init |

### 10.3 Tabs

| Tab | Contents | Update |
|-----|----------|--------|
| Typography | Font, size, line-height, letter-spacing, align, transform | Rebuild on commit |
| Properties | duration, ease, animate target, from\|to grid, stagger | **Live** |
| SplitText | type, mask, autoSplit, smartSplit, targets | Rebuild on commit |
| ScrollTrigger | trigger, start, end, scrub tri-state, markers | **Live** |

### 10.4 Dock

- **Copy config** — active instance → Tier 1 object.
- **Copy code** — active instance → production spaghetti (**final output**).
- **Copy CSS** — typography `:root` block.

Copy code format (canonical):

```javascript
SplitText.create('[data-playground="id"]', {
  type: "…",
  mask: "…",  // if not none
  autoSplit: true,
  smartSplit: true,
  onSplit(self) {
    gsap.set(self.lines, { /* from */ });
    return gsap.to(self.lines, {
      /* to props */,
      duration: 1,
      ease: "power2.out",
      stagger: { /* … */ },
      scrollTrigger: { /* … */ },
    });
  },
});
```

Production may use class selectors after removing `data-playground`.

---

## 11. Update & commit model

### Live (panel open)

Properties tab, ScrollTrigger tab, animate target (when valid).

### Rebuild on commit (panel close)

SplitText tab, Typography tab, target selector changes.

### On commit

1. Merge form → config.
2. Save `sessionStorage` for active id.
3. Teardown → runner reinit for affected instance(s).
4. `ScrollTrigger.refresh(true)`.
5. `window.scrollTo({ top: 0, behavior: "instant" })`.

Pending indicator on Typography / SplitText tabs when queued.

---

## 12. Multi-instance

- Per-id session: `${storageKey}:${id}`.
- Switch instance: commit current → rebuild → hydrate next.
- Export scoped to active instance only.
- All instances init on page for scroll testing.
- Import Apply: last apply wins per id.
- Follow viewport switches active instance (when enabled + panel open).

---

## 13. Import converter

| Surface | Behavior |
|---------|----------|
| **Import tab** | Paste → convert → Apply → in-memory config + runner rebuild |
| **CLI** (optional) | `text-tuner-convert snippet.js --id x --format define` → stdout only |

- Input: canonical block only (round-trip with Copy code).
- Apply sets `targets.text` to `[data-playground="${id}"]`.
- Warnings for unmapped fields; user fixes in panel or uses Tier 2 later.

---

## 14. Persistence & reset

| Action | Effect |
|--------|--------|
| Commit | Save active id to sessionStorage |
| Reset instance | Defaults from define/discover; clear that session key |
| Reset all | All instances; all `storageKey:*` keys |
| Reload | Restore from sessionStorage merged with code defaults |

Reset does not edit consumer `script.js`.

---

## 15. Production boundary

- Remove: panel JS/CSS, `attach()`, `discover()`, `define()`.
- Keep: **Copy code** blocks in `script.js`.
- No runner, no in-memory config, no panel.
- Optional: strip `data-playground` from HTML.

---

## 16. File organization (consumer project)

```
project/
├── index.html          # data-playground + DEV scripts only in dev
├── styles.css
└── script.js           # runner configs OR define(); production spaghetti after ship
```

Reference: `split-text/playground-v2/examples/sample-playground/`

Separate HTML, CSS, JS always. Plugin: `text-tuner` npm package.

---

## 17. npm package (v3.0)

See [PLUGIN_MIGRATION.md](./PLUGIN_MIGRATION.md).

- Peer: `gsap` (SplitText documented separately).
- Exports: main, `./styles.css`, `./runner`, `./convert`.
- `productionEnabled: false` default.
- v2 `attach({ init, defaults })` compat for one major.

---

## 18. Deferred (post-v3.0)

- Tier 2 custom factories in GUI
- Advanced ScrollTrigger / SplitText tabs
- Click-to-select target
- localStorage pin
- Vite plugin / MCP write-back
- npm publish copy / demo site

---

## 19. Success criteria

- [ ] Cold start: attribute + discover → tunable in &lt; 2 min, no GSAP authored.
- [ ] Import canonical paste → Apply → panel matches within warnings.
- [ ] Live ST + tween updates without re-split.
- [ ] SplitText / typography rebuild on commit.
- [ ] Multi-instance switch without cross-contamination.
- [ ] Copy code runs in production with panel removed.
- [ ] Overlap warning when spaghetti + runner compete.
- [ ] Copy code ↔ convert round-trip stable within major version.

---

## 20. References

| Doc | Path |
|-----|------|
| Architecture & options | `split-text/playground-v2/PLAYGROUND_PLUGIN.md` |
| v2 PRD | `split-text/playground-v2/PLAYGROUND_V2_PRD.md` |
| Sample project | `split-text/playground-v2/examples/sample-playground/` |
| Migration checklist | `./PLUGIN_MIGRATION.md` |
| Acceptance tests | `./ACCEPTANCE_TESTS.md` |
| UI standards | `split-text/INTERFACE_RULES.md` |

---

## 21. Decision log

| # | Topic | Decision |
|---|--------|----------|
| 1 | Location | `text-tuner/` separate from v2 |
| 2 | Dev model | Runner + in-memory config |
| 3 | Production output | Copy code spaghetti only |
| 4 | DOM marker | `data-playground="id"` |
| 5 | Onboarding | Tier 0 discover + Tier 1 define |
| 6 | Dev page | Strategy A default |
| 7 | Import | Apply to memory; canonical paste only |
| 8 | Multi-instance | Registry + dropdown + per-id session |
| 9 | GUI scope | set/to + basic ST only |
| 10 | Stale spaghetti | Delete/replace; never append |
| 11 | v2 | Frozen; compat attach one major |
