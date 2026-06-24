# Adding preview fonts to your project

How to use the Text Tuner starter pack, add families, and wire them into the typography tab.

**Package maintainers:** see [FONT_MANAGEMENT.md](./FONT_MANAGEMENT.md) for tier boundaries and npm layout.

---

## One folder convention

Tiers **2 (starter)** and **4 (your project)** use the same shape — a **`fonts/` folder at the project root**:

```
your-project/
├── fonts/                  # font binaries (you own this)
│   ├── fh-enso/
│   ├── editorial-new/
│   └── my-brand/           # families you add
├── fonts.css               # generated — @font-face + --font-* vars
├── fonts.manifest.json     # generated — typography dropdown list
├── index.html
└── script.js
```

Panel chrome (Geist for the sidebar UI) lives **inside the npm package** (`text-tuner/styles/`) — not in your `fonts/` folder.

---

## First-time setup

### 1. Install

```bash
npm install text-tuner gsap
# + Club SplitText per GSAP docs
```

### 2. Copy the starter pack to your project root

```bash
cp -R node_modules/text-tuner/fonts ./fonts
cp node_modules/text-tuner/fonts.css ./fonts.css
cp node_modules/text-tuner/fonts.manifest.json ./fonts.manifest.json
```

The package ships a curated starter set (~6 families) in `node_modules/text-tuner/fonts/`. Copy once — then treat `./fonts` as yours.

### 3. Link CSS in your dev HTML

```html
<link rel="stylesheet" href="./fonts.css" />
<link rel="stylesheet" href="node_modules/text-tuner/styles.css" />
```

### 4. Attach Text Tuner

```javascript
import { discover, attach } from "text-tuner";

discover();
attach({
  activeId: "hero-lines",
  fontsManifest: "./fonts.manifest.json", // optional if default path works
});
```

If `fonts.manifest.json` sits at the project root, `attach()` can default to `./fonts.manifest.json` in dev.

---

## Adding a new font family

### Step 1 — Create a folder

Folder name becomes the **slug** and CSS variable name:

```
fonts/
  my-brand/          →  --font-my-brand
```

**Rules:**

- Kebab-case slug: `my-brand`, `fh-enso`, `editorial-new`
- One folder per family
- Only static font files (no variable fonts with `[wght]` in the filename)

### Step 2 — Add font files

Drop `.woff2` (preferred), `.woff`, `.otf`, or `.ttf` into the folder.

**Filename tips** (used by the generator for weight/style):

| Filename contains | Weight |
|-------------------|--------|
| `thin` | 100 |
| `light` | 300 |
| `regular`, `book` | 400 |
| `medium` | 500 |
| `semibold` | 600 |
| `bold` | 700 |
| `black` | 900 |
| `italic` | italic style |

**Example:**

```
fonts/my-brand/
  MyBrand-Regular.woff2
  MyBrand-Bold.woff2
  MyBrand-Italic.woff2
```

**License:** You are responsible for font licensing in your project. Starter pack fonts are for **dev/tuning only** — confirm terms before shipping to production.

### Step 3 — Regenerate CSS + manifest

From your project root:

```bash
npx text-tuner fonts generate
```

Defaults (no flags needed when run at project root):

| Output | Path |
|--------|------|
| CSS | `./fonts.css` |
| Manifest | `./fonts.manifest.json` |
| Scans | `./fonts/` |

Custom paths:

```bash
npx text-tuner fonts generate \
  --dir ./fonts \
  --out-css ./fonts.css \
  --out-manifest ./fonts.manifest.json
```

### Step 4 — Reload the dev page

- Typography tab dropdown includes the new family automatically (reads manifest).
- Pick it, tune size/line-height — live preview applies via `--font-sans-serif: var(--font-my-brand)` on your `[data-playground]` element.
- **Commit** (close panel or switch instance) re-splits text if typography changed.

No manual edits to Text Tuner source code required.

---

## What the generator produces

### `fonts.css`

```css
@font-face {
  font-family: "My Brand";
  src: url("fonts/my-brand/MyBrand-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-my-brand: "My Brand", sans-serif;
  --font-fh-enso: "FH Enso", sans-serif;
  /* …one --font-{slug} per folder… */
}
```

Paths are relative to `fonts.css` location — keep `fonts.css` at project root next to `fonts/`.

### `fonts.manifest.json`

```json
{
  "version": 1,
  "families": [
    {
      "slug": "my-brand",
      "label": "My Brand",
      "cssVar": "--font-my-brand",
      "family": "My Brand"
    }
  ]
}
```

The typography dropdown reads this file at `attach()` time.

---

## Checklist — is everything wired?

| Step | Done? |
|------|-------|
| `fonts/my-family/*.woff2` exists | |
| Ran `npx text-tuner fonts generate` | |
| `fonts.css` linked in dev HTML | |
| `fonts.manifest.json` exists at path passed to `attach()` | |
| Dev page reloaded | |
| New family appears in Typography tab | |

If the family is in the dropdown but text looks wrong: hard-refresh, check browser network tab for 404 on woff2 paths, confirm `font-family` in `@font-face` matches the manifest.

---

## Production

Text Tuner is dev-only. For production:

1. **Copy code** from the dock → paste into `script.js`.
2. **Copy CSS** from the dock → includes `--font-sans-serif: var(--font-my-brand)` etc.
3. Copy only the `@font-face` rules you need from `fonts.css` into your production stylesheet (or subset with a font tool).
4. Remove `data-playground`, panel scripts, and `fonts.manifest.json` from production HTML.

Do not ship the entire trial library — only families you licensed for production.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Family missing from dropdown | Forgot to run `fonts generate`; or `attach()` points at wrong manifest path |
| Tofu / fallback font | `fonts.css` not linked; or woff2 path 404 |
| Dropdown works, masks look wrong after font change | Live preview limitation — **commit** to re-split lines |
| Generator skips a file | Filename has spaces, special chars, or `[wght]` variable axis |
| `--font-*` undefined warning in console | `typography.fontVar` in config references a family not in your `fonts/` folder |

---

## Quick reference

```bash
# First time
cp -R node_modules/text-tuner/fonts ./fonts
cp node_modules/text-tuner/fonts.css ./fonts.css
cp node_modules/text-tuner/fonts.manifest.json ./fonts.manifest.json

# After adding fonts/my-new-family/
npx text-tuner fonts generate
```

```html
<link rel="stylesheet" href="./fonts.css" />
```

```javascript
attach({ fontsManifest: "./fonts.manifest.json" });
```
