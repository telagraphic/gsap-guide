# Split Text Playground — Refactor Plan

Branch: `split-text-playground`  
Status: Implemented (v1) — see checkboxes below

This document defines how we reorganize `split-text-basics/` into a reusable **split-text playground plugin** plus a growing library of animation demos under `split-text/`.

---

## Goals

1. **One playground plugin** (`split-text-playground/`) injectable on any demo page for live typography tuning.
2. **Demos stay self-contained** — each animation folder owns its HTML, layout CSS, and GSAP/SplitText logic (including split `type`, masks, etc.).
3. **No duplicated demo markup** in the playground — remove `<main>` from old `controls.html`; demos provide their own frames.
4. **Fonts live with the plugin** — single canonical `fonts/` + generated `fonts.css`.
5. **Dev-server friendly** — serve from `split-text/`, with an index page linking to all demos.
6. **Export workflow** — “Copy settings” copies current typography as CSS for pasting into a demo’s `styles.css` before shipping animation code elsewhere.

---

## Target directory structure

```text
gsap-guide/
  split-text/
    REFACTOR_PLAN.md          ← this file
    README.md                 ← how to run server, attach playground, conventions
    index.html                ← links to each demo (dev navigation)
    serve.sh                  ← serve from split-text/ (required for relative paths)

    split-text-playground/
      split-text-playground.js   ← panel inject, attach API, debounced rebuild, copy CSS
      split-text-playground.css  ← panel UI only
      fonts.css                    ← generated (@font-face)
      fonts/                       ← all font files (moved from basics)
      generate-fonts.mjs           ← outputs fonts.css from fonts/
      README.md                    ← plugin API, teardown checklist, host requirements

    basics/                       ← migrated from split-text-basics/
      index.html                  ← headline frames (no playground markup duplicate)
      body.html
      styles.css
      body.css
      script.js                   ← init/teardown; split type fixed per demo
      body.js
      SPLITTEXT_GUIDE.md
      EDGE_CASES.md
      …

    waterfall-clip/               ← future
      index.html
      styles.css
      script.js

    wide-lines/                   ← future
      …
```

### Naming convention

| Item | Name |
|------|------|
| Plugin JS | `split-text-playground.js` |
| Plugin CSS | `split-text-playground.css` |
| Global API | `window.SplitTextPlayground` |
| Top-level collection | `split-text/` |
| First migrated demo | `split-text/basics/` |

---

## Decisions (confirmed)

