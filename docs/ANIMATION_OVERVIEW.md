# MWG 097 — Animation Storyboard

**Effect:** Per-line scroll-scrubbed “justify → natural” word slide  
**Source:** `script.js` · `index.html` · `styles.css`  
**Plugins:** GSAP core, SplitText, ScrollTrigger  
**Note:** Lenis is loaded in `index.html` but not initialized in `script.js` (optional smooth scroll, not part of this effect).

---

## Big Picture

| Aspect                  | Detail                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Driver**              | Scroll (ScrollTrigger), not a time-based timeline                                     |
| **Scrub**               | `0.2` — animation eases toward scroll position with slight lag                        |
| **Transform**           | `translateX` on each `.word` via GSAP `x`                                             |
| **Layering**            | Single document flow — no fixed/sticky animation stage; lines scroll normally         |
| **Pre-animation setup** | SplitText + layout math runs once on load; sets initial `x` offsets before any scroll |
| **Per-unit trigger**    | One ScrollTrigger **per line** (not one global scrub for the whole page)              |

**What the user sees:** Each line of body copy starts with words spread across the full text column (justified to container width). As that line scrolls up into the viewport, words slide horizontally back to their natural left-aligned positions.

**Techniques to be aware of:**

1. **SplitText** wraps each paragraph into `.line` > `.word` DOM, enabling per-word transforms without changing copy in HTML.
2. **Layout math** measures each word’s width and distributes `freeSpace` as equal gaps so the line visually fills `.container` width before scroll.
3. **`gsap.set` + `gsap.to`** — initial spread is instant; scroll animates `x` from spread offset → `0`.
4. **CSS `width: max-content` on `.line`** keeps lines measurable as a single row; **`will-change: transform` on `.word`** hints compositing for many simultaneous transforms.

---

## ASCII Storyboard (scroll-scrubbed, per line)

Each `.line` owns its own ScrollTrigger. Progress maps scroll position between `start` and `end`.

```
VIEWPORT
══════════════════════════════════════════════════════════════

LINE POSITION          scroll progress    word transform (x)
──────────────────────────────────────────────────────────────

BEFORE TRIGGER         (inactive)         x = deltaX (justified spread)
line below viewport
│
│  ... content above ...
│
▼ start: "top bottom"
   line top hits viewport bottom

SCRUB ZONE             0 → 1              x: deltaX → 0
(line moving up)       scrub: 0.2         ease: power2.out (toward target)
│
│  words visually slide from full-width
│  justified layout back to natural flow
│
▼ end: "top 60%"
   line top hits 60% from top of viewport

AFTER END              (rest)             x = 0 (natural positions)

Legend: deltaX = per-word offset computed at init (targetLeft − currentLeft)
```

### Shot list (plain English)

```
 * ANIMATION STORYBOARD (scroll-scrubbed, one trigger per .line)
 *
 * ON LOAD (instant, no ScrollTrigger)
 *   Split each <p> into lines + words (SplitText)
 *   For each line: measure words, compute gap to fill container width
 *   Set each word x = deltaX  →  line appears fully justified
 *
 * SCROLL (per line, independent)
 * progress 0.00   line top at viewport bottom     words x = deltaX (spread)
 * progress 0.50   mid scrub zone                  words x ≈ 50% toward 0
 * progress 1.00   line top at 60% viewport        words x = 0 (natural)
 *
 * scrub 0.2 — values ease toward scroll with slight lag
 * ease power2.out on the tween toward x: 0
 */
```

---

## Scroll Progress (replaces TIMING)

There is no global millisecond timeline. Use scroll mapping per line:

```javascript
const SCROLL = {
  start: "top bottom", // trigger arms when line top hits viewport bottom
  end: "top 60%", // completes when line top hits 60% from viewport top
  scrub: 0.2, // lag/smoothing toward scroll position
  ease: "power2.out", // easing on the scrubbed tween to x: 0
};
```

