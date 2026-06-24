# Text Tuner examples

**Maintainer-only.** User and client sandboxes live in [`playgrounds/`](../../playgrounds/) at the repo root — see [docs/PLAYGROUNDS.md](../docs/PLAYGROUNDS.md).

## Sample playground (primary demo)

```bash
cd text-tuner
npm run demo
```

→ [sample-playground/](sample-playground/) — three workflow demos on the v3 panel.

Serve **from package root** so ESM imports (`../../src/...`) resolve.

## Full font library (maintainers)

[fonts-full/](fonts-full/) — all v2 preview families for local QA. Not shipped in npm `files`.

Regenerate:

```bash
npm run fonts:generate:full
```