| # | Decision |
|---|----------|
| 1 | Document server root and URLs in `split-text/README.md`. |
| 2 | **Remove split type** from the control panel; each demo’s `script.js` owns `type`, `mask`, `autoSplit`, etc. |
| 3 | Demos must map playground CSS variables on split targets (see [Typography contract](#typography-contract)). |
| 4 | Move playground code + fonts into `split-text-playground/` (from `controls.js`, `controls.css`, `controls.html` panel, font pipeline). |
| 5 | Document teardown/init contract in `split-text-playground/README.md`. |
| 6 | Document ScrollTrigger scoping for reusable modules — **v2 note**, not v1 (see [Future: multiple registrations](#future-multiple-registrations-on-one-page)). |
| 7 | **Copy settings** button exports current values as a CSS snippet (clipboard). |
| 8 | Tag dev-only playground `<script>` / `<link>` with HTML comments for easy grep before copying animation elsewhere. |
| 9 | Top-level `split-text/` with `basics/` child; drop `split-text-basics` path after migration. |
| 10 | Host page loads GSAP + SplitText + ScrollTrigger (plugin does not bundle GSAP). |
| 11 | Panel markup **injected from JS** (no separate `controls.html` page required). |
| 12 | Multiple `register()` calls per page — **document only**, not v1. |
| 13 | Fonts only under `split-text-playground/fonts/`. |
| 14 | `prefers-reduced-motion` — out of scope for playground v1. |

---

## Running the dev server

**Always serve from `split-text/`** so relative paths resolve for every demo and the plugin:

```bash
cd split-text
./serve.sh          # or: python3 -m http.server 8000
```

| URL | Purpose |
|-----|---------|
| `http://localhost:8000/` | Index — links to all demos |
| `http://localhost:8000/basics/` | Basics headline + body pages |
| `http://localhost:8000/basics/index.html` | Headline frames |
| `http://localhost:8000/basics/body.html` | Body copy frames |

**Do not** serve from `basics/` or `split-text-playground/` alone — `../split-text-playground/fonts.css` will break.

`serve.sh` should print the index URL and each registered demo path on start.

---

## Plugin API (v1)

### Host requirements

Each demo `index.html` (or `body.html`) includes:

```html
<!-- GSAP (required — not bundled in plugin) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>

<!-- Playground fonts -->
<link rel="stylesheet" href="../split-text-playground/fonts.css" />

<!-- DEV ONLY — remove before copying animation to another project -->
<link rel="stylesheet" href="../split-text-playground/split-text-playground.css" />
<script src="../split-text-playground/split-text-playground.js"></script>
<script>
  SplitTextPlayground.attach({
    init: initMyDemo,           // (settings) => teardownFn
    targets: ".split-target",   // selector(s) receiving typography CSS vars
    storageKey: "basics-headlines",
    defaults: { fontVar: "--font-giest", fontSize: 4, lineHeight: 1.05, … },
  });
</script>

<script src="script.js" defer></script>
```

### `SplitTextPlayground.attach(options)`

| Option | Type | Description |
|--------|------|-------------|
| `init` | `(settings) => () => void` | Build SplitText + ScrollTrigger; return teardown. |
| `targets` | `string` | Selector for elements that consume `--playground-*` vars. |
| `storageKey` | `string` | `sessionStorage` key for typography settings. |
| `defaults` | `object` | Initial font/size/line-height/letter-spacing/align/transform. |

**Not in v1 panel:** `splitType` — lives only in demo `script.js`.

### `settings` passed to `init` (typography only)

```ts
{
  fontVar: string;      // e.g. "--font-giest"
  fontSize: number;     // rem
  lineHeight: number;   // unitless
  letterSpacing: number; // em
  textAlign: string;
  textTransform: string;
}
```

### Production entry in demo `script.js`

```js
function initMyDemo(settings) {
  const splits = [];
  // SplitText.create({ type: "words", … }) — type is fixed here, not from panel
  return function teardown() {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.killTweensOf(".split-target, .split-target *");
    splits.forEach((s) => {
      if (s?.revert) s.revert();
      if (s?.kill) s.kill();
    });
  };
}

if (!window.SplitTextPlayground?.isActive()) {
  document.fonts.ready.then(() => initMyDemo());
}
```

---

## Typography contract

Demos **must** wire split targets to playground variables or tuning will not appear on screen.

### Plugin sets on `:root`

```css
--font-sans-serif: var(--font-giest);   /* from font dropdown */
--playground-font-size: 4rem;
--playground-line-height: 1.05;
--playground-letter-spacing: -0.02em;
--playground-text-align: center;
--playground-text-transform: uppercase;
```

### Demo `styles.css` (example)

```css
.split-target,
.split-target * {
  font-family: var(--font-sans-serif);
  font-size: var(--playground-font-size);
  line-height: var(--playground-line-height);
  letter-spacing: var(--playground-letter-spacing);
  text-align: var(--playground-text-align);
  text-transform: var(--playground-text-transform);
}
```

Use a shared class (e.g. `.split-target` or `.frame__headline` / `.frame__copy`) on every `[data-split]` element. Mask/line descendants inherit metrics when listed in the selector.

---

## Control panel (v1)

| Control | Persists | Triggers rebuild |
|---------|----------|------------------|
| Font family | ✓ | ✓ (debounced) |
| Font size | ✓ | ✓ |
| Line height | ✓ | ✓ |
| Letter spacing | ✓ | ✓ |
| Text align | ✓ | ✓ |
| Text transform | ✓ | ✓ |
| **Copy settings** | — | Copies CSS to clipboard |
| ~~Split type~~ | — | **Removed** — per-demo only |

**Keyboard:** `Shift+C` toggles panel (unchanged).

**Events:** `<select>` → `change` only; `<input type="range">` → `input` only (no duplicate rebuilds).

**Rebuild flow:** Do **not** apply typography to live split DOM before teardown; apply vars inside `waitForFonts` after teardown, then call `init(settings)`.

---

## Copy settings button

Adds a control (e.g. **COPY CSS**) that writes to clipboard:

```css
:root {
  --font-sans-serif: var(--font-editorial-new);
  --playground-font-size: 3.5rem;
  --playground-line-height: 1.1;
  --playground-letter-spacing: -0.03em;
  --playground-text-align: center;
  --playground-text-transform: uppercase;
}
```

Optional second line in UI: “Paste into your demo `styles.css`”.

Implementation: `navigator.clipboard.writeText(exportCss(settings))` with brief “Copied” feedback.

---

## Teardown / init checklist

Document in `split-text-playground/README.md`. Every demo `init` return value must:

1. Kill all ScrollTriggers created by that demo (v1: `ScrollTrigger.getAll()` acceptable when one demo per page).
2. `gsap.killTweensOf()` on split targets and descendants.
3. `split.revert()` for each SplitText instance.
4. Call `split.kill()` **only if** `typeof split.kill === "function"` (GSAP 3.13 SplitText may not expose `kill`).
5. Never throw during teardown — playground rebuild depends on it.

Playground then: `ScrollTrigger.refresh(true)` + `update()` after double `requestAnimationFrame`.

---

## Future: multiple registrations on one page

**Not v1.** Document for later:

- `SplitTextPlayground.register({ id, init, targets, defaults })` × N
- Panel switches active registration or applies shared typography
- ScrollTrigger cleanup scoped by `id` / `scrollTrigger.vars.id` instead of `getAll()`

Typical v1 page: **stack of frames**, one `attach()`, one `script.js` driving all frames.

---

## Migration map: `split-text-basics` → `split-text/`

| From | To |
|------|-----|
| `split-text-basics/` (root files) | `split-text/basics/` |
| `split-text-basics/fonts/` | `split-text/split-text-playground/fonts/` |
| `split-text-basics/fonts.css` | `split-text/split-text-playground/fonts.css` |
| `split-text-basics/generate-fonts.mjs` | `split-text/split-text-playground/generate-fonts.mjs` (update paths) |
| `split-text-basics/controls.js` | `split-text/split-text-playground/split-text-playground.js` (refactor) |
| `split-text-basics/controls.css` | `split-text/split-text-playground/split-text-playground.css` |
| `split-text-basics/controls.html` | **Delete** `<main>`; optional redirect or remove file |
| `split-text-basics/serve.sh` | `split-text/serve.sh` |
| `split-text-basics/README.md` | Split: `split-text/README.md` + update `basics/` notes |

### Remove from plugin / panel

- `splitType` control and `settings.splitType` in rebuild
- `window.initSplitTextDemos` global coupling — replace with `attach({ init })`
- Debug instrumentation (`debugLog`, `#region agent log`) after verification
- `controls.html` duplicate frame markup

### Refactor `basics/script.js` and `basics/body.js`

- Export `initBasicsHeadlines(settings)` / `initBasicsBody(settings)` with teardown
- Remove `splitType` parameter from playground path; hardcode per-frame `type` in source
- Gate production: `SplitTextPlayground.isActive()`

### `basics/index.html` + `body.html`

- Add playground links/scripts (DEV ONLY comments)
- Add typography contract to `styles.css` / `body.css`
- Class `split-target` on `[data-split]` elements (or document existing class)

---

## Index page (`split-text/index.html`)

Simple static list for dev navigation:

- **Basics — Headlines** → `basics/index.html`
- **Basics — Body copy** → `basics/body.html`
- *(future)* Waterfall clip → `waterfall-clip/`
- *(future)* Wide lines → `wide-lines/`

Style minimally (system font) — no dependency on playground.

---

## Implementation phases

### Phase 0 — Scaffold (this branch)

- [x] `REFACTOR_PLAN.md` (this file)
- [x] `split-text/README.md` (server + conventions)
- [x] `split-text/index.html`
- [x] `split-text/serve.sh`

### Phase 1 — Playground package

- [x] Create `split-text/split-text-playground/`
- [x] Move `fonts/` + update `generate-fonts.mjs` paths
- [x] Rename/refactor `controls.js` → `split-text-playground.js`
  - [x] `SplitTextPlayground.attach()`
  - [x] Inject panel HTML
  - [x] Remove split type UI + logic
  - [x] Copy settings button
  - [x] Remove debug instrumentation
- [x] Rename `controls.css` → `split-text-playground.css`
- [x] `split-text-playground/README.md` (API + teardown + host tags)

### Phase 2 — Migrate basics

- [x] `git mv split-text-basics split-text/basics`
- [x] Update all internal links and font CSS paths
- [x] Refactor `script.js` / `body.js` to init/teardown + attach
- [x] Update `styles.css` / `body.css` typography contract
- [x] Wire `index.html` / `body.html` with DEV ONLY playground includes
- [x] Delete `controls.html` / `controls.js` / `controls.css`

### Phase 3 — Verify

- [ ] Serve from `split-text/`, open index, test both basics pages
- [ ] Change font family → scroll scrub still works
- [ ] Copy settings → valid CSS on clipboard
- [ ] Update root/repo references to old `split-text-basics` paths

### Phase 4 — Cleanup

- [x] Remove empty `split-text-basics/` if anything left at old path
- [ ] Update `.cursor/skills` or docs that reference old paths
- [ ] Optional: `.debug-runner` repro path update

---

## DEV ONLY comment standard

Use this exact prefix on playground includes so grep catches them:

```html
<!-- DEV ONLY: split-text-playground — remove when copying animation elsewhere -->
```

```html
<!-- /DEV ONLY -->
```

---

## Open questions (resolve during Phase 1–2)

1. **Single attach per HTML file** — `index.html` and `body.html` each get their own `storageKey` and `init` fn, or one combined basics playground page?
   - **Recommendation:** separate attach per page (`basics-headlines`, `basics-body`) — matches separate `script.js` / `body.js`.
2. **Keep `index.html` (old starter)** in basics or merge into one headlines page?
   - **Recommendation:** keep `basics/index.html` as headline lab; drop duplicate `controls.html`.
3. **Query flag** `?playground=0` to disable panel without editing HTML — defer unless needed.

---

## Success criteria

- [ ] One command serves all demos from `split-text/`
- [ ] Index links work for every shipped demo
- [ ] Playground attaches without duplicate `<main>` markup
- [ ] Font change rebuilds animations without manual reload
- [ ] Copy settings produces paste-ready `:root` CSS
- [ ] No `splitType` in panel; basics demos still split correctly via their own JS
- [ ] Teardown checklist documented and followed in both `script.js` and `body.js`

---

## References

- Current working rebuild fix: teardown must not call `split.kill()` unless it exists; typography applies after teardown, not on `requestRebuild`.
- `EDGE_CASES.md` → move to `basics/EDGE_CASES.md` (line metrics, masks).
- `SPLITTEXT_GUIDE.md` → `basics/SPLITTEXT_GUIDE.md`.