---

## Element Config Objects

```javascript
/* SplitText — paragraph → lines → words */
const SPLIT = {
  type: "lines, words",
  linesClass: "line",
  wordsClass: "word",
};

/* Justification layout (computed per line on load) */
const LAYOUT = {
  measureFrom: ".container", // clientWidth for target line width
  gapFormula: "freeSpace / gaps", // gaps = wordCount - 1
  minFreeSpace: 0, // Math.max(containerWidth - totalWordsWidth, 0)
};

/* Word transform */
const WORD = {
  property: "x",
  from: "deltaX", // gsap.set per word after layout math
  to: 0, // natural inline position
};

/* ScrollTrigger (applied to all words in a line as a group) */
const LINE_SCROLL = {
  trigger: "line", // each .line element
  start: "top bottom",
  end: "top 60%",
  scrub: 0.2,
  ease: "power2.out",
};
```

---

## HTML ↔ CSS ↔ JS Connections

### DOM structure (after SplitText)

```
.mwg_effect097
  └── .container
        └── .content
              └── p (×6 paragraphs in markup)
                    └── .line (×N per paragraph)
                          └── .word (×M per line)
```

HTML provides raw `<p>` copy only. All line/word wrappers are injected by SplitText at runtime.

### CSS → initial paint → GSAP

| Selector         | Property                                 | Role in animation                                                                 |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| `.mwg_effect097` | `padding: calc(100vh - 80px) 25px 100vh` | Tall scroll runway; lines enter/exit viewport over a long distance                |
| `.mwg_effect097` | `overflow: hidden`                       | Clips section; does not affect word `x`                                           |
| `.content p`     | `width: 60%`, `margin: 0 auto`           | Defines text column width — **same width** used in JS via `container.clientWidth` |
| `.content p`     | `font-size: max(18px, 3vw)`              | Affects word measurements at init (resize not re-run)                             |
| `.line`          | `width: max-content`                     | Line stays one row for width summation in layout math                             |
| `.word`          | `will-change: transform`                 | Compositor hint before GSAP sets `transform: translateX`                          |

**Order of operations:**

1. CSS lays out paragraphs at 60% centered column width.
2. SplitText splits text; `.line` / `.word` inherit typography from `p`.
3. JS reads `container.clientWidth` and each word’s `getBoundingClientRect()` **before** any scroll animation.
4. `gsap.set(word, { x: deltaX })` overrides natural inline positions → justified look.
5. ScrollTrigger scrubs `x` back to `0` as each line crosses the viewport band.

### Measurement detail (why `deltaX` exists)

For each line, words are measured in their **natural** flow positions. The script then computes where each word _should_ sit if the line were fully justified (`targetLeft` + `gapSize`), and sets `x = targetLeft - currentLeft`. That visually spreads words without changing DOM order. Scrolling reverses that offset.

---

## Paragraph inventory

| #   | Class   | Content role                                     |
| --- | ------- | ------------------------------------------------ |
| 1   | `title` | Section heading — “1 — An Ever-Expanding Cosmos” |
| 2   | (body)  | Paragraph 1 body                                 |
| 3   | `title` | Section heading — “2 — Light as a Measure…”      |
| 4   | (body)  | Paragraph 2 body                                 |
| 5   | `title` | Section heading — “3 — The Uncertain Future…”    |
| 6   | (body)  | Paragraph 3 body                                 |

Every `<p>` inside `.content` is split and animated the same way (titles included).

---

## Dependencies & registration

`index.html` loads GSAP, SplitText, and ScrollTrigger from CDN. `script.js` assumes `SplitText` and `ScrollTrigger` are registered globally (typical when using GSAP 3.15+ CDN bundles). No explicit `gsap.registerPlugin()` appears in this file.

---

# Code Overview

How lines go from **natural** (left-clustered) → **spread** (full column) on load, then back to **natural** on scroll.

---

## 1. What’s on the page

