# Playgrounds

User and client test sandboxes for Text Tuner. Each subfolder is an isolated dev project — separate from the npm package and from maintainer regression demos.

## Why this folder exists

| Location | Purpose |
|----------|------|
| [`text-tuner/examples/`](../text-tuner/examples/) | **Package maintainer** — regression demo (`sample-playground`), full font library for QA |
| **`playgrounds/`** (here) | **Your work** — client pages, experiments, pre-ship tuning sessions |
| [`text-tuner/`](../text-tuner/) | The library — panel, runner, convert, fonts starter pack |

Do not put user HTML/CSS/JS in `text-tuner/examples/`. That folder is served by `npm run demo` from the package root and imports package source directly.

## Quick start — new playground

```bash
# 1. Create a folder
mkdir -p playgrounds/my-project
cd playgrounds/my-project

# 2. Init and link the local package (until npm publish)
npm init -y
npm install ../../text-tuner gsap

# 3. Copy the starter font pack
cp -R node_modules/text-tuner/fonts ./fonts
cp node_modules/text-tuner/fonts.css ./fonts.css
cp node_modules/text-tuner/fonts.manifest.json ./fonts.manifest.json

# 4. Scaffold files — see playgrounds/_template/README.md

# 5. Serve from the playground root (not text-tuner/)
npx --yes serve . -p 3001
```

Open `http://localhost:3001/` and press **⌘K** for the panel.

## Full guide

See [text-tuner/docs/PLAYGROUNDS.md](../text-tuner/docs/PLAYGROUNDS.md) for:

- Scaffolding a new playground step by step
- Wiring an **existing** HTML/CSS/JS codebase (Tier 0, Import, define)
- Local dev vs future npm consumer workflow
- Pre-plugin cleanup checklist

## Naming

Use descriptive folder names: `playgrounds/acme-hero/`, `playgrounds/portfolio-2025/`. One page (or one site slice) per folder keeps session storage and git history clean.

## Reference implementation

The maintainer demo at [`text-tuner/examples/sample-playground/`](../text-tuner/examples/sample-playground/) shows four onboarding workflows. Copy patterns from there, but import from `"text-tuner"` (npm) — not `../../src/`.
