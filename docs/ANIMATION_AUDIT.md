# MWG Effect 015 — Animation Audit

**Sources:** `script.js`, `style.css`, `index.html`  
**Context:** [`ANIMATION_STORYBOARD.md`](ANIMATION_STORYBOARD.md), [`ANIMATION_CODE.md`](ANIMATION_CODE.md)

---

## Code Flow

```text
DOMContentLoaded
    │
    ├─> Lenis({ autoRaf: true })          → global `lenis` (no ScrollTrigger bridge)
    │
    ├─> gsap.to('.scroll', …)             → 1 ScrollTrigger on document.body
    │
    └─> querySelectorAll('.mwg_effect015 .word')
            └─> forEach (×8)
                    └─> gsap.to(word.children, …)   → 8 identical ScrollTriggers
```

**Runtime model:** Nine independent ScrollTriggers (one hint + eight words). No `gsap.context`, no teardown, no shared config object in source. CSS owns mask geometry; JS owns scroll-linked `yPercent`. Markup duplicates every word as two manual spans.

---

## First Impressions

The animation logic is small and readable, but it is a **demo script**, not an integrable module. The highest-impact gap is **deployment**: `index.html` points at `assets/script.js` and `assets/style.css` while the implementation lives at the repo root — the effect does not run as checked in without path alignment. The second gap is **integration hygiene**: Lenis is constructed with no `ScrollTrigger.update` hook, `lenis` is an implicit global, and nothing kills tweens or triggers on re-init — fine for a one-page CodePen-style file, brittle in a router or playground rebuild. Eight copy-pasted ScrollTrigger configs and inline magic numbers (`0.4`, `55%`, `+=100`, clip `2%`/`98%`) match the storyboard docs but not the source; tuning one band means editing eight call sites or hunting comments.

---

## Overall Design Architecture

Today the effect is **selector-driven procedural code** inside a single `DOMContentLoaded` listener. That fits a tutorial export; it does not scale to multiple instances, CMS-driven copy, or rebuild-after-font-change flows.

| Approach | Fit for this effect | Tradeoff |
|----------|---------------------|----------|
| **Config + factory (recommended next step)** | `setupWordReveal(word, WORD_REVEAL)` + `SCROLL_HINT` constants at file top | Minimal diff; keeps eight triggers; storyboard already defines shapes |
| **`gsap.context` + `setup()` / `teardown()`** | Wrap hint + word loop; `return () => ctx.revert()` | Required for SPA, HMR, or typography playground rebuild |
| **Single ScrollTrigger on `.container` + progress map** | One trigger; derive per-word progress from scroll offset | Fewer ST instances; harder to tune per-word stagger; overkill for 8 words |
| **Web component / module** | `<mwg-mask-headline>` or `initMwg015(root, options)` | Best drop-in for a real site; moves clip-path vars + bands into options |
| **Markup generation** | One text node → inject `.word-hidden` / `.word-visible` | Removes duplicate strings in HTML; must preserve accessibility |

**Target shape:** `initEffect015({ root, lenis?: boolean }) → teardown`, config objects at top, explicit child selectors, Lenis gated and wired to ScrollTrigger when enabled.

---

## Table of Fixes/Refactors

