# Text Tuner v3 — Product Requirements

> **Status:** Spec locked — aligned with migration-refactor docs (2025-06).  
> **Location:** `text-tuner/` (implementation). Legacy `split-text/playground-v2/` removed — see git history.  
> **Audience:** Dev-only SplitText + ScrollTrigger tuning for learning, drafting, and export to production.  
> **Implementation:** [v3-refactor-plan.md](./migration-refactor/v3-refactor-plan.md) · ADRs in [docs/adr/](./docs/adr/)

---

## 1. Summary

Text Tuner is a **dev-only control panel** for basic SplitText scroll animations. While tuning, a **generic runner** executes GSAP from an **in-memory config** the panel edits. Production ships **Copy code** — imperative `SplitText.create` blocks with no panel and no runner.

**Core model:** Runner + in-memory config (dev) → Copy code spaghetti (production).

---

## 2. Goals

- Fine-tune **basic** animations: `gsap.set`, `gsap.to`, stagger, essential ScrollTrigger (start/end/scrub/trigger/markers).
- Support **multiple instances** per page via `data-playground` ids.
- **Three onboarding paths:** cold start (HTML only), import spaghetti, Tier 1 config.
- **Live preview** for tween and ScrollTrigger fields; **live typography** (CSS vars on active instance); **smart rebuild on commit** for SplitText, typography geometry, and target changes ([ADR-0002](./docs/adr/0002-smart-rebuild-and-live-typography.md)).
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

| Layer | Owner |
|-------|-------|
| `[data-playground]` element (dev page) | **Runner** — Strategy A |
| Per-instance config, storage, runner lifecycle | **InstanceManager** in `attach.js` ([ADR-0001](./docs/adr/0001-instance-manager-owns-session-state.md)) |
| Panel UI | **View only** — hydrates form for `activeId`; calls `commit()`, `applyLive()`, `switchTo()` |
| Copy code shape | **`src/canonical/`** — shared by export and `convert()` ([ADR-0003](./docs/adr/0003-shared-canonical-template.md)) |

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

- Fixed right sidebar `min(400px, 92vw)`; canvas visible; **light panel, dark canvas** (demo styles in consumer CSS).
- Panel chrome: **Geist + Geist Mono** bundled in package (`styles/fonts/panel/`); system stack is fallback only.
- `⌘K` / `Ctrl+K` toggle panel.
- `⌘1`–`⌘4` tabs: Typography, Properties, SplitText, ScrollTrigger (v2 labels were Type / Tween / Split / Scroll).
- Esc: blur input first, then close + commit.
- Footer: shortcuts + active instance hint when multi-instance.
- **`tt-panel--syncing`:** disable inputs during runner rebuild or font load on Typography tab.

### 10.2 v3 additions

| Feature | Spec |
|---------|------|
| **Instance dropdown** | Header (above tabs); all registry ids; hide if `length === 1` |
| **Follow viewport** | Toggle default off; IO on `targets.element`; idle when panel closed |
| **Import** | Dock first segment **Import** — toggles drawer above dock; paste → convert → warnings → Apply to active instance |
| **Reset instance** | Active id → code defaults; clear session key |
| **Reset all** | All ids + all session keys |
| **Overlap warning** | Console if split artifacts on `[data-playground]` before runner init |

### 10.3 Tabs

| Tab | Contents | Update model |
|-----|----------|--------------|
| **Typography** | Font dropdown, size, line-height, letter-spacing, align, transform | **Live** CSS preview on active `[data-playground]`; **commit** re-splits when typography changed ([ADR-0002](./docs/adr/0002-smart-rebuild-and-live-typography.md)). Consumer canvas must inherit typography on SplitText descendants — [CANVAS_TYPOGRAPHY.md](./migration-refactor/CANVAS_TYPOGRAPHY.md). |
| **Properties** | Duration, ease, animate target, stagger block, from\|to prop grid | **Live** via `applyLive()` |
| **SplitText** | type, mask, autoSplit, smartSplit, target selectors | Rebuild on **commit** |
| **ScrollTrigger** | trigger, start/end position UI, scrub tri-state, markers | **Live** via `applyLive()` |

