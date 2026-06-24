# Full font library (maintainer only — not shipped in npm)

Local copy of all preview families for maintainer testing (~25 families). Lives at `examples/fonts-full/fonts/` (not a symlink).

Regenerate CSS + manifest after adding families:

```bash
cd text-tuner
npm run fonts:generate:full
```

Use in a custom demo page by linking `examples/fonts-full/fonts.css` instead of package-root `fonts.css`.