After SplitText, each paragraph becomes lines of words:

```
.container                    ← column width + horizontal origin
  └── .content
        └── p
              └── .line        ← ScrollTrigger watches THIS (not animated)
                    ├── .word  ← animated with GSAP `x` (translateX)
                    ├── .word
                    └── ...
```

| Element      | Animated? | Job                                                                                    |
| ------------ | --------- | -------------------------------------------------------------------------------------- |
| `.container` | No        | `clientWidth` = how wide to spread; `getBoundingClientRect().left` = column’s X origin |
| `.line`      | No        | Scroll “ruler” — one trigger per line                                                  |
| `.word`      | Yes       | `x` moves each word horizontally                                                       |

---

## 2. Setup once per page (lines 13–15)

```javascript
const containerWidth = container.clientWidth; // e.g. 600px
const containerRect = container.getBoundingClientRect(); // where column starts in viewport
```

`getBoundingClientRect()` on the container gives viewport position. Word positions use:

**`currentLeft = word.rect.left - containerRect.left`**  
→ “how far is this word from the **left edge of the column**?”

---

## 3. Per line — spread math (lines 17–38)

Each `.line` runs the same recipe.

### Sample line

**Text:** `"The universe is"`  
**Container:** `containerWidth = 600px`  
**Word widths:** 40 + 80 + 30 = **150px** (`totalWordsWidth`)

### Step A — Measure & divide leftover space

```javascript
const gaps = words.length - 1; // 3 words → 2 gaps
const freeSpace = Math.max(containerWidth - totalWordsWidth, 0); // 600 - 150 = 450
const gapSize = gaps > 0 ? freeSpace / gaps : 0; // 450 / 2 = 225px
```

```
|←────────────── containerWidth: 600 ──────────────→|
|                                                   |
|  [The][universe][is]  ← 150px of actual text       |
|  ░░░░░░░░░░░░░░░░░░░  ← 450px freeSpace           |
|         split into 2 equal gaps of 225px          |
```

### Step B — Place each word with `targetLeft` + `deltaX`

`targetLeft` = **cursor**: “where should **this** word’s left edge be in the spread layout?”

Starts at `0`. Updates **once per word**, **after** `gsap.set` — so the value at the **start** of each loop is for the **current** word; line 37 advances it for the **next** word.

```javascript
let targetLeft = 0;

words.forEach((word, index) => {
  const currentLeft = rect.left - containerRect.left; // natural position in column
  const deltaX = targetLeft - currentLeft; // how far to nudge with transform

  gsap.set(word, { x: deltaX }); // spread layout (instant)

  targetLeft += rect.width + (index < words.length - 1 ? gapSize : 0);
});

words.forEach((word, index) => {
  const rect = word.getBoundingClientRect();
  const currentLeft = rect.left - containerRect.left;
  const deltaX = targetLeft - currentLeft;

  gsap.set(word, { x: deltaX });

  targetLeft += rect.width + (index < words.length - 1 ? gapSize : 0);
});
```

### Worked table (natural positions approximate)

| Word     | Natural `currentLeft` | `targetLeft` (use first) | `deltaX`            | After line 37, `targetLeft` becomes |
| -------- | --------------------- | ------------------------ | ------------------- | ----------------------------------- |
| The      | 0                     | 0                        | 0 − 0 = **0**       | 0 + 40 + 225 = **265**              |
| universe | ~45                   | 265                      | 265 − 45 = **220**  | 265 + 80 + 225 = **570**            |
| is       | ~130                  | 570                      | 570 − 130 = **440** | 570 + 30 + 0 = 600 (done)           |

### Diagram — natural vs spread

**Before `gsap.set` (`x = 0`) — natural**

```
|←──────────────────── 600px column ────────────────────→|
|  [The] [universe] [is]                                 |
|  0     ~45        ~130                                 |
|  └── clustered left, big empty area on the right ────┘
```

