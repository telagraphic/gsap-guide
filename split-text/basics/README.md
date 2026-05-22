# Basics

Headline and body-copy SplitText demos. Six full-viewport frames per page.

| File | URL (with `split-text/serve.sh`) |
|------|----------------------------------|
| `index.html` | `/basics/index.html` — headlines |
| `body.html` | `/basics/body.html` — body copy |

## Playground

Both pages use the same pattern:

- **`setupPlayground()`** in `script.js` / `body.js` — all GSAP + SplitText setup and the split registry
- **`SplitTextPlayground.attach({ init: setupPlayground })`** in the DEV ONLY HTML block

**Shift+C** — typography panel. **Copy icon** — export `:root` CSS.

Full setup guide: [`../split-text-playground/README.md`](../split-text-playground/README.md).

Remove all `<!-- DEV ONLY: split-text-playground -->` blocks before copying animation elsewhere.

## `setupPlayground` and the split registry

```js
function setupPlayground(_settings) {
  const frameTwo = SplitText.create(/* … */);
  const frameThree = SplitText.create(/* … */);
  // …

  const splits = [frameTwo, frameThree /* … */];

  return function teardown() {
    /* kill ScrollTriggers, revert every split in `splits` */
  };
}
```

- **`setupPlayground`** — playground calls this on load and on every font change; must return `teardown`.
- **`splits`** — list every `SplitText.create` instance so rebuild can `revert()` the DOM.
- **`_settings`** — typography from the panel; basics demos apply it via CSS vars, not in tween code.

## Split types (fixed in JS, not the panel)

| Frame | Headlines (`script.js`) | Body (`body.js`) |
|-------|-------------------------|------------------|
| 2 | words + mask | words + mask |
| 3 | words | words |
| 4 | words | chars + words |
| 5 | words | lines |
| 6 | words + mask | words/lines + line mask |

## Docs

- `SPLITTEXT_GUIDE.md`
- `EDGE_CASES.md`
