# Animation Storyboard — MWG Effect 015 (Soundtrack headline)

**Source:** `script.js` · **Markup:** `index.html` · **Styles:** `style.css`  
**Driver:** ScrollTrigger + scrub (not a master timeline). Optional Lenis smooth scroll runs in parallel.

---

## Big picture

| Layer | What happens |
|-------|----------------|
| **Scroll model** | Page is a tall column (`padding-bottom: 100vh`). User scrolls through intro copy, then a large masked headline, then a photo. |
| **Scroll hint** | Fixed “Scroll” label at viewport center fades out the moment the user leaves the very top of the page (one-shot toggle, 0.2s). |
| **Headline reveal** | Eight `.word` units; each word is a **clip mask** with two stacked text layers. Scrubbing slides both layers **+100% `yPercent`** so the upper copy (`word-hidden`) moves down through the mask window, revealing the in-flow copy (`word-visible`). |
| **Easing** | `expo.inOut` on word motion (non-linear feel during scrub). |
| **Transforms** | `yPercent` only on word children — no opacity/scale/filter in GSAP. |
| **CSS vs JS** | Mask geometry and initial off-screen position are **CSS** (`clip-path`, `translate(0, -100%)`). Motion is **GSAP** tied to scroll. |

```text
┌─────────────────────────────────────────────────────────────┐
│  FIXED: .scroll (center) — fades out at page top exit       │
├─────────────────────────────────────────────────────────────┤
│  100vh .top — intro paragraph                               │
├─────────────────────────────────────────────────────────────┤
│  .container — headline (.word × 8, each scrubbed)           │
│     clip-path mask + dual-span yPercent reveal              │
├─────────────────────────────────────────────────────────────┤
│  .media — static image                                      │
│  + 100vh bottom padding (scroll runway)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Shot list (scroll-scrubbed words)

Each word uses the **same** ScrollTrigger band; only the trigger element changes.

```text
/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — MWG 015
 *
 * SCROLL HINT (body trigger, time-based toggle)
 *   page top    hint visible (autoAlpha 1)
 *   scroll ↓    hint fades out over 200ms (autoAlpha 0)
 *
 * PER WORD (.mwg_effect015 .word) — scrub 0.4s lag
 *   BEFORE      word bottom below viewport bottom → progress 0
 *               children yPercent 0 (CSS: hidden span still at -100% translate)
 *   START       word bottom meets viewport bottom → progress 0
 *   INSIDE      scroll through band → yPercent 0 → +100 (expo.inOut)
 *               hidden + visible spans move down together through mask
 *   END         word top meets viewport 55% → progress 1
 *               children yPercent +100
 *   AFTER       past band → holds at +100%
 *
 * Words in DOM order: Soundtrack® · synthesizes · the · sound · of · tomorrow.
 * (8 triggers, 8 parallel ScrollTriggers)
 * ───────────────────────────────────────────────────────── */
```

### Viewport band (one word)

| Phase | Scroll position | `yPercent` (children) | What you see |
|-------|-----------------|------------------------|--------------|
| BEFORE | Word below fold | `0` | Mask closed; hidden text above window |
| START | `bottom bottom` | `0` | Reveal begins |
| INSIDE | Between start/end | `0 → +100` | Text slides down through clip |
| END | `top 55%` | `+100` | Reveal complete |
| AFTER | Word above band | `+100` | Holds |

**Scrub lag:** `scrub: 0.4` — scroll position maps to progress over ~0.4s of easing delay (smooth catch-up, not instant).

---

## Config objects (extracted from code)

```javascript
/* Scroll hint — toggles once at page top */
const SCROLL_HINT = {
  selector: ".scroll",
  hiddenAlpha: 0,
  durationSec: 0.2,
  trigger: document.body,
  start: "top top",
  end: "top top-=1",
  toggleActions: "play none reverse none", // hides on leave, shows on return to top
};

/* Per-word mask reveal — duplicated per .word */
const WORD_REVEAL = {
  target: "word.children", // .word-hidden + .word-visible
  yPercentDelta: 100,      // relative += 100
  ease: "expo.inOut",
  scrubSec: 0.4,
  scrollTrigger: {
    trigger: "word",       // each .word element
    start: "bottom bottom",
    end: "top 55%",
  },
};

/* CSS-owned layout (not tweened by GSAP) */
const WORD_MASK_CSS = {
  clipPath: "polygon(0 2%, 0 98%, 100% 98%, 100% 2%)",
  lineHeight: 0.8,
  hiddenOffset: "translate(0, -100%)", // .word-hidden
};
```

### Scroll progress map (normalized per word)

Use this when tuning **start** / **end** — same for all eight words:

```javascript
const SCROLL_BAND = {
  hintFade: { start: "top top", end: "top top-=1" },
  wordReveal: { start: "bottom bottom", end: "top 55%" },
  scrub: 0.4,
};
```

There is no single global `progress 0→1` for the page — eight independent word triggers plus one hint trigger.

---

## HTML → CSS → JS connections

| Piece | Role in the animation |
|-------|------------------------|
| `.word` wrapper | ScrollTrigger **trigger** element; `clip-path` defines visible window. |
| `.word-hidden` | Duplicate string, `position: absolute`, `transform: translate(0, -100%)` — sits above mask before scroll. |
| `.word-visible` | In-flow duplicate — target “rest” state in the window. |
| `gsap.to(word.children, { yPercent: "+=100" })` | Moves **both** spans downward by 100% of their own height — coupled motion. |
| `.scroll` | `position: fixed` center; `autoAlpha` only animated. |
| Lenis | `autoRaf: true` — affects scroll feel, not GSAP vars. |

**Why `children` not `.word-hidden` alone:** Both spans tween together; the effect is a vertical shift of the stacked pair inside the clip, not a crossfade.

---

## Function / trigger diagram

```text
DOMContentLoaded
    │
    ├─> Lenis({ autoRaf: true })                    [optional smooth scroll]
    │
    ├─> gsap.to('.scroll', { autoAlpha, scrollTrigger on body })
    │       └─> toggle at page top edge
    │
    └─> querySelectorAll('.mwg_effect015 .word')
            └─> forEach word
                    └─> gsap.to(word.children, { yPercent += 100, scrub ST })
                            trigger: word
                            start: bottom bottom → end: top 55%
```

---

## Refactor-shaped file header (reference)

If this file is rewritten to the storyboard pattern, the top of `script.js` would look like:

```javascript
/* ── storyboard comment (see docs/ANIMATION_STORYBOARD.md) ── */

const SCROLL_BAND = { /* … */ };
const SCROLL_HINT = { /* … */ };
const WORD_REVEAL = { /* … */ };

function setupScrollHint() { /* uses SCROLL_HINT */ }
function setupWordReveals() { /* uses WORD_REVEAL + forEach */ }

window.addEventListener("DOMContentLoaded", () => {
  // lenis optional
  setupScrollHint();
  setupWordReveals();
});
```

---

## Quick checklist

- [x] Storyboard matches scroll bands in `script.js`
- [x] CSS mask/translate called out separately from GSAP `yPercent`
- [ ] Magic numbers still in source — extract when refactoring (`/gsap-refactor refactor`)
- [x] Eight words = eight identical tweens (candidate for one factory function)

---

## Note on project paths

`index.html` loads `assets/script.js`; the effect implementation currently lives at repo root `script.js`. Align paths before testing in browser.
