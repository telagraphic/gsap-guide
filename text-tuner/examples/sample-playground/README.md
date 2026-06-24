# Sample playground

Local dev page for testing **text-tuner** runner, schema, panel, and registry API.

| Instance id | Workflow |
|-------------|----------|
| `section-1` | Tier 0 — `discover()` scaffold only (AT-033a: lines + line mask) |
| `imported-paragraph` | Tier 1 — simulates post–Import Apply (AT-033b) |
| `config-header` | Tier 1 — hand-written `define()` config (AT-033c: words-only title) |
| `section-4` | Tier 1 — chars split typography contract (AT-033d) |

## Run

From the **text-tuner package root** (required so `../../src` ESM imports resolve):

```bash
cd text-tuner
npm run demo
```

Open: [http://localhost:3000/examples/sample-playground/](http://localhost:3000/examples/sample-playground/)

Press **⌘K** to open the panel. Use the **instance dropdown** in the header to switch between the four demos on the page.

**Canvas typography:** demo loads `styles/canvas-typography.css` from the package — see [CANVAS_TYPOGRAPHY.md](../../migration-refactor/CANVAS_TYPOGRAPHY.md).

## Layout

```text
text-tuner/
├── fonts/                 # starter pack (npm-shipped, 6 families)
├── fonts.css              # generated preview @font-face + --font-* vars
├── fonts.manifest.json    # generated typography dropdown list
├── styles/
│   ├── text-tuner.css     # panel instrument
│   └── canvas-typography.css  # consumer canvas snippet (npm export)
├── styles/fonts/panel/    # Geist panel chrome (npm-shipped)
├── examples/fonts-full/   # full v2 library (repo only)
└── sample-playground/
    ├── define-configs.js  # Tier-1 workflow 2 + 3
    ├── index.html
    ├── styles.css
    └── script.js          # define → discover → attach
```

## Regenerate fonts

```bash
# Starter pack (package root)
npm run fonts:generate

# Full maintainer library
npm run fonts:generate:full

# Consumer project (after copying fonts/ to project root)
npx text-tuner fonts generate
```
