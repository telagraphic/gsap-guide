# Playground template

Copy this folder to `playgrounds/<your-name>/` when starting a new Text Tuner session.

```bash
cp -R playgrounds/_template playgrounds/my-project
cd playgrounds/my-project
npm init -y
npm install ../../text-tuner gsap
cp -R node_modules/text-tuner/fonts ./fonts
cp node_modules/text-tuner/fonts.css ./fonts.css
cp node_modules/text-tuner/fonts.manifest.json ./fonts.manifest.json
```

Then replace the placeholder files below with your markup and styles.

## Target file layout

```
playgrounds/my-project/
├── package.json          # depends on text-tuner + gsap
├── index.html            # your markup + dev-only panel links
├── styles.css            # your canvas styles
├── script.js             # define → discover → attach
├── define-configs.js     # optional Tier 1 configs
├── fonts/                # copied starter pack (extend as needed)
├── fonts.css
└── fonts.manifest.json
```

## `index.html` checklist

- [ ] GSAP, ScrollTrigger, SplitText loaded (CDN or bundler)
- [ ] `./fonts.css` and `node_modules/text-tuner/styles.css` in `<head>`
- [ ] Optional: `node_modules/text-tuner/canvas-typography.css` if using split inherit rules — see [CANVAS_TYPOGRAPHY.md](../../text-tuner/migration-refactor/CANVAS_TYPOGRAPHY.md)
- [ ] `data-playground="id"` on each tunable text element
- [ ] Optional: `data-playground-trigger="id"` on the ScrollTrigger section wrapper
- [ ] `<script type="module" src="script.js">` at end of body

## `script.js` boot pattern

```javascript
import { define, discover, attach } from "text-tuner";
import { DEFINE_CONFIGS } from "./define-configs.js";

define(DEFINE_CONFIGS); // omit or export {} for Tier 0 only
discover();

await attach({
  storageKey: "my-project", // unique per playground folder
  fontsManifest: "./fonts.manifest.json",
});
```

## `define-configs.js`

Export an object keyed by `data-playground` id. Leave empty for cold-start-only:

```javascript
export const DEFINE_CONFIGS = {
  // "hero-lines": { /* SplitScrollConfig */ },
};
```

## Serve

From **this folder** (not `text-tuner/`):

```bash
npx --yes serve . -p 3001
```

## After tuning

1. **Copy code** from the panel → paste into production `script.js`
2. Remove `attach()` / `discover()` / `define()` from production builds
3. Remove panel CSS from production HTML
4. Remove `data-playground` attributes (recommended)

See [PLAYGROUNDS.md](../../text-tuner/docs/PLAYGROUNDS.md) for import workflow and existing-codebase intake.
