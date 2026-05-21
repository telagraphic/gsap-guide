# About

A basic overview to SplitText & ScrollTrigger.

Fonts live in `../fonts/` (symlinked as `fonts/`). Run the generator after adding or renaming font files.

## Font naming rules

Only include files whose names are **ASCII-safe**: letters, digits, dots, underscores, hyphens (e.g. `Geist-Regular.woff2`).

**Excluded automatically** (and should be removed from disk if present):

- Variable-axis names: `Geist[wght].woff2`, `GeistMono-Italic[wght].woff2`, etc.
- Spaces, Unicode, or other special characters in filenames

Use static weight/style files instead of `[wght]` variable fonts for reliable loading with `python3 -m http.server`.

## Regenerate `fonts.css`

```bash
node generate-fonts.mjs
```

## Docs

| File | Notes |
|------|--------|
| `SPLITTEXT_GUIDE.md` | SplitText API and patterns |
| `EDGE_CASES.md` | Line-mask clipping, font metrics (ink vs line box), CSS mitigations |

## Pages

| File | Script | Notes |
|------|--------|--------|
| `index.html` | `script.js` | Starter / headline experiments |
| `controls.html` | `controls.js` | Headline playground + `Shift+C` typography/split panel |
| `body.html` | `body.js` | Paragraph copy, frames 2–6 demos |

## Start dev server

**Must** run from this directory so `fonts/` resolves correctly:

```bash
cd split-text-basics
python3 -m http.server 8000
# http://localhost:8000/            → index.html
# http://localhost:8000/controls.html → playground controls (Shift+C)
# http://localhost:8000/body.html   → body copy demos
```

Or use the helper script from the repo root:

```bash
./split-text-basics/serve.sh
```
