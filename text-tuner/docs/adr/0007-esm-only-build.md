# ESM-only package build for v3.0

text-tuner v3.0 ships **ESM only** via `package.json` `exports`. Consumers use `import { discover, define, attach } from 'text-tuner'` and `import 'text-tuner/styles.css'`. Demo pages use `<script type="module">`.

No UMD / IIFE / `window.TextTuner` build in v3.0. v2 script-tag pattern (`SplitTextPlaygroundV2`) is not replicated as a global bundle.

Subpath exports: `.`, `./styles.css`, `./fonts.css`, `./fonts.manifest.json`, `./runner`, `./convert`.

**Rejected:** Dual ESM + UMD build for v2 parity; global `window.TextTuner` attach.
