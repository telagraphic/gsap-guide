# Split Text Playground

Dev-only typography panel for GSAP SplitText demos in this repo. Injects a fixed control bar (Shift+C) and rebuilds the host demo after font metric changes.

**Not intended for production sites** — include only while tuning animations inside `split-text/`.

## Host page requirements

1. Load GSAP 3.13+, ScrollTrigger, and SplitText (plugin does not bundle them).
2. Load `fonts.css` from this folder.
3. Load `split-text-playground.css` and `split-text-playground.js`.
4. Define `initYourDemo(settings)` **before** calling `attach()`.
5. Mark split elements with the selector you pass as `targets` (e.g. `.split-target`).
6. Map `--playground-*` CSS variables on those elements in your demo stylesheet.

## Attach API

```js
SplitTextPlayground.attach({
  init: initYourDemo,       // (settings) => teardownFn
  targets: ".split-target",
  storageKey: "your-demo-key",
  defaults: {
    fontVar: "--font-giest",
    fontSize: 4,
    lineHeight: 1.05,
    letterSpacing: -0.02,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
```

### `settings` passed to `init`

Typography only — split `type` / masks stay in your demo script:

| Field | Example |
|-------|---------|
| `fontVar` | `"--font-giest"` |
| `fontSize` | `4` (rem) |
| `lineHeight` | `1.05` (unitless) |
| `letterSpacing` | `-0.02` (em) |
| `textAlign` | `"center"` |
| `textTransform` | `"uppercase"` |

### Other API

| Method | Description |
|--------|-------------|
| `SplitTextPlayground.isActive()` | `true` after `attach()` |
| `SplitTextPlayground.exportSettingsCss(settings)` | CSS string for `:root` vars |

## Teardown checklist

Your `init` **must** return a function that:

1. Kills ScrollTriggers created by this demo (`ScrollTrigger.getAll().forEach(st => st.kill())` is OK when one demo runs per page).
2. Calls `gsap.killTweensOf()` on `targets` and descendants.
3. Calls `split.revert()` for each SplitText instance.
4. Calls `split.kill()` only if `typeof split.kill === "function"`.
5. Does not throw — rebuild depends on a clean teardown.

## Typography CSS contract

The plugin sets on `document.documentElement`:

```css
--font-sans-serif: var(--font-giest);
--playground-font-size: 4rem;
--playground-line-height: 1.05;
--playground-letter-spacing: -0.02em;
--playground-text-align: center;
--playground-text-transform: uppercase;
```

Your demo CSS should consume these on `.split-target` (see `basics/styles.css`).

## Panel controls

- Font family, size, line height, letter spacing, align, transform
- **Copy CSS** — clipboard export for pasting into `styles.css`
- ~~Split type~~ — not in the panel; configure in each demo’s `SplitText.create()`

## Fonts

- **Binary files must live in** `split-text-playground/fonts/` (sibling to `fonts.css`).
- `fonts.css` uses relative URLs (`url("fonts/…")`), resolved from this folder — not from the demo HTML path.
- Regenerate after adding files: `node generate-fonts.mjs` (run from this directory).
- Only ASCII-safe static filenames (see generator output for skips).

If every font 404s in the network tab, the `fonts/` directory is missing or was not moved here during setup.

## Future: multiple registrations per page

Not implemented in v1. If one HTML page needs separate `init` functions, register instances with unique `storageKey` values and scope ScrollTrigger cleanup by `id` — see `REFACTOR_PLAN.md`.

## Prevent double init

When using the playground, set before your demo script:

```html
<script>window.__splitTextPlaygroundAttach = true;</script>
```

Your demo script should only auto-run on `document.fonts.ready` when that flag is absent.
