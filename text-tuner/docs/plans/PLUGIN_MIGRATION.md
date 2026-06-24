# Plugin migration checklist — v2 project → npm text-tuner

Guide for refactoring the current `playground-v2` setup into a publishable npm package with a stable, extensible API.

---

## 1. Code considerations for npm consumers

### 1.1 Peer dependencies (required)

Consumers must install and load these **before** text-tuner:

| Package | Notes |
|---------|--------|
| `gsap` | ≥ 3.13 recommended |
| `@gsap/shockingly` or Club SplitText | Document Club license; SplitText is not in free GSAP |
| ScrollTrigger | Bundled with GSAP or separate plugin registration |

```json
{
  "peerDependencies": {
    "gsap": ">=3.12.0"
  },
  "peerDependenciesMeta": {
    "gsap": { "optional": false }
  }
}
```

**Do not bundle GSAP** into the package. Peer-only keeps bundle size and licensing clear.

### 1.2 Dev-only guarantee

| Requirement | Implementation |
|-------------|----------------|
| No production panel | `productionEnabled: false` default; tree-shake or `import 'text-tuner/dev'` |
| CSS not in prod bundle | Separate exports: `text-tuner/styles.css`, `text-tuner/canvas-typography.css` |
| Runner optional in prod | Consumers paste **Copy code**; runner not required on production pages |

Document: importing the panel in production throws or no-ops with a console warning.

### 1.3 Module formats

| Format | Use case |
|--------|----------|
| **ESM** (v3.0 only) | `import { discover, define, attach } from 'text-tuner'` — Vite, webpack, `<script type="module">` |
| **CSS** | `import 'text-tuner/styles.css'` |

v2 was script-tag / IIFE (`SplitTextPlaygroundV2`). v3.0 does **not** ship UMD. See [ADR-0007](./docs/adr/0007-esm-only-build.md).

### 1.4 Global vs named exports

**Avoid** requiring `window.SplitTextPlaygroundV2` in consumer code.

```javascript
// Consumer (target)
import { discover, define, attach, createSplitScrollRunner, convert } from 'text-tuner';
```

Demos: `<script type="module" src="./main.js">`. No `window.TextTuner` global in v3.0.

### 1.5 GSAP plugin registration

Runner calls `gsap.registerPlugin(SplitText, ScrollTrigger)` once. Document that consumers must have SplitText loaded; duplicate registration is safe in GSAP 3.

### 1.6 Side effects

- Panel injects DOM (`<aside id="text-tuner-panel">`).
- Adds body classes (`text-tuner-active`, `text-tuner-panel-open`).
- Uses `sessionStorage`.

No side effects on `import` — only after `attach()`.

### 1.7 Config schema versioning

```javascript
{ __schema: 'split-scroll-v1', /* … */ }
```

Package exports `SCHEMA_VERSION` and migration helpers for sessionStorage keys across releases.

### 1.8 Font / typography coupling

v2 hard-codes font list in panel. For npm:

- Accept `attach({ fonts: [...] })` override.
- Or document typography tab as optional / consumer-provided CSS vars only.

### 1.9 TypeScript (recommended for npm)

Export types:

- `SplitScrollConfig`
- `RegistryEntry`
- `AttachOptions`
- `ConvertResult`

Publish `dist/*.d.ts`.

---

## 2. Package structure (proposed)

```
text-tuner/
├── package.json
├── README.md
├── src/
│   ├── index.js              # public API
│   ├── attach.js             # panel + registry lifecycle
│   ├── discover.js
│   ├── define.js
│   ├── runner/
│   │   └── createSplitScrollAnimation.js
│   ├── convert/
│   │   ├── index.js          # shared by panel + CLI
│   │   └── parse-canonical.js
│   ├── panel/
│   │   ├── panel.js          # from playground-v2.js (split)
│   │   ├── import-tab.js
│   │   └── export.js         # copy config / copy code
│   ├── schema/
│   │   ├── defaults.js
│   │   └── scaffold.js
│   └── cli/
│       └── convert.js        # bin: text-tuner-convert
├── styles/
│   └── text-tuner.css
├── examples/
│   └── sample-playground/    # canonical demo (4 instances)
└── docs/
    ├── PLAYGROUND_V3_PRD.md
    ├── ACCEPTANCE_TESTS.md
    └── PLUGIN_MIGRATION.md
```

---

## 3. Public API surface (stable v3)

```javascript
import {
  attach,
  discover,
  define,
  createSplitScrollRunner,
  convert,
  isActive,
  SCHEMA_VERSION,
} from 'text-tuner';
import 'text-tuner/styles.css';

define({ 'hero-lines': { /* SplitScrollConfig */ } });

const registry = discover({ defaults: { /* partial */ } });

attach({
  registry,              // optional if discover() was called internally
  activeId: 'hero-lines',
  storageKey: 'my-app',
  targets: '.split-target',
  productionEnabled: false,
});

// Production — runner only, no attach
import { createSplitScrollRunner } from 'text-tuner/runner';
createSplitScrollRunner(config);
```

### Backward compatibility (v2)

```javascript
attach({
  init: setupAnimation,
  defaults: DEFAULT_CONFIG,
  storageKey: 'legacy',
});
```

Maps internally to single-entry registry. Deprecate in v4 docs, support through v3.x.

---

## 4. Migration checklist — v2 → plugin

