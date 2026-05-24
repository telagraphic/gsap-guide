# Playground v2

Dev-only tuning panel for a **single** SplitText + ScrollTrigger scrub animation. Use it on a test page before copying settings into production.

**Spec:** [PLAYGROUND_V2_PRD.md](./PLAYGROUND_V2_PRD.md)  
**Panel UI standards:** [INTERFACE_RULES.md](../INTERFACE_RULES.md)

## Quick start

From `split-text/`:

```bash
./serve.sh
```

Open [tuner/index.html](./tuner/index.html). Press **⌘K** (Ctrl+K) to open the panel.

## Script load order

```html
<script src="…/gsap.min.js"></script>
<script src="…/ScrollTrigger.min.js"></script>
<script src="…/SplitText.min.js"></script>

<!-- Your animation factory -->
<script src="./my-animation.js"></script>

<!-- DEV ONLY -->
<link rel="stylesheet" href="…/playground-v2.css" />
<script src="…/playground-v2.js"></script>
<script>
  SplitTextPlaygroundV2.attach({
    init: setupAnimation,
    defaults: DEFAULT_CONFIG,
    storageKey: "my-session",
    targets: ".split-target",
  });
</script>
```

## `setupAnimation(config)`

Your animation file should register plugins and export:

```javascript
function setupAnimation(config) {
  // SplitText.create + gsap.set / gsap.to + scrollTrigger
  return {
    teardown() { /* kill ST, revert split */ },
    runtime: {
      applyLive(partialConfig) { /* optional: tier-B live patches */ },
    },
  };
}

window.setupAnimation = setupAnimation;
window.DEFAULT_CONFIG = { /* … */ };
```

See [tuner/animation.js](./tuner/animation.js) for the reference implementation.

## BYO HTML checklist

Copy markup from [tuner/index.html](./tuner/index.html):

- [ ] Three `section.frame` blocks at `100vh` (spacer → animation → spacer)
- [ ] Frame 2 copy has `class="frame__copy split-target"`
- [ ] Selectors match `DEFAULT_CONFIG.targets` (default `.frame--2`, `.frame--2 .frame__copy`)
- [ ] Typography uses `--playground-*` / `--font-sans-serif` CSS vars (see `tuner/tuner.css`)
- [ ] GSAP 3.13+ with Club **SplitText** loaded

## Panel behavior

| Tab | While panel open | On close (⌘K / Esc) |
|-----|------------------|------------------------|
| Typography | Queued (pending dot) | Rebuild |
| SplitText | Queued | Rebuild |
| Properties | **Live** tween/ST patch | — |
| ScrollTrigger | **Live** | — |

On close: save to `sessionStorage`, full rebuild, scroll to top.

## Export

- **Copy config** — JSON for `setupAnimation`
- **Copy code** — literal `SplitText.create` + `onSplit` block
- **Copy CSS** (Typography tab) — `:root` playground variables

## Porting to production

1. Remove DEV ONLY stylesheet + `playground-v2.js` + `attach()` block.
2. Paste **Copy code** or call `setupAnimation(DEFAULT_CONFIG)` once after fonts load.
3. Keep typography in your design system CSS (not motion vars on split targets).
