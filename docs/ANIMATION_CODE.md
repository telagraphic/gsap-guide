# MWG Effect 015 — headline mask reveal

Scroll-scrubbed typography: each `.word` is a **fixed window** (`clip-path`), and GSAP slides **two identical text layers** downward through that window while ScrollTrigger maps scroll position to progress.

---

## Key variables & calculations

| Variable / property | What it does | Fixed or changes? | What drives the change |
|---------------------|--------------|-------------------|-------------------------|
| `clip-path` on `.word` | Cuts a horizontal band through the word box; nothing outside the polygon is painted | Fixed in CSS | Font metrics (2% inset avoids clipped ascenders/descenders) |
| `.word-hidden` `translate(0, -100%)` | Places the duplicate string **one line height above** the window | Fixed until GSAP runs | CSS only |
| `yPercent: "+=100"` on `word.children` | Moves **both** spans down by 100% of **each span’s own height** | `0` → `+100` | ScrollTrigger progress on that `.word` |
| ScrollTrigger `start` / `end` | Defines when progress `0` and `1` occur | Fixed strings | Scroll: `bottom bottom` → `top 55%` |
| ScrollTrigger `scrub: 0.4` | Progress follows scroll with ~0.4s smoothing lag | Fixed | Scroll velocity (feel, not position) |
| ScrollTrigger `trigger: word` | Progress is computed from **this word’s** position in the viewport | Per word (×8) | User scroll |
| `ease: "expo.inOut"` | Non-linear mapping from scroll progress to tween progress | Applied along scrub | ScrollTrigger + GSAP |

---

## How it works, step by step

### 1. CSS builds the mask and the stack (before GSAP)

```text
                    ┌── clip-path window (polygon) ──┐
                    │                                 │
   .word-hidden     │         .word-visible           │  ← in document flow (sets .word height)
   (absolute,       │         (in flow)               │
    translate       │                                 │
    -100% Y)        └─────────────────────────────────┘
        ▲
        │  one full line-height above the window
```

- `.word` is `position: relative` + `clip-path: polygon(0 2%, 0 98%, 100% 98%, 100% 2%)` → a **viewport** slightly shorter than the line box (font-dependent trim).
- `.word-visible` sits in normal flow → defines how tall the clip window is.
- `.word-hidden` is the same text, `position: absolute; top: 0; left: 0`, then `transform: translate(0, -100%)` → shifted up by **100% of the hidden span’s height**, so it waits **above** the band.
- **clip-path applies to the whole `.word` subtree** — children can move, but only pixels inside the polygon are visible.

GSAP does not set `clip-path`. The animation is “move text through a hole,” not “animate the hole.”

### 2. GSAP moves both layers through the hole

```javascript
gsap.to(word.children, {
  yPercent: "+=100",
  scrollTrigger: { trigger: word, start: "bottom bottom", end: "top 55%", scrub: 0.4 },
});
```

`word.children` = `.word-hidden` + `.word-visible`. **Same tween on both** → they stay locked; the stack slides as one unit.

`yPercent` is relative to **each span’s height**, not the viewport. `+=100` means “add 100% of my height to my current Y position.”

| ScrollTrigger progress | `yPercent` (both children) | What the clip window shows |
|------------------------|----------------------------|----------------------------|
| `0` (start) | `0` | Mostly `.word-visible` (hidden still above band) |
| `0.5` | `~+50` | Hidden entering from top; visible leaving bottom |
| `1` (end) | `+100` | Hidden has passed through; visible below band |

### 3. ScrollTrigger ties progress to **this word’s** scroll trip

```text
viewport
┌────────────────────────────┐  ← top
│                            │
│         55% line ───────────│  ← end: word top here → progress = 1
│                            │
│      ┌─────────┐           │
│      │  .word  │           │  ← trigger element (the mask box)
│      └─────────┘           │
│                            │
└────────────────────────────┘  ← bottom
              ▲
              └── start: word bottom here → progress = 0
```

- **`trigger: word`** — progress is based on where **that word’s rectangle** crosses the viewport, not the page root. Eight words → eight independent triggers → staggered reveal as you scroll the headline.
- **`start: "bottom bottom"`** — animation at 0% when the **bottom edge** of the word meets the **bottom** of the viewport (word entering from below).
- **`end: "top 55%"`**** — animation at 100% when the **top edge** of the word reaches **55% down** the viewport (word has moved well upward). The band is long: you scrub through the full `yPercent` change while the word travels that distance.
- **`scrub: 0.4`** — scroll position sets a *target* progress; the tween catches up over ~0.4s. Stop scrolling mid-band and the text eases to a stop (`expo.inOut` shapes that catch-up).

### Side view during scrub (one word)

```text
progress 0          progress 0.5           progress 1
──────────          ────────────           ──────────
[hidden]            [hidden]               [hidden]
  ↑ clip top          ┌clip┐                 ┌clip┐
  │                   │both│  overlap       │    │
[visible]             └clip┘                 └clip┘
  in window           [visible]                [visible]
                      leaving                  below
```

---

## Function call sequence

```text
DOMContentLoaded
    │
    ├─> Lenis({ autoRaf: true })
    │
    ├─> gsap.to('.scroll', { autoAlpha, scrollTrigger on body })
    │       └─> separate: hint fade, not clip-related
    │
    └─> querySelectorAll('.mwg_effect015 .word')
            └─> forEach word
                    └─> gsap.to(word.children, { yPercent += 100, scrollTrigger })
                            └─> clip-path on word gates visibility
```

---

## The tricky part

**`clip-path` is on the parent; `yPercent` is on the children.** ScrollTrigger does not know about the mask. It only reports progress `0–1` for the `.word` box’s position. GSAP moves the **contents**; the **parent** decides which pixels survive.

If you animate `yPercent` on `.word` instead of `.word.children`, you move the clip window and the text together — no slide-through effect. If you remove `clip-path` but keep the tween, both layers stay visible and you get stacked duplicate text. If you remove `translate(0, -100%)` on `.word-hidden`, both layers start inside the band and the reveal has no “approach from above.”

The reveal only works when **three layers agree**:

1. CSS: window (clip) + starting offset (hidden above).  
2. GSAP: both children shift downward in sync.  
3. ScrollTrigger: when that shift happens relative to scroll.

**`scrub` + `expo.inOut` changes how progress *feels*, not where the mask is.** The geometry is entirely CSS + `yPercent`; scroll only schedules it.

---

## Secondary: scroll hint (no clip-path)

`gsap.to('.scroll', { autoAlpha: 0, duration: 0.2, scrollTrigger: { trigger: body, start/end at page top }})` fades the fixed “Scroll” label when the user leaves the top. Independent of the word mask system.
