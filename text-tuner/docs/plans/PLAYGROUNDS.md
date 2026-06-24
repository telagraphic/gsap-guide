# Playgrounds — user workspaces and pre-plugin workflow

How to use Text Tuner with real projects: scaffold a new sandbox, wire an existing codebase, and what to finish before the npm plugin ships.

**Related:** [PLAYGROUND_V3_PRD.md](../PLAYGROUND_V3_PRD.md) §9 workflows · [ADDING_FONTS.md](../migration-refactor/ADDING_FONTS.md) · [PLUGIN_MIGRATION.md](../PLUGIN_MIGRATION.md) · [CONTEXT.md](../CONTEXT.md)

---

## Folder model

```text
gsap-guide/
├── text-tuner/                 # npm package (library)
│   └── examples/               # maintainer regression + fonts-full QA
└── playgrounds/                # your sandboxes (one folder per page/site slice)
    ├── _template/              # copy to start a new session
    └── my-client/              # real user / client work
```

| Folder | Owner | Served from | Imports |
|--------|-------|-------------|---------|
| `text-tuner/examples/sample-playground/` | Maintainers | `cd text-tuner && npm run demo` | `../../src/` (package dev) |
| `playgrounds/<name>/` | You / clients | `cd playgrounds/<name> && npx serve .` | `"text-tuner"` via `node_modules` |

**Rule:** User HTML, CSS, and JS never live under `text-tuner/examples/`. That keeps the package boundary clean for eventual npm publish and avoids mixing regression fixtures with client work.

---

## Scaffolding a new playground

### 1. Create the folder

```bash
cp -R playgrounds/_template playgrounds/acme-landing
cd playgrounds/acme-landing
```

See [playgrounds/_template/README.md](../../playgrounds/_template/README.md) for the file checklist.

### 2. Install dependencies

Until the package is published to npm, link the local package:

```bash
npm init -y
npm install ../../text-tuner gsap
```

Club **SplitText** must be available to GSAP (per GSAP licensing). Load it the same way you would in any GSAP project.

### 3. Copy preview fonts

```bash
cp -R node_modules/text-tuner/fonts ./fonts
cp node_modules/text-tuner/fonts.css ./fonts.css
cp node_modules/text-tuner/fonts.manifest.json ./fonts.manifest.json
```

The typography tab reads `fonts.manifest.json`. Your `fonts/` folder is yours to extend — see [ADDING_FONTS.md](../migration-refactor/ADDING_FONTS.md).

### 4. Add markup hooks

On each text element you want to tune:

```html
<section data-playground-trigger="hero-lines">
  <h1 class="hero__title" data-playground="hero-lines">
    Your headline
  </h1>
</section>
```

- `data-playground` — instance id (required)
- `data-playground-trigger` — ScrollTrigger scroller section (optional; defaults to trigger config in panel)

### 5. Wire dev-only assets in HTML

```html
<link rel="stylesheet" href="./fonts.css" />
<link rel="stylesheet" href="node_modules/text-tuner/styles.css" />
<!-- optional split/typography contract: -->
<link rel="stylesheet" href="node_modules/text-tuner/canvas-typography.css" />
<link rel="stylesheet" href="styles.css" />
```

### 6. Boot script

```javascript
import { define, discover, attach } from "text-tuner";

define({ /* optional Tier 1 — see define-configs.js */ });
discover();

await attach({
  storageKey: "acme-landing",
  fontsManifest: "./fonts.manifest.json",
});
```

Use a **unique `storageKey` per playground folder** so sessionStorage does not collide across projects.

### 7. Serve and tune

```bash
npx --yes serve . -p 3001
```

Open the page, press **⌘K** / **Ctrl+K**, tune, then **Copy code** for production.

---

## Using with an existing codebase

When a user hands you HTML, CSS, and JS, create `playgrounds/<name>/` and drop their files in. Choose one onboarding path:

### Path A — Tier 0: cold start (no animation yet, or greenfield text)

**Best when:** markup and styles exist; no SplitText spaghetti for this target.

1. Add `data-playground` (+ optional trigger) to targets.
2. Add dev boot (`discover` + `attach`) — do not ship to production.
3. Open panel → scaffold defaults apply.
4. Tune → **Copy code** → production `script.js`.
5. Remove playground wiring and attributes from production.

### Path B — Import spaghetti (existing GSAP block)

**Best when:** production already has `SplitText.create` + `onSplit` for this selector.

