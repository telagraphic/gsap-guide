# Animation Code Analysis — MWG Effect 015

**Files:** `script.js`, `style.css`, `index.html`

---

# Variables, calculations, etc used in the code

| Name | Where | Value / type | Changes? | What it does visually |
|------|--------|--------------|----------|------------------------|
| `lenis` | `script.js` | `new Lenis({ autoRaf: true })` | Instance for page lifetime | Smooths scroll interpolation; does not directly set transforms |
| `autoAlpha` | GSAP tween on `.scroll` | `0` at end | Toggles 1 ↔ 0 at page top | Fades + disables hit-testing on “Scroll” label |
| `duration` | `.scroll` tween | `0.2` | Fixed | How fast hint fades when scroll starts |
| `start` / `end` (hint ST) | ScrollTrigger | `top top` / `top top-=1` | Fixed | 1px scroll range at y=0 |
| `toggleActions` | hint ST | `play none reverse none` | On enter/leave top band | Play fade on scroll down; reverse when returning to top |
| `word` | `forEach` target | each `.word` element | — | Bounding box for per-word scrub range |
| `word.children` | GSAP target | `.word-hidden`, `.word-visible` | Both tweened together | Two layers move in parallel |
| `yPercent` | word tween | `'+=100'` | 0 → 100 over ST progress | Moves each span by **100% of its own height** downward |
| `ease` | word tween | `expo.inOut` | Applied along scrub | Slow start/end of motion within progress |
| `scrub` | word ST | `0.4` | Fixed | Animation lags scroll by ~0.4s (smoothing) |
| `start` (word ST) | ScrollTrigger | `bottom bottom` | Progress 0 when word’s bottom edge touches viewport bottom | Reveal begins as word enters from below |
| `end` (word ST) | ScrollTrigger | `top 55%` | Progress 1 when word’s top hits 55% from viewport top | Reveal finishes while word is upper-middle of screen |
| `clip-path` | `.word` CSS | `polygon(0 2%, 0 98%, …)` | Static | Horizontal “slot”; anything outside is clipped |
| `translate(0, -100%)` | `.word-hidden` CSS | Static until GSAP adds `yPercent` | Initial | Hidden copy starts one line above the slot |
| `line-height: 0.8` | `.word` CSS | Static | Tightens slot height vs font size | Affects clip window and `%` travel distance |

**ScrollTrigger progress** (per word, not named in code):

```
progress = 0  →  yPercent = 0   (CSS initial state dominates)
progress = 1  →  yPercent = 100 (hidden in slot, visible below slot)
```

---

# Metaphors for concepts used

| Code concept | Metaphor |
|--------------|----------|
| `.word` + `clip-path` | Mail slot in a door — only one horizontal strip visible |
| `.word-visible` + `.word-hidden` | Two identical tickets on one conveyor belt |
| `translate(0, -100%)` on hidden | Top ticket waits one position above the slot |
| `yPercent: '+=100'` on both children | Conveyor advances one full ticket height |
| `scrub: 0.4` | Camera on a damped track — scroll is the hand, motion follows slightly late |
| `start: bottom bottom` | Slot machine arm pulls when the word’s feet touch the floor of the screen |
| `end: top 55%` | Arm stops when the word’s head reaches the upper-middle line |
| `expo.inOut` | Motion eases into and out of the crawl (not linear crank) |
| Hint `end: top top-=1` | Hair-trigger at the top — one pixel of scroll kills the label |

---

# Step by step breakdown

## 1. Page load

```
DOMContentLoaded
    → registerPlugin(ScrollTrigger) [already at top level]
    → Lenis starts RAF loop
    → fade tween on .scroll created (paused until ST fires)
    → forEach .word → scrub tween created (paused until word enters range)
```

## 2. Initial paint (CSS only)

Example word **"sound"** (~48px tall at 8vw, line-height 0.8):

```
VIEWPORT (excerpt)
┌────────────────────────────┐
│                            │
│      ┌ clip slot ────┐     │
│      │  sound        │     │  ← .word-visible
│      └───────────────┘     │
│      [ sound ]  (hidden)   │  ← .word-hidden, -100% above
│                            │
└────────────────────────────┘
```

| Element | `transform` (effective) | In slot? |
|---------|-------------------------|----------|
| `.word-visible` | none | Yes — readable |
| `.word-hidden` | `translate(0, -100%)` | No — above |

## 3. User scrolls — one word’s ScrollTrigger

**Sample geometry (illustrative):** viewport 900px tall; word height 60px; word travels from below fold to `top: 55%` (= 495px from top).

| Scroll moment | ST progress | `yPercent` (approx) | Slot shows |
|---------------|-------------|---------------------|------------|
| Word bottom = vp bottom | 0 | 0 | visible text |
| Mid scrub | 0.5 | 50 | half crossfade |
| Word top = 55% vp | 1 | 100 | hidden text |

**How `yPercent` stacks with CSS:**

GSAP sets transform on both children. For `.word-hidden`:

```
initial: translate(0, -100%)     /* CSS */
+ scrub: translate(0, yPercent%) /* GSAP, 0→100 */
≈ at progress 1: hidden sits in slot (0% relative offset from word top)
```

For `.word-visible`:

```
initial: 0
+ scrub: 100% down → text below clip polygon
```

ASCII side view at **progress = 0.5**:

```
.word clip window
═══════════════
     ┌────────┐
     │ so|und │  ← blend: top half hidden layer, bottom half visible exiting
     └────────┘
  ...........
   (visible moving down)
   (hidden moving down from above)
```

