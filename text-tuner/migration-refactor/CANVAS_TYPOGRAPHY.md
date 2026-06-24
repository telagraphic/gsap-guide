# Canvas typography — SplitText contract

> **Status:** Active standard (post–Phase 8 hardening)  
> **Related:** [INTERFACE_RULES.md](./INTERFACE_RULES.md) · [ADR-0002](../docs/adr/0002-smart-rebuild-and-live-typography.md) · [ACCEPTANCE_TESTS.md](../ACCEPTANCE_TESTS.md) AT-033a–d

## Problem

The Type tab (Typography) applies `--playground-*` CSS custom properties to the active `[data-playground="id"]` element. That is necessary but **not sufficient** for live preview: SplitText restructures the DOM and may **pin computed `font-size` inline** on `.word`, `.line`, and `.char` nodes (most often on **words-only** splits).

Other typography fields (line-height, letter-spacing, align, transform) usually inherit because SplitText does not bake them inline the same way.

**Gap in original specs:** PRD §10 and ADR-0002 described vars on `[data-playground]` only. They did not require verification across SplitText **type** (`chars`, `words`, `lines`) or **mask** combinations.

---

## Two-layer contract

| Layer | Owner | Responsibility |
|-------|--------|----------------|
| **Runtime** | `text-tuner` (`applyTypographyToScope` in `panel/typography.js`) | Set `--playground-*` on scoped target; strip inline `font-size` from `.word`, `.line`, `.char` descendants after each apply |
| **Consumer canvas CSS** | Demo / production page | Target element uses `--playground-*` vars; split descendants inherit live typography (see snippet below) |

Do **not** set preview typography vars on `:root` on multi-instance pages ([INTERFACE_RULES](./INTERFACE_RULES.md)).

---

## Consumer canvas CSS (required)

Apply playground vars on the split target (or a wrapper), then ensure split descendants track live updates:

```css
.split-target,
[data-playground] {
  font-family: var(--font-sans-serif);
  font-size: var(--playground-font-size);
  font-weight: 400;
  line-height: var(--playground-line-height);
  letter-spacing: var(--playground-letter-spacing);
  text-align: var(--playground-text-align);
  text-transform: var(--playground-text-transform);
}

/* SplitText may bake font-size inline — inherit from scoped target */
[data-playground] .word,
[data-playground] .line,
[data-playground] .char {
  font-family: inherit;
  font-weight: inherit;
  font-size: inherit !important;
  font-style: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-align: inherit;
  text-transform: inherit;
}
```

### Headline / title scale (optional)

Use a **unitless** multiplier — avoid `calc(rem * clamp(..., 4vw, ...))` (invalid when clamp resolves to `vw`):

```css
.frame__title {
  --playground-title-scale: 1.75;
  font-size: calc(var(--playground-font-size) * var(--playground-title-scale));
}
```

See `examples/sample-playground/styles.css` for responsive `--playground-title-scale` breakpoints.

### Line masks (caveat)

Mask wrappers (`*-mask` classes from SplitText) clip to line boxes, not glyph ink. Live typography can desync mask geometry until **commit** re-splits ([ADR-0002](../docs/adr/0002-smart-rebuild-and-live-typography.md)). For mask padding strategies, see the [GSAP SplitText docs](https://gsap.com/docs/v3/Plugins/SplitText/) (`mask`, `linesClass`).

---

## Runtime behavior (package)

`applyTypographyToScope` runs:

1. On live Type tab changes (`requestTypographyUpdate`)
2. After full rebuild (`runFullRebuild`)
3. After commit rebuild (`commitAndRebuild` when `result.rebuilt`)
4. On instance switch (`switchToInstance`)
5. For **all** instances once after `initAll()` in `attach()`

Each call clears `font-size` inline on `.word`, `.line`, `.char` under the scoped target.

---

## Split type matrix (manual verification)

| Split type | Mask | Instance / demo | Live font-size | Live line-height | Commit fixes masks |
|------------|------|-----------------|----------------|------------------|--------------------|
| `words,lines` | `lines` | `cold-start-lines` | AT-033a | AT-033a | Yes |
| `words,lines` | `lines` | `imported-paragraph` | AT-033b | AT-033b | Yes |
| `words` | `none` | `config-header` | AT-033c | AT-033c | N/A |
| `chars` (or `words,chars`) | any | `char-reveal` | AT-033d | AT-033d | N/A |

AT-033 (original) — pending indicator + rebuild on panel close — remains P0.

---

## Package export

Import in consumer pages (after `fonts.css`, before layout CSS):

```html
<link rel="stylesheet" href="text-tuner/canvas-typography.css" />
```

Or ESM path: `text-tuner/canvas-typography.css` (see `package.json` exports).

---

## References

| Doc | Topic |
|-----|--------|
| [GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/) | `mask`, `wordsClass`, `linesClass`, `charsClass` |
| [TT-092](../issues/TT-092-demo-typography-css.md) | Demo `.frame__title` scale (done) |
| [TT-093](../issues/TT-093-typography-split-contract.md) | Contract hardening + AT matrix |