**After `gsap.set` (`x = deltaX`) — spread**

```
|←──────────────────── 600px column ────────────────────→|
|  [The]          [universe]          [is]               |
|  0              265                 570                |
|  |←── 225 ──→|  |←── 225 ──→|                         |
|       gapSize       gapSize                            |
|  └── words span full width ────────────────────────────┘
```

### One word — how the numbers connect

```
     .container
     ┌────────────────────────────────┐
     │  ○ currentLeft (natural)       │
     │  ● targetLeft  (spread goal)   │
     │                                │
     │  deltaX = ● − ○                │
     │  gsap.set(x: deltaX)  →  ○ ──→ ●
     └────────────────────────────────┘
```

### `targetLeft` cursor (why update **after** `deltaX`)

```
START  targetLeft = 0
       │
       ├─ word 0: USE 0    → set x → THEN += width + gap  → 265
       ├─ word 1: USE 265  → set x → THEN += width + gap  → 570
       └─ word 2: USE 570  → set x → THEN += width only  → done
```

Updating **before** `deltaX` would use the _next_ slot for the _current_ word and break alignment.

---

## 4. On scroll — back to natural (lines 40–49)

```javascript
gsap.to(words, {
  x: 0,
  scrollTrigger: {
    trigger: line,
    start: "top bottom", // progress 0: line top hits viewport bottom
    end: "top 60%", // progress 1: line top at 60% down viewport
    scrub: 0.2,
  },
});
```

`targetLeft` is **not** used here. Scroll only tweens each word’s `x` from its `deltaX` → `0`.

```
SCROLL (one line)
═══════════════════════════════════════════════════

  BEFORE          SCRUBBING              AFTER
  (below start)   (start → end)          (past end)

  x = deltaX      x: 440 → 220 → 0      x = 0
  SPREAD          BLEND                  NATURAL

  [The]    [universe]    [is]     →    [The] [universe] [is]
```

All words on the line move **together** (one tween, shared progress).

---

## 5. Full story in one flow

```
PAGE LOAD                         USER SCROLLS
    │                                  │
    ▼                                  ▼
┌─────────────┐                 ┌──────────────┐
│ Measure     │                 │ gsap.to      │
│ gapSize     │                 │ x → 0        │
│ targetLeft  │                 │ ScrollTrigger│
│ gsap.set    │                 └──────────────┘
└─────────────┘                        │
    │                                  ▼
    ▼                            NATURAL (clustered)
 SPREAD (full 600px)
```

| Phase      | What changes          | Sample: “universe”                      |
| ---------- | --------------------- | --------------------------------------- |
| Load       | `gsap.set(x: deltaX)` | `x: 220` (pushed right)                 |
| Mid-scroll | scrub                 | `x: ~110`                               |
| Done       | resting               | `x: 0` (natural ~45px from column left) |

---

## 6. Variable cheat sheet

| Variable             | What it is                                                         |
| -------------------- | ------------------------------------------------------------------ |
| `containerWidth`     | Target row width (600)                                             |
| `containerRect.left` | Column origin for local X math                                     |
| `totalWordsWidth`    | Sum of word widths (150)                                           |
| `freeSpace`          | Room left in column (450)                                          |
| `gapSize`            | Equal space between each word pair (225)                           |
| `targetLeft`         | Justified left edge for **current** word; advances after each word |
| `currentLeft`        | Natural left edge in column                                        |
| `deltaX`             | `targetLeft - currentLeft` → `gsap.set` then scrubs to 0           |

---

## 7. Remember

1. **Spread** = layout math + `gsap.set` at load (uses `targetLeft`).
2. **Natural** = scroll scrubs `x` to `0` (ignores `targetLeft`).
3. **Each line** = its own math + its own ScrollTrigger.
4. **Transforms only** — DOM order stays the same; words **look** farther apart.

That’s the whole effect: measure natural positions, compute full-width slots, jump words into those slots, then scroll pulls them home.