#### Properties tab structure (v2 parity)

- **Inner sub-tabs** (`tt-subtab-panel`): **Stagger** | **From / To** — same as v2 `selectSubTab` behavior.
- **Stagger block:** timing (amount vs each), from, ease, optional grid + axis.
- **From / To grid:** opacity, x, y, xPercent, yPercent, scale, rotation, rotationX, rotationY, filter — each row has a **per-property reset** (`tt-prop-reset`).

#### ScrollTrigger tab — position UI (v2 parity)

Start and end use the structured position editor (`tt-st-position`), not raw strings only:

- **Edge mode** vs **offset mode** per end (start/end independent).
- **Edge** picks: top, center, bottom (with selected-state highlight).
- **Offset** value + unit toggles: `%`, `vh`, `px`.
- Serialized to ScrollTrigger `start` / `end` strings (e.g. `"top 25%"`).

#### Pending indicators

Typography and SplitText tabs show `tt-segment__btn--pending` when fields changed since last commit.

### 10.4 Dock

Dock segment order: **Import · Config · Code · CSS**.

| Segment | Action |
|---------|--------|
| **Import** | Toggle import drawer (above dock). Drawer: paste area → Convert → warnings → **Apply** to active instance. |
| **Copy config** | Active instance → Tier 1 object (clipboard). |
| **Copy code** | Active instance → production spaghetti (**final output**). |
| **Copy CSS** | Active instance typography vars (clipboard). |

Import is a **toggle** (drawer open/closed). Config / Code / CSS are **one-shot copy** actions (button flash). See [ADR-0006](./docs/adr/0006-import-in-dock.md).

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

See [ADR-0002](./docs/adr/0002-smart-rebuild-and-live-typography.md).

### Live (panel open)

| Tab / field | Behavior |
|-------------|----------|
| **Properties** | `applyLive()` — duration, ease, animate, from/to, stagger update runner immediately |
| **ScrollTrigger** | `applyLive()` — trigger, start, end, scrub, markers |
| **Typography** | `applyTypography()` — CSS custom properties on active `[data-playground]` (scoped per instance, not `:root`); debounced font load; no re-split until commit |

Live changes do **not** write sessionStorage until commit.

### Smart rebuild on commit

`InstanceManager.commit()` always merges form → `committedConfig` and persists `${storageKey}:${id}`.

**Full teardown + runner reinit** only when typography, SplitText, or target selectors changed since the last commit. Live-only changes skip re-split (runner already reflects them).

### On commit

1. Merge form → config; persist active id.
2. If rebuild required: teardown → `createSplitScrollRunner` → reinit affected instance(s).
3. `ScrollTrigger.refresh(true)`.
4. `window.scrollTo({ top: 0, behavior: "instant" })`.

Pending indicator on Typography / SplitText tabs clears after successful commit.

### Typography caveat

Live typography can desync line masks when font metrics change. Acceptable for preview; commit re-splits to correct geometry. SplitText may bake inline `font-size` on split nodes — see [CANVAS_TYPOGRAPHY.md](./migration-refactor/CANVAS_TYPOGRAPHY.md).

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
| **Import tab** | Dock **Import** segment toggles drawer; paste → convert → Apply → in-memory config |
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

Reference: [`examples/sample-playground/`](./examples/sample-playground/)

Separate HTML, CSS, JS always. Plugin: `text-tuner` npm package.

---

## 17. npm package (v3.0)

See [PLUGIN_MIGRATION.md](./PLUGIN_MIGRATION.md).

