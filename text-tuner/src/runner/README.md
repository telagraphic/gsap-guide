# Runner

`createSplitScrollRunner(config)` applies a `SplitScrollConfig` via SplitText, gsap, and ScrollTrigger.

## Peer dependencies

Load before calling the factory:

1. `gsap`
2. `ScrollTrigger` (GSAP plugin)
3. `SplitText` (Club GSAP — document license for consumers)

The runner calls `gsap.registerPlugin(SplitText, ScrollTrigger)` once on first use. Duplicate registration is safe in GSAP 3.

## Contract

```javascript
const { teardown, runtime } = createSplitScrollRunner(config);
// runtime.applyLive(partialConfig) — live tween/ST fields, no re-split
// runtime.getConfig() — current merged config
// teardown() — kill tween/ST and revert split
```

Runner never reads panel DOM. Typography CSS is applied outside the runner (panel / InstanceManager).
