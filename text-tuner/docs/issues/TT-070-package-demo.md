---
id: TT-070
title: Package exports and demo migration
phase: 7
status: done
blocked_by:
  - TT-063
tests:
  - npm test
acceptance_tests:
  - AT-001
  - AT-005
---

## What to build

Production package boundary: full `package.json` exports per PLUGIN_MIGRATION and ADR-0007/0009. Move sample-playground to `text-tuner/examples/`. Slim demo script to discover/define/attach imports only.

## Acceptance criteria

- [ ] ESM exports: main, `./styles.css`, `./fonts.css`, `./fonts.manifest.json`, `./runner`, `./convert`
- [ ] No UMD / `window.TextTuner`
- [ ] `.d.ts` for public API
- [ ] Demo runs from `text-tuner/examples/sample-playground/`
- [ ] Cold start + v2 compat verified on new demo path

## Blocked by

- TT-063

## Tests

```bash
cd text-tuner && npm test
```

Manual AT-001, AT-005 on migrated demo.