### Phase A — Extract (no npm yet)

- [ ] Move panel UI from `playground-v2.js` → `text-tuner/src/panel/`
- [ ] Move runner from `tuner/animation.js` → `text-tuner/src/runner/`
- [ ] Move scaffold defaults → `text-tuner/src/schema/`
- [ ] Implement `discover()`, `define()`, registry `attach()` in `text-tuner/src/`
- [ ] Sample playground uses `<script type="module">`; verify cold start & v2-style `attach({ init, defaults })` shim
- [ ] Update `examples/sample-playground` to import from `../src` or local bundle
- [ ] Verify v2 tuner still works via symlink or duplicate script until cutover

### Phase B — Package boundary

- [ ] Add `package.json` with `exports` map:
  ```json
  {
    "exports": {
      ".": "./dist/index.js",
      "./styles.css": "./dist/text-tuner.css",
      "./runner": "./dist/runner.js",
      "./convert": "./dist/convert.js"
    }
  }
  ```
- [ ] Build step (esbuild / rollup): ESM only
- [ ] CSS copied to `dist/`
- [ ] `peerDependencies`: gsap
- [ ] README: install, peer deps, Club SplitText note, DEV-only

### Phase C — v3 features (per PRD)

- [ ] Instance dropdown + per-id sessionStorage
- [ ] Import tab + `convert()` module
- [ ] CLI `text-tuner-convert` (stdout only)
- [ ] Follow viewport IO toggle
- [ ] Reset instance / Reset all
- [ ] Overlap boot warning
- [ ] `isActive()` for Strategy B guards

### Phase D — Quality & release

- [ ] Run [ACCEPTANCE_TESTS.md](./ACCEPTANCE_TESTS.md) manually
- [ ] Round-trip test: Copy code → convert → Apply
- [ ] `__schema` migration test across version bump
- [ ] License file (MIT) + SplitText Club disclaimer in README
- [ ] npm publish / private registry (optional)
- [ ] Pin v2 folder; add deprecation notice in `playground-v2/README.md`

### Phase E — Consumer migration doc

- [x] Playgrounds + existing codebase intake — [docs/PLAYGROUNDS.md](./docs/PLAYGROUNDS.md), [playgrounds/](../playgrounds/)
- [ ] “Replace DEV block” one-pager for existing v2 users
- [ ] Codemod or find-replace: `SplitTextPlaygroundV2` → `TextTuner`
- [ ] Final output doc: **Copy code** = production spaghetti (unchanged contract)

---

## 5. Extension points (maintainability)

Design for future features without breaking API:

| Extension | Hook |
|-----------|------|
| Tier 2 custom factory | `registry[id].init = customFn` |
| Custom panel tabs | `attach({ plugins: [stPinTab] })` — future |
| Schema fields | `__schema` + migrations in `src/schema/migrate.js` |
| Export formats | `attach({ exporters: { copyCode, copyConfig } })` |
| Font list | `attach({ fonts })` |
| Canonical import shape | Versioned in `convert/`; bump when Copy code format changes |

Keep **Copy code output format** semver-stable within major version; breaking export shape = major bump.

---

## 6. Final code output contract (unchanged)

Consumers must understand:

| Artifact | When | Format |
|----------|------|--------|
| **Copy code** | Ship to production | Imperative `SplitText.create` + `onSplit` + `gsap.set/to` |
| **Copy config** | Persist Tier 1 in repo | `SplitScrollConfig` object for `define()` |
| **Copy CSS** | Typography vars | `:root` custom properties |

Production does **not** import text-tuner panel. Runner is dev-only unless consumer explicitly uses `createSplitScrollRunner` in prod (discouraged; prefer Copy code).

---

## 7. Environment patterns for npm users

### Vite / webpack (recommended)

```javascript
if (import.meta.env.DEV) {
  const { discover, define, attach } = await import('text-tuner');
  await import('text-tuner/styles.css');
  define({ /* … */ });
  discover();
  attach({ activeId: 'hero-lines' });
}
```

### Script tags (legacy)

```html
<script src="gsap.min.js"></script>
<script src="SplitText.min.js"></script>
<script src="text-tuner.umd.js"></script>
<link rel="stylesheet" href="text-tuner.css" />
<script type="module" src="./project.js"></script>
```

### Strategy B (shared script.js)

```javascript
import { isActive } from 'text-tuner';

if (!isActive()) {
  SplitText.create('.legacy', { /* prod spaghetti */ });
}
```

---

## 8. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Club SplitText not installed | Clear peer dep docs; fail fast in runner with message |
| Panel shipped to prod | `productionEnabled: false`; build-time strip with `import.meta.env.DEV` |
| Copy code / import drift | Single `export.js` + `convert/` share canonical template |
| Breaking config schema | `__schema` + migrate on sessionStorage load |
| v2 attach API | ESM shim: `attach({ init, defaults })` maps to single-entry InstanceManager (no global bundle) |

---

## 9. Definition of done — plugin v3.0.0

- [ ] npm install works with peer gsap + documented SplitText
- [ ] All P0 scenarios in ACCEPTANCE_TESTS pass
- [ ] Sample playground runs from package example
- [ ] v2 single-instance attach still works (compat layer)
- [ ] No panel code in production bundle when using recommended DEV import pattern
- [ ] Copy code output matches documented canonical shape
