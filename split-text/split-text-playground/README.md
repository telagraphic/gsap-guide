# Split Text Playground

Dev-only typography panel for GSAP SplitText demos in this repo. Injects a fixed control bar (Shift+C) and rebuilds the host demo after font metric changes.

**Not intended for production sites** — include only while tuning animations inside `split-text/`.

---

## Step-by-step: wire up a new demo page

### 1. Serve from `split-text/`

```bash
cd split-text
./serve.sh
```

Open `http://localhost:8000/your-demo/index.html`. Relative paths to the playground must be `../split-text-playground/…` from a subfolder (e.g. `basics/`, `waterfall-clip/`).

### 2. HTML — GSAP + fonts + split targets

```html
<link rel="stylesheet" href="../split-text-playground/fonts.css" />
<link rel="stylesheet" href="styles.css" />

<main class="page">
  <h1 class="split-target" data-split>Your headline</h1>
</main>
```

Add class `split-target` on every element whose typography the panel should drive.

### 3. CSS — typography contract

Map playground variables on split targets (see `basics/styles.css`):

```css
.split-target {
  font-family: var(--font-sans-serif);
  font-size: var(--playground-font-size);
  line-height: var(--playground-line-height);
  letter-spacing: var(--playground-letter-spacing);
  text-align: var(--playground-text-align);
  text-transform: var(--playground-text-transform);
}
```

Optional defaults in `:root` so the page looks correct before JS runs.

### 4. `script.js` — `setupPlayground` + split registry

Wrap **all** SplitText and ScrollTrigger setup in one function named `setupPlayground`. The playground calls it on load and after every control change; it must **return teardown**.

```js
gsap.registerPlugin(SplitText, ScrollTrigger);

function setupPlayground(_settings) {
  const tweenTargets = ".split-target, .split-target *";

  // One variable per SplitText.create — flat, readable setup
  const hero = SplitText.create(".split-target", {
    type: "words", // fixed here — not controlled by the panel
    autoSplit: true,
    onSplit: (self) => {
      /* gsap.set + gsap.to + scrollTrigger */
    },
  });

  // Register every instance for cleanup (bottom of setupPlayground)
  const splits = [hero];

  return function teardown() {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.killTweensOf(tweenTargets);
    splits.forEach((split) => {
      if (split?.revert) split.revert();
      if (split?.kill) split.kill();
    });
  };
}

window.setupPlayground = setupPlayground;

if (!window.__splitTextPlaygroundAttach) {
  document.fonts.ready.then(() => setupPlayground());
}
```

#### Why `setupPlayground`?

| Piece | Role |
|-------|------|
| `setupPlayground` | **Init** — creates splits, tweens, ScrollTriggers |
| Returned `teardown` | **Cleanup** — kills ST, tweens, reverts splits before rebuild |
| `_settings` | Typography from the panel (font, size, line-height, …). Often unused in tween code because vars are applied via CSS. |
| `splits` array | **Registry** — every `SplitText.create` you need to revert on rebuild |

Without `setupPlayground` + teardown, changing fonts in the panel leaves dead ScrollTriggers or broken split DOM.

#### Split registry pattern

1. Assign each `SplitText.create(...)` to a **named variable** (`frameTwo`, `hero`, …).
2. If you need the instance during setup (e.g. `frameThree.words`), use that variable for tweens.
3. At the **end** of `setupPlayground`, list every instance:

   ```js
   const splits = [frameTwo, frameThree, frameFour];
   ```

4. Teardown loops `splits` and calls `revert()` / `kill()`.

Do **not** skip an instance — any split left out will leak wrappers after a font change.

Reference implementations: `basics/script.js`, `basics/body.js`.

### 5. HTML — DEV ONLY playground block

Load demo script **before** the playground. Set the attach flag so the demo does not double-init.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>

<!-- DEV ONLY: split-text-playground — remove when copying animation elsewhere -->
<link rel="stylesheet" href="../split-text-playground/split-text-playground.css" />
<script>window.__splitTextPlaygroundAttach = true;</script>
<!-- /DEV ONLY -->

<script src="script.js"></script>

<!-- DEV ONLY: split-text-playground — remove when copying animation elsewhere -->
<script src="../split-text-playground/split-text-playground.js"></script>
<script>
  SplitTextPlayground.attach({
    init: setupPlayground,
    targets: ".split-target",
    storageKey: "your-demo-name",
    defaults: {
      fontVar: "--font-giest",
      fontSize: 4,
      lineHeight: 1.05,
      letterSpacing: -0.02,
      textAlign: "center",
      textTransform: "uppercase",
    },
  });
</script>
<!-- /DEV ONLY -->
```

Use a unique `storageKey` per HTML file so headline and body pages remember their own settings.

### 6. Tune and export

1. Open the page, press **Shift+C** for the panel.
2. Change font, size, line-height, etc. Scroll to confirm scrub animations still work.
3. Click the **copy icon** to get `:root { --playground-* }` CSS for your `styles.css`.
4. Adjust `SplitText.create` options (`type`, `mask`, stagger) in `script.js` as needed — those are **not** in the panel.

### 7. Ship animation elsewhere

Remove every `<!-- DEV ONLY: split-text-playground -->` block. Keep GSAP + your `script.js`. Paste copied CSS into the target project. `setupPlayground` can stay as a plain `fonts.ready` init or be inlined if you never need rebuild.

---

## Attach API

```js
SplitTextPlayground.attach({
  init: setupPlayground,   // (settings) => teardownFn
  targets: ".split-target",
  storageKey: "your-demo-key",
  defaults: { /* typography */ },
});
```

### `settings` passed to `setupPlayground`

Typography only — split `type` / masks stay in your demo script:

| Field | Example |
|-------|---------|
| `fontVar` | `"--font-giest"` |
| `fontSize` | `4` (rem, applied as CSS) |
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

Your returned teardown function must:

1. Kill ScrollTriggers for this demo (`ScrollTrigger.getAll().forEach(st => st.kill())` is OK when one demo runs per page).
2. Call `gsap.killTweensOf()` on `targets` and descendants.
3. Call `split.revert()` for **every** entry in your `splits` registry.
4. Call `split.kill()` only if `typeof split.kill === "function"`.
5. Not throw — rebuild aborts if teardown fails.

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

## Panel controls

- Font family, size, line height, letter spacing, align, transform
- **Copy CSS** (icon) — clipboard export for `styles.css`
- Split type is **not** in the panel — set per `SplitText.create()` in your demo

## Fonts

- **Binary files must live in** `split-text-playground/fonts/` (sibling to `fonts.css`).
- Regenerate after adding files: `node generate-fonts.mjs` (from this directory).

## Future: multiple registrations per page

Not v1. See `REFACTOR_PLAN.md` if one page needs several `attach()` calls with scoped ScrollTrigger cleanup.