- Peer: `gsap` (SplitText documented separately).
- **ESM only** — no UMD / `window.TextTuner` ([ADR-0007](./docs/adr/0007-esm-only-build.md)).
- **JS source + published `.d.ts`** — not a full TypeScript rewrite ([ADR-0009](./docs/adr/0009-js-with-dts.md)).
- Exports: main, `./styles.css`, `./canvas-typography.css`, `./fonts.css`, `./fonts.manifest.json`, `./runner`, `./convert`.
- **Font tiers:** panel chrome in package; starter preview pack at package root `fonts/` ([ADR-0005](./docs/adr/0005-font-tiers-and-starter-pack.md) · [FONT_MANAGEMENT](./migration-refactor/FONT_MANAGEMENT.md)).
- `productionEnabled: false` default.
- v2 `attach({ init, defaults })` API compat for one major ([ADR-0008](./docs/adr/0008-v2-attach-shim.md)).

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
- [ ] Live tween + ScrollTrigger updates without re-split.
- [ ] Live typography preview while panel open; rebuild on commit when typography changed.
- [ ] SplitText / target changes rebuild on commit (smart — skip when only live fields changed).
- [ ] Multi-instance switch without cross-contamination.
- [ ] Copy code runs in production with panel removed.
- [ ] Overlap warning when spaghetti + runner compete.
- [ ] Copy code ↔ convert round-trip stable within major version.

---

## 20. References

### Product & migration

| Doc | Path |
|-----|------|
| **This PRD** | `./PLAYGROUND_V3_PRD.md` |
| Refactor plan | `./migration-refactor/v3-refactor-plan.md` |
| **Issue queue** | `./issues/QUEUE.md` |
| v2 extraction map | `./migration-refactor/V2_EXTRACTION_MAP.md` |
| Glossary | `./CONTEXT.md` |
| Acceptance tests | `./ACCEPTANCE_TESTS.md` |
| Package contract | `./PLUGIN_MIGRATION.md` |

### UI & CSS

| Doc | Path |
|-----|------|
| UI standards (v3) | `./migration-refactor/INTERFACE_RULES.md` |
| Component + token audit | `./migration-refactor/COMPONENT_AUDIT.md` |
| UI maintenance guide | `./migration-refactor/UI_MAINTENANCE.md` |
| Fonts (tiers) | `./migration-refactor/FONT_MANAGEMENT.md` |
| Canvas typography | `./migration-refactor/CANVAS_TYPOGRAPHY.md` |
| Adding fonts (user) | `./migration-refactor/ADDING_FONTS.md` |

### ADRs (locked decisions)

| ADR | Topic |
|-----|-------|
| [0001](./docs/adr/0001-instance-manager-owns-session-state.md) | InstanceManager owns session state |
| [0002](./docs/adr/0002-smart-rebuild-and-live-typography.md) | Smart commit + live typography |
| [0003](./docs/adr/0003-shared-canonical-template.md) | Shared `canonical/` for Copy code + convert |
| [0004](./docs/adr/0004-tt-css-prefix-and-bem.md) | `tt-` CSS prefix + BEM |
| [0005](./docs/adr/0005-font-tiers-and-starter-pack.md) | Font tiers + root `fonts/` |
| [0006](./docs/adr/0006-import-in-dock.md) | Import in dock drawer |
| [0007](./docs/adr/0007-esm-only-build.md) | ESM only |
| [0008](./docs/adr/0008-v2-attach-shim.md) | v2 `attach({ init })` shim |
| [0009](./docs/adr/0009-js-with-dts.md) | JS + `.d.ts` |

### v2 reference (removed)

Legacy playground-v2 lived under `split-text/playground-v2/` (removed from repo). Implementation and demo are in `text-tuner/`. Prior v2 sources remain in git history.

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
| 12 | Instance state | InstanceManager in `attach.js` — panel is view only (ADR-0001) |
| 13 | Commit | Smart rebuild — re-split only when typography / SplitText / targets change (ADR-0002) |
| 14 | Typography UX | Live CSS preview while open; commit fixes mask geometry (ADR-0002) |
| 15 | Copy code / Import | Shared `canonical/` module (ADR-0003) |
| 16 | CSS | `tt-` BEM, layered styles, `#text-tuner-panel` scope (ADR-0004) |
| 17 | Fonts | Panel Geist + root `fonts/` starter pack (ADR-0005) |
| 18 | Import UI | Dock segment + drawer above dock (ADR-0006) |
| 19 | Build | ESM only (ADR-0007) |
| 20 | Types | JSDoc + published `.d.ts` (ADR-0009) |