| Issue/Problem | Refactor/Fix | Why | Priority/Impact |
| ------------- | ------------ | --- | --------------- |
| `index.html` loads `assets/script.js` / `assets/style.css`; sources are at repo root | Move files under `assets/` or update `<link>` / `<script>` paths | Effect and styles 404 in browser; blocks all QA | **High** |
| Lenis runs without `ScrollTrigger.update` on scroll | `lenis.on('scroll', ScrollTrigger.update)` (or official Lenis + ST recipe) | Smooth scroll changes scroll position without ST recalc → scrub progress can drift or feel wrong | **High** |
| No `gsap.context` or teardown | `const ctx = gsap.context(() => { … }, root); return () => ctx.revert()` | Re-init (font reload, route change) stacks triggers and tweens; known failure mode in playground work | **High** |
| Eight identical `gsap.to` + ScrollTrigger blocks | `WORD_REVEAL` config + `createWordReveal(word)` factory | One place for `start`, `end`, `scrub`, `ease`, `yPercent`; storyboard constants already drafted | **High** |
| Magic numbers in JS/CSS (`0.4`, `55%`, `0.2`, `+=100`, clip `2%`/`98%`) | Named constants / CSS variables (`--word-clip-inset`, `--word-scrub-sec`) | Font or layout change requires coordinated edits; reduces wrong-band bugs | **High** |
| Implicit global `lenis` | `const lenis = …` or `let lenis = null` behind `if (window.Lenis)` | Strict mode / bundlers flag leaks; optional block should not pollute `window` | **Med** |
| `word.children` as tween target | `gsap.to([word.querySelector('.word-hidden'), word.querySelector('.word-visible')], …)` or `gsap.utils.toArray('.word-hidden, .word-visible', word)` | Extra node inside `.word` (icon, screen-reader text) breaks the effect silently | **Med** |
| Duplicate copy in HTML (hidden + visible per word) | Build spans from one data source, or `aria-hidden` on decorative duplicate | Drift risk; translation/CMS must update two nodes per word | **Med** |
| Lenis always constructed | Feature flag: only init when `window.Lenis` exists and option enabled | Script errors if Lenis script removed; demos often ship without smooth scroll | **Med** |
| Font size changes at `500px` but scroll bands unchanged | `ScrollTrigger.matchMedia` or resize `refresh()` after font/clip tuning | Taller/shorter words change travel distance inside same `start`/`end` band | **Med** |
| No `prefers-reduced-motion` path | `@media (prefers-reduced-motion: reduce)` → skip scrub / set `yPercent` end state | Accessibility expectation for scroll-scrubbed motion | **Med** |
| `gsap.to` with `yPercent: '+=100'` only | Prefer `gsap.fromTo` with explicit `from`/`to` or `immediateRender: false` + clear start values | Rebuild/debugging: `+=` relative to current transform is harder to reset than absolute from/to | **Med** |
| Scroll hint uses `toggleActions`; words use `scrub` | Document in config comments; keep pattern but name intent (`HINT_TOGGLE` vs `WORD_SCRUB`) | Two scroll models in one file confuse future edits | **Low** |
| Empty `@media (max-width: 768px)` block | Remove or add real overrides | Dead CSS adds noise | **Low** |
| Typo comment `LIENIS` | Fix to `LENIS` | Small polish | **Low** |
| Class name `mwg_effect015` only coupling | `data-effect="mask-reveal"` or `init(root)` scoped query | Reuse in non-MWG pages without class collision | **Low** |
| CDN scripts without fallback/SRI | Pin + `integrity` or local vendor copy | Supply-chain and offline dev | **Low** |
| `.scroll` hint has no `prefers-reduced-motion` / keyboard alternative | Keep visible longer or use `aria-live` once | Hint is decorative; low risk | **Low** |

---

## Implementation notes (teaching)

### Lenis + ScrollTrigger

Lenis moves scroll on its own RAF; ScrollTrigger reads native scroll unless you tell it otherwise. Without `ScrollTrigger.update` on Lenis scroll events, trigger positions lag behind what the user sees. Wire once when Lenis is enabled; call `ScrollTrigger.refresh()` after fonts load if bands depend on measured word height.

### Factory pattern (sketch)

```javascript
const WORD_REVEAL = {
  yPercentEnd: 100,
  ease: "expo.inOut",
  scrub: 0.4,
  start: "bottom bottom",
  end: "top 55%",
};

function createWordReveal(word, config = WORD_REVEAL) {
  const layers = word.querySelectorAll(".word-hidden, .word-visible");
  return gsap.to(layers, {
    yPercent: config.yPercentEnd,
    ease: config.ease,
    scrollTrigger: {
      trigger: word,
      start: config.start,
      end: config.end,
      scrub: config.scrub,
    },
  });
}
```

Use absolute `yPercent: 100` with `fromTo({ yPercent: 0 }, { yPercent: 100 })` when you need deterministic rebuilds.

### `gsap.context` teardown

```javascript
function setupMwg015(root = document.querySelector(".mwg_effect015")) {
  const ctx = gsap.context(() => {
    setupScrollHint(root);
    root.querySelectorAll(".word").forEach(createWordReveal);
  }, root);
  return () => ctx.revert();
}
```

Call the returned function before re-running setup (font playground, route leave).

### Clip-path as config

`clip-path` inset (`2%` / `98%`) is font-specific. Expose as CSS variables on `.word` so design can tune without opening JS; document that changing line-height or font requires revisiting both clip and scroll band.

---

## Suggested refactor order

1. Fix asset paths so the demo runs.  
2. Extract `SCROLL_HINT` / `WORD_REVEAL` + factory (storyboard already specifies shapes).  
3. Add `gsap.context` + teardown export.  
4. Gate Lenis and connect `ScrollTrigger.update`.  
5. Explicit layer selectors + `matchMedia` / reduced-motion.  
6. Optional module boundary (`initMwg015`) when integrating into a larger site.

Run `/gsap-refactor refactor` to implement items 2–4 in `script.js`.
