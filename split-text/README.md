# Split text animations

Reference demos and a dev-only **Split Text Playground** for tuning typography against live GSAP SplitText + ScrollTrigger setups.

## Run the dev server

**Always serve from this directory** (`split-text/`) so font and playground paths resolve:

```bash
cd split-text
./serve.sh
# default http://localhost:8000/
```

| URL | Page |
|-----|------|
| `/` | Demo index |
| `/basics/index.html` | Headline frames |
| `/basics/body.html` | Body copy frames |

Press **Shift+C** on a demo page to toggle the playground panel. Use **Copy CSS** to export `:root` variables into a demo’s stylesheet.

## Layout

```text
split-text/
  index.html                 ← demo links
  serve.sh
  split-text-playground/     ← plugin + fonts (see split-text-playground/README.md)
  basics/                    ← first demo pack
  waterfall-clip/            ← (future)
```

## Adding a new animation folder

1. Create `your-demo/index.html`, `styles.css`, `script.js`.
2. Link fonts: `../split-text-playground/fonts.css`
3. Add `.split-target` on split elements and map `--playground-*` vars in CSS (see `basics/styles.css`).
4. Export `initYourDemo(settings)` returning a `teardown` function (see teardown checklist in `split-text-playground/README.md`).
5. Optionally include the playground (DEV ONLY blocks in `basics/index.html`).
6. Add a link on `split-text/index.html`.

Split `type`, masks, and `autoSplit` are defined in **your** `script.js` — not in the playground panel.

## Fonts

Font binaries live in `split-text-playground/fonts/` (required — `fonts.css` URLs are relative to that folder). Regenerate `fonts.css` after adding files:

```bash
cd split-text-playground
node generate-fonts.mjs
```

See `split-text-playground/README.md` for filename rules.

## Docs (basics)

| File | Notes |
|------|--------|
| `basics/SPLITTEXT_GUIDE.md` | SplitText API and patterns |
| `basics/EDGE_CASES.md` | Line masks, font metrics |
| `REFACTOR_PLAN.md` | Migration notes |

## Copying an animation elsewhere

Remove all blocks marked:

```html
<!-- DEV ONLY: split-text-playground — remove when copying animation elsewhere -->
```

Paste typography from the playground **Copy CSS** button into your project CSS. Keep GSAP CDN (or your bundle) in the target project.
