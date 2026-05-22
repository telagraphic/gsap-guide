# Animation Overview — MWG Effect 015 (Word Scroll Reveal)

**Source:** `script.js`, `style.css`, `index.html`  
**Driver:** Scroll position (ScrollTrigger + optional Lenis smooth scroll)  
**Note:** `index.html` references `assets/script.js` and `assets/style.css`; in this repo the same logic lives at the project root (`script.js`, `style.css`).

---

## Big Picture

| Aspect | Detail |
|--------|--------|
| **Trigger** | Vertical page scroll (native or Lenis `autoRaf`) |
| **Layers** | Two stacked text layers per word (`.word-hidden` / `.word-visible`) inside a **CSS clip-path window** on `.word` |
| **Transforms** | `yPercent` on both child spans (GSAP); initial offset via CSS `translate(0, -100%)` on hidden layer |
| **Easing** | `expo.inOut` on scrubbed tweens; scroll hint uses default ease, 0.2s duration |
| **Plugins** | `ScrollTrigger`; Lenis is optional smooth-scroll only (not wired into ScrollTrigger here) |

There is **no master timeline**. Each `.word` gets its own scrubbed tween; the scroll hint is a separate one-shot toggle on the first pixel of scroll.

---

## ASCII Storyboard (scroll-scrubbed, per `.word`)

```
VIEWPORT
══════════════════════════════════════════════════════════════

PHASE ──► scroll relation to ONE .word          progress (ST)   yPercent (both children)
──────────────────────────────────────────────────────────────────────────────────────

BEFORE    word bottom below viewport bottom      0               0
          │                                    (not scrubbing)
          │  [clip slot shows .word-visible]
          │  [.word-hidden sits above slot]


START     word bottom ── meets ── viewport bottom   0 → begins    0
          │  "bottom bottom"
          │
          │  visible: "Soundtrack®" in window
          │  hidden:   duplicate, 1 line above (-100%)


MID       user scrolls; ST scrubs with 0.4s lag    0.5             ~50
          │  word travels up through viewport
          │  "top 55%" not reached yet
          │
          │  both spans slide down together
          │  visible exits slot ▼  hidden enters slot ▼


END       word top ── meets ── 55% from top       1               100
          │  "top 55%"
          │
          │  visible: fully below clip (gone)
          │  hidden:   centered in clip (revealed)


AFTER     word continues above 55% line          1 (holds)       100
          │  scrub range exhausted
```

**Stagger:** None in code — words scrub **independently** as each hits its own start/end (reading order ≈ scroll order because starts are tied to each word’s geometry).

---

## ASCII Storyboard — Scroll hint (`.scroll`)

```
   scrollY = 0          scrollY > 0 (1px+)
   ─────────────        ────────────────
   autoAlpha: 1    →    autoAlpha: 0
   duration: 0.2s       toggle reverse if back to top
```

ScrollTrigger: `trigger: body`, `start: top top`, `end: top top-=1` — a **1px** scroll band at the very top.

---

## Layer Stack (one word)

```
┌─ .word  clip-path: polygon(0 2%, 0 98%, 100% 98%, 100% 2%)  ← "window"
│
│   .word-visible  (in flow)     ← starts IN the window
│   .word-hidden   (absolute)    ← starts ONE line ABOVE (translate -100%)
│
└─ GSAP: both children yPercent 0 → 100  (moves stack down through window)
```

**Metaphor:** A fixed mail slot; two identical strips of text on one conveyor. Scroll pulls the conveyor down until the bottom strip leaves and the top strip fills the slot.

---

## TIMING / SCROLL CONFIG (extracted constants)

These values are **currently inline** in `script.js` / `style.css`. A refactor would hoist them to a single config block at the top of `script.js`.

```javascript
/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * SCROLL HINT
 *   at top     "Scroll" label visible (autoAlpha 1)
 *   +1px       fades out over 0.2s
 *
 * PER WORD (×7 in index.html)
 *   start      word bottom = viewport bottom
 *   end        word top = 55% viewport height
 *   scrub      0.4s lag behind scroll
 *   motion     yPercent 0 → 100 on BOTH children (expo.inOut)
 * ───────────────────────────────────────────────────────── */

const SCROLL_HINT = {
  duration: 0.2,
  trigger: { start: "top top", end: "top top-=1" },
  toggleActions: "play none reverse none",
};

const WORD_REVEAL = {
  yPercentEnd: 100,
  ease: "expo.inOut",
  scrub: 0.4,
  scrollTrigger: {
    start: "bottom bottom",
    end: "top 55%",
  },
};
```

```javascript
/* CSS-side setup (style.css) — not animated by GSAP initially */
const WORD_MASK = {
  clipPath: "polygon(0 2%, 0 98%, 100% 98%, 100% 2%)",
  lineHeight: 0.8,
  hiddenInitialTranslate: "0, -100%",
};
```

---

## HTML ↔ CSS ↔ JS connections

| Layer | Selector / element | CSS role | JS role |
|-------|---------------------|----------|---------|
| Section | `.mwg_effect015` | Column layout, `100vh` bottom padding for scroll room | — |
| Hint | `.scroll` | `position: fixed`, centered | `autoAlpha` fade via ScrollTrigger |
| Intro | `.top` / `.text` | `100vh`, mono uppercase block | — |
| Headline | `.homepage-title` / `.word` | `clip-path` mask, `line-height: 0.8` | ScrollTrigger `trigger: word` |
| Hidden copy | `.word-hidden` | `absolute`, `translate(0,-100%)` | `yPercent` scrub with sibling |
| Visible copy | `.word-visible` | In-flow duplicate text | `yPercent` scrub with sibling |
| Media | `.media` | Sized image, no motion | — |

**Order of application:** CSS paints initial state (hidden above, visible in slot). On `DOMContentLoaded`, GSAP attaches scrub tweens; until scroll reaches each word’s `start`, `yPercent` stays 0.

---

## DOM structure (headline)

Seven `.word` spans, each with duplicate children:

1. Soundtrack®  
2. synthesizes  
3. the  
4. sound  
5. of  
6. tomorrow.  
(+ line breaks between groups)

---

## Dependencies

- GSAP 3.12.5 + ScrollTrigger (CDN)  
- Lenis 1.1.16 (optional; `autoRaf: true` only — **not** `lenis.on('scroll', ScrollTrigger.update)` in current code)

---

## Quick checklist

- [x] Storyboard describes scroll phases per word and 1px hint band  
- [x] TIMING/scroll config documented (values still inline in source)  
- [x] Element config grouped (mask, dual layers, scrub)  
- [x] HTML / CSS / JS connections listed  
- [ ] Zero magic numbers in source code (future refactor target)