## 4. `gsap.to(word.children, { yPercent: '+=100', ... })`

- **Target:** NodeList of 2 spans — GSAP applies the **same** tween to each.
- **`+=100`:** relative add — safe if tween rebuilds; here runs once.
- **`scrub: 0.4`:** ScrollTrigger maps scroll position → `tween.progress()` with 0.4s smoothing (not 0.4s duration of a play-once tween).

**Sample values (one child, height 60px):**

| progress | `yPercent` | Pixel shift |
|----------|------------|-------------|
| 0 | 0 | 0px |
| 0.25 | 25 | 15px |
| 1 | 100 | 60px |

## 5. Scroll hint tween

```
scrollY = 0:   progress 0, autoAlpha 1
scrollY = 1:   ST active, tween plays to autoAlpha 0 over 0.2s
scrollY = 0:   reverse → autoAlpha 1
```

Independent of word reveals.

## 6. Lenis interaction

Lenis changes **how** scroll delta feels; ScrollTrigger still reads scroll position. Without `ScrollTrigger.scrollerProxy` or `lenis.on('scroll', ScrollTrigger.update)`, most setups still work because Lenis ultimately updates scroll position — but lag/jitter can occur on some setups. This file does not add that wiring.

---

# Simplify

Imperative pseudocode for **one word**:

```
ON LOAD:
  hidden_text.position = above_slot_by_one_line
  visible_text.position = inside_slot

ON SCROLL (for this word only):
  WHEN word.bottom >= viewport.bottom AND word.top <= viewport.height * 0.55:
    t = map_scroll_to_0_1(word)
    t_smooth = lerp(previous_t, t, scrub=0.4)

    offset = t_smooth * one_line_height

    visible_text.y = offset          // slides down
    hidden_text.y = -one_line_height + offset   // slides down from above

    // at t_smooth = 1: hidden fills slot, visible has left downward
```

Global:

```
ON SCROLL:
  IF page_scroll > 0: hide_fixed_scroll_label()
  ELSE: show_fixed_scroll_label()
```

---

# Summary

| Component | Responsibility |
|-----------|----------------|
| **CSS mask** | `clip-path` on `.word` defines the visible band; `line-height` sizes the band |
| **CSS dual layer** | Duplicate text; hidden pre-shifted up one line |
| **GSAP scrub** | Scroll progress drives `yPercent` on both layers identically |
| **ScrollTrigger (×7)** | Per-word start/end tie reveal to reading position on the page |
| **ScrollTrigger (hint)** | 1px band at top fades fixed “Scroll” UI |
| **Lenis** | Optional smooth scroll; orthogonal to reveal math |

The entire effect is **scroll-scrubbed vertical masking**: no SplitText, no timeline labels, no stagger — only parallel tweens keyed to each word’s position in the viewport.



## What `clip-path` does here

On each word, the **parent** `.word` gets a rectangular “window” — not the individual text spans:

```59:64:style.css
.mwg_effect015 .word {
  line-height: 0.8;
  position: relative;
  text-transform: uppercase;
  clip-path: polygon(0 2%, 0 98%, 100% 98%, 100% 2%); /* Depends on the font */
}
```

`polygon(0 2%, 0 98%, 100% 98%, 100% 2%)` is a box with corners at:

- top-left: 0% across, **2%** down  
- bottom-left: 0% across, **98%** down  
- bottom-right: 100% across, 98% down  
- top-right: 100% across, **2%** down  

So you keep a **thin horizontal band** in the middle of the word’s box (~96% of its height). Everything above 2% and below 98% is **cut off** — for the whole `.word`, including both children inside it.

That band is the **mask**. You only ever see text that falls inside it.

---

## Two layers inside the mask

Each `.word` holds duplicate text:

```29:31:index.html
          <span class="word">
            <span class="word-hidden">Soundtrack®</span>
            <span class="word-visible">Soundtrack®</span>
          </span>
```

| Layer | CSS | Role |
|--------|-----|------|
| `.word-visible` | Normal flow | Starts **in** the window — that’s what you read first |
| `.word-hidden` | `position: absolute`, `translate(0, -100%)` | Same text, parked **one line above** the window |

`clip-path` does **not** move anything. It only **hides** whatever is outside the polygon. The hidden span is still there; it’s just above the visible strip, so you don’t see it until it moves down into the band.

---

## How scroll “reveals” the hidden word

GSAP moves **both** spans down with `yPercent` (0 → 100):

```
BEFORE SCROLL                         AFTER SCROLL
                                      
   [ hidden ]  ← above window            [ hidden ]  ← now IN window ✓
═══════════════  ← clip window          ═══════════════
   [ visible ] ← in window               [ visible ] ← below window (clipped away)
```

1. **Start:** The window shows `.word-visible`. `.word-hidden` sits above the window (clipped out).  
2. **Scroll:** Both layers slide down together.  
3. **End:** `.word-hidden` has moved into the window; `.word-visible` has moved below it and is clipped away.

So the “reveal” is really: **slide two copies of the word through a fixed slot**. The hidden copy was always there; `clip-path` just defines which slice of the stack is visible.

---

## Why 2% and 98%?

The comment in CSS says it **depends on the font**. Tight `line-height: 0.8` and uppercase glyphs often have ascenders/descenders that stick outside a strict `0%–100%` box. Nudging the polygon to **2% / 98%** trims a little extra ink so the slot looks clean and you don’t get stray pixels at the top or bottom of the mask.

---

**One-line summary:** `clip-path` on `.word` is a fixed horizontal peephole; scroll pulls the duplicate “hidden” text down from above the peephole while the “visible” text slides out below it.