1. **Remove or disable** the old block on the dev page — never run old spaghetti and the panel runner on the same target ([PRD §9 stale code rule](../PLAYGROUND_V3_PRD.md)).
2. Add `data-playground` markers.
3. Panel → **Import** → paste canonical block → Convert → **Apply**.
4. Tune → **Copy code** → **replace** (not append) the block in production `script.js`.
5. Remove playground from production; repeat for the next element on the page.

CLI equivalent:

```bash
npx text-tuner-convert snippet.js --id hero-lines --format define
```

Stdout is a `define()`-ready config object.

### Path C — Tier 1: config already known

**Best when:** configs were saved from a prior session or hand-authored.

1. Put configs in `define-configs.js`.
2. `define(CONFIGS)` before `discover()`.
3. Tune → optional **Copy config** to refresh repo → **Copy code** for production.

### Multi-instance pages

Finish one `data-playground` id (ship + remove attribute) before starting the next on the same page. Use the instance dropdown in the panel header to switch during dev.

### Bundler projects (Vite, webpack)

Gate the panel behind dev:

```javascript
if (import.meta.env.DEV) {
  const { define, discover, attach } = await import("text-tuner");
  await import("text-tuner/styles.css");
  define({ /* … */ });
  discover();
  await attach({ storageKey: "my-app", fontsManifest: "./fonts.manifest.json" });
}
```

For **Strategy B** (shared `script.js` with production spaghetti), guard legacy init with `isActive()` — see [PLUGIN_MIGRATION.md §7](../PLUGIN_MIGRATION.md).

### Canvas typography

If split types (lines / words / chars) interact with your CSS, load `text-tuner/canvas-typography.css` and follow [CANVAS_TYPOGRAPHY.md](../migration-refactor/CANVAS_TYPOGRAPHY.md).

---

## Production boundary (all paths)

| Dev only | Production |
|----------|------------|
| `attach()`, `discover()`, `define()` | **Copy code** blocks in `script.js` |
| `text-tuner/styles.css` | Omit |
| `data-playground` attributes | Remove (recommended) |
| Runner / in-memory config | Imperative SplitText + gsap |

The panel never ships to end users. See [PLAYGROUND_V3_PRD.md §15](../PLAYGROUND_V3_PRD.md).

---

## Pre-plugin checklist

Text Tuner is **v3 beta** in-repo (`private: true`). The playground workflow above works today via `npm install ../../text-tuner`. Before treating this as a published plugin, finish organization on the package side:

### Package boundary (in `text-tuner/`)

- [ ] **Publish layout** — `files` field, exports map, built `dist/` or ship `src/` as today ([ADR-0007](./adr/0007-esm-only-build.md), [ADR-0009](./adr/0009-js-with-dts.md))
- [ ] **`npm run demo`** stays maintainer-only (`examples/sample-playground`); playgrounds are never part of the published tarball
- [ ] **Font tiers** — starter pack in package; full library stays repo-only (`examples/fonts-full/`) per [ADR-0005](./adr/0005-font-tiers-and-starter-pack.md)
- [ ] **CLI** — `text-tuner fonts generate`, `text-tuner-convert` documented and tested
- [ ] **Peer deps** — `gsap` + Club SplitText disclaimer in README
- [ ] **Dev guard** — `productionEnabled: false` default; `import.meta.env.DEV` pattern documented

### Repo organization (this monorepo)

- [ ] **`playgrounds/`** — one folder per client/page; gitignore session noise if needed
- [ ] **`text-tuner/examples/`** — regression only; no user projects
- [ ] **Root README** — point to `text-tuner/` and `playgrounds/`
- [ ] **Remove / archive** stale paths after `split-text/` migration (done)

### Optional post-publish ergonomics

- [ ] `npx text-tuner init` scaffolds `playgrounds/_template` equivalent
- [ ] Vite plugin or MCP write-back ([PRD §18 deferred](../PLAYGROUND_V3_PRD.md))
- [ ] Demo site / npm README with hosted sample

### What playgrounds prove before publish

Each sandbox under `playgrounds/` is an integration test for the eventual plugin:

1. `npm install text-tuner` (or `file:` link) resolves exports
2. Font copy + manifest path works
3. Tier 0 / Import / define workflows complete on real markup
4. Copy code round-trips through `convert()` without drift
5. Production strip leaves a working page with no panel

---

## Maintainer vs user quick reference

| Task | Command / location |
|------|-------------------|
| Regression QA (4 demo instances) | `cd text-tuner && npm run demo` |
| New client / user session | `cp -R playgrounds/_template playgrounds/<name>` |
| Full font library QA | `cd text-tuner && npm run fonts:generate:full` |
| Acceptance scenarios | [ACCEPTANCE_TESTS.md](../ACCEPTANCE_TESTS.md) |
