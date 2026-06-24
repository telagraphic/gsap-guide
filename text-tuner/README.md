# Text Tuner (v3)

Dev-only SplitText + ScrollTrigger tuning panel (v3). Replaces legacy playground-v2 (removed from repo; see git history).

## Quick start

```bash
cd text-tuner
npm run demo
```

Open [http://localhost:3000/examples/sample-playground/](http://localhost:3000/examples/sample-playground/) — press **⌘K** for the panel.

### Consumer project

```bash
npm install text-tuner gsap
```

```html
<link rel="stylesheet" href="./fonts.css" />
<link rel="stylesheet" href="node_modules/text-tuner/styles.css" />
```

```javascript
import { define, discover, attach } from "text-tuner";

define({ "hero-lines": { /* Tier 1 config */ } });
discover();
await attach({ storageKey: "my-project", fontsManifest: "./fonts.manifest.json" });
```

Copy the starter font pack from `node_modules/text-tuner/fonts/` — see [ADDING_FONTS.md](./migration-refactor/ADDING_FONTS.md).

## Package exports (ESM)

| Import | Path |
|--------|------|
| `text-tuner` | Main API — `define`, `discover`, `attach`, `convert`, … |
| `text-tuner/runner` | `createSplitScrollRunner` |
| `text-tuner/schema` | Config schema helpers |
| `text-tuner/convert` | Import converter |
| `text-tuner/styles.css` | Panel chrome |
| `text-tuner/fonts.css` | Starter preview fonts |
| `text-tuner/fonts.manifest.json` | Typography dropdown manifest |

CLI: `npx text-tuner fonts generate` · `npx text-tuner-convert snippet.js --id hero`

Types: `index.d.ts` (JSDoc-aligned stubs, ADR-0009).

## Documents

| Doc | Purpose |
|-----|---------|
| [PLAYGROUND_V3_PRD.md](./PLAYGROUND_V3_PRD.md) | Locked requirements |
| [issues/QUEUE.md](./issues/QUEUE.md) | Implementation queue |
| [PLUGIN_MIGRATION.md](./PLUGIN_MIGRATION.md) | npm consumer checklist |
| [ACCEPTANCE_TESTS.md](./ACCEPTANCE_TESTS.md) | Manual QA scenarios |
| [docs/adr/](./docs/adr/) | Architectural decisions |

## Status

**Implementation complete (v3 beta).** Phases 1–7 shipped in `text-tuner/`. Use the sample playground for regression; v2 folder is deprecated.
