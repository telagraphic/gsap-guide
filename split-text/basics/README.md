# Basics

Headline and body-copy SplitText demos. Six full-viewport frames per page.

| File | URL (with `split-text/serve.sh`) |
|------|----------------------------------|
| `index.html` | `/basics/index.html` — headlines, word splits |
| `body.html` | `/basics/body.html` — paragraphs, mixed split types |

## Playground

Both pages include the dev-only playground. **Shift+C** opens typography controls; **Copy CSS** exports settings.

Remove all `<!-- DEV ONLY: split-text-playground -->` blocks before copying animation code to another project.

## Split types (fixed in JS)

| Frame | Headlines (`script.js`) | Body (`body.js`) |
|-------|-------------------------|------------------|
| 2 | words + mask | words + mask |
| 3 | words | words |
| 4 | words | chars + words |
| 5 | words | lines |
| 6 | words + mask | words/lines + line mask |

Tune typography in the panel; change split behavior by editing the demo script.

## Docs

- `SPLITTEXT_GUIDE.md`
- `EDGE_CASES.md`
