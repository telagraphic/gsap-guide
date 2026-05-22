# MWG 097 — Animation Audit

**Audited:** `script.js` (51 lines)  
**Context:** [`ANIMATION_OVERVIEW.md`](ANIMATION_OVERVIEW.md)  
**Focus requested:** Variable naming and readability

---

## Code Flow

```
DOM ready (implicit — script at end of body)
    │
    ├─> querySelector(".mwg_effect097")          → root
    ├─> querySelector(".container")              → container
    ├─> querySelectorAll(".content p")           → paragraphs
    │
    ├─> For each paragraph:
    │       └─> SplitText.create()
    │               type: "lines, words"
    │               → injects .line / .word wrappers
    │
    ├─> querySelectorAll(".line")                → lines (all paragraphs)
    ├─> container.clientWidth                    → containerWidth (once)
    ├─> container.getBoundingClientRect()        → containerRect (once)
    │
    └─> For each line:
            ├─> querySelectorAll(".word")        → words
            ├─> reduce(getBoundingClientRect)    → totalWordsWidth
            ├─> gaps, freeSpace, gapSize         → justify gap math
            │
            ├─> For each word:
            │       ├─> getBoundingClientRect()  → rect (again)
            │       ├─> currentLeft, deltaX
            │       ├─> gsap.set(word, { x: deltaX })
            │       └─> targetLeft += width + gap
            │
            └─> gsap.to(words, { x: 0, scrollTrigger })
                    trigger: line
                    start: "top bottom" / end: "top 60%" / scrub: 0.2
```

**Effect in one sentence:** Split text into words, instantly spread each line to full column width via `x`, then scrub `x` back to `0` as each line scrolls through the viewport.

---

## First Impressions

The animation logic is correct and small enough to hold in your head, but it reads like a one-off demo script, not a teachable module. The biggest friction is naming: `gaps`, `rect`, `root`, and `deltaX` do not share a vocabulary, so you re-derive meaning on every read. `targetLeft` is the one name that almost carries its intent — the rest of the file should match that clarity. The second issue is structure: measurement, layout math, initial transform, and ScrollTrigger creation are fused inside nested `forEach` callbacks with magic strings for scroll positions. That works for a single page effect, but it blocks reuse, testing, and safe refactors when you drop this into another project.

---

## Overall Design Architecture

Today the file is **procedural top-level code** — no entry function, no config block, no cleanup, no guards. For a GSAP guide repo, that is acceptable as a starting point; for production or reuse, it should become a **small self-contained initializer** (function or class) that accepts a root element and optional config, returns a `revert()` or `gsap.context()` cleanup, and keeps scroll + layout constants in one `SCROLL` / `LAYOUT` object at the top (per the storyboard pattern in `storyboard.md`).

| Approach | Fit for this effect | Notes |
|----------|---------------------|-------|
| **Procedural + config constants** (minimal refactor) | High | Lowest risk; fixes naming, magic numbers, extracted functions |
| **`gsap.context()` wrapper function** | High | Standard GSAP 3 pattern; kills tweens/triggers on teardown |
| **Class / custom element** | Medium | Good if multiple `.mwg_effect097` instances on one page |
| **Single master timeline** | Low | Wrong tool — scroll progress is per-line, not global time |
| **ScrollTrigger.batch()** | Low–Medium | Possible for many lines, but changes scrub feel; not needed until line count is huge |

Recommended target: **config constants + 3 named functions + `gsap.context()`**, without over-abstracting.

---

## Table of Fixes/Refactors

| Issue/Problem | Refactor/Fix | Why | Priority/Impact |
|---------------|--------------|-----|-----------------|
| **Inconsistent naming** — `root`, `rect`, `gaps`, `deltaX`, `acc` use different vocabularies; `gaps` reads like a size, not a count | Adopt one domain lexicon: **column** (container bounds/width), **line** (row of words), **spread** (justified layout), **natural** (flow at `x: 0`). Example renames below | You asked for naming as priority; shared terms let the storyboard comment and code read the same way | **High** |
| **`gaps` vs `gapSize`** — easy to confuse count with pixels | `gapCount` and `spreadGapPx` (or `justifyGapWidth`) | Prevents off-by-one mental swaps when debugging spacing | **High** |
| **`rect` on line 31** — generic; shadows `containerRect` | `wordRect` | Makes the two coordinate spaces obvious in reviews | **High** |
| **`deltaX`** — correct math label, weak domain label | `spreadOffsetX` or `justifyOffsetX` | Tells you *why* the transform exists, not only that it is an X delta | **High** |
| **`targetLeft` / `currentLeft`** — good direction; asymmetric | `spreadLeftEdge` and `naturalLeftInColumn` | Pairs describe the two layouts the scroll animation bridges | **High** |
| **`freeSpace`** — vague | `extraColumnWidth` or `remainingSpreadWidth` | Tied to `containerWidth - totalWordsWidth` formula | **Med** |
| **`root`** — framework-ish, not semantic | `effectSection` or `effectRoot` | Matches `.mwg_effect097` purpose | **Med** |
| **`acc` in reduce** | `sumWordWidth` | Full words in accumulators aid scanability | **Low** |
| **Magic numbers in ScrollTrigger** — `"top bottom"`, `"top 60%"`, `scrub: 0.2`, `ease` inline | `const SCROLL = { start, end, scrub, ease }` at file top | Single place to tune; matches storyboard / TIMING pattern | **High** |
| **No file-level storyboard comment** | ASCII storyboard + config block above code | Readable-over-clever principle from skill; scan sequence without reading loops | **High** |
| **All logic in nested `forEach`** — hard to test or reuse | Extract: `splitParagraphs()`, `computeSpreadGap(words, columnWidth)`, `applySpreadOffsets(words, ...)`, `attachLineScrollReveal(words, line, scrollConfig)` | Each function maps to one phase in the flow diagram | **High** |
| **`getBoundingClientRect()` called twice per word** — once in `reduce`, again in placement loop | One pass: map words to `{ el, width, naturalLeftInColumn }`, then sum widths | Cuts layout thrashing on long copy (dozens of words × 2 calls) | **Med** |
| **`containerRect` captured once at load** — fine if layout is stable; wrong if fonts shift after | Await `document.fonts.ready` (or `window.load`) before measuring; call `ScrollTrigger.refresh()` after | Web fonts change word widths → wrong `spreadOffsetX` and visible jump | **High** |
| **No null guards** — missing `.mwg_effect097` throws on line 2 | Early return if `!effectSection \|\| !container` | Safer embed in partials / CMS templates | **Med** |
| **No `gsap.registerPlugin(ScrollTrigger, SplitText)`** | Explicit register at top (even if CDN auto-registers) | Documents dependencies; avoids silent failures when bundle order changes | **Med** |
| **No cleanup API** — triggers/tweens linger if section removed | Wrap in `gsap.context(() => { ... }, effectSection)`; return `ctx.revert` | Required for SPAs, View Transitions, or hot reload | **Med** |
| **No resize / refresh handling** | `ScrollTrigger.addEventListener("refreshInit", ...)` or debounced resize to re-run spread math | `containerWidth` and word widths change on breakpoint; current offsets go stale | **Med** |
| **Lenis loaded in HTML, unused** | Either wire `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker` lag, or remove script tag | Dead dependency confuses scroll behavior expectations | **Low** |
| **Single-word lines** — `gapCount === 0` still runs placement loop | Guard: if `words.length < 2`, skip spread math (offsets stay 0) | Micro-clarity; avoids pointless gap division branch | **Low** |
| **SplitText options inline** | `const SPLIT = { type, linesClass, wordsClass }` | Same config pattern as scroll; easier to retune classes with CSS | **Low** |

---

## Naming System (recommended)

Use **four roles** in every name: *what* (column / line / word), *layout* (natural / spread), *measure* (width / left edge / offset), *unit* when needed (`Px`, `Count`).

### Variable rename map

| Current | Proposed | Role |
|---------|----------|------|
| `root` | `effectSection` | DOM scope for the effect |
| `container` | `textColumn` | Width reference + horizontal origin |
| `containerWidth` | `columnWidthPx` | Target spread width |
| `containerRect` | `columnBounds` | `getBoundingClientRect()` of column |
| `lines` | `textLines` | Each `.line` row |
| `words` | `lineWords` | Words in one line |
| `totalWordsWidth` | `lineWordsWidthSumPx` | Sum of glyph boxes |
| `gaps` | `spreadGapCount` | Number of gaps between words |
| `freeSpace` | `remainingSpreadWidthPx` | Column minus word sum |
| `gapSize` | `spreadGapPx` | Pixels per gap |
| `targetLeft` | `spreadLeftEdgePx` | Cursor for justified positions |
| `currentLeft` | `naturalLeftInColumnPx` | Flow position before transform |
| `deltaX` | `spreadOffsetX` | `gsap` `x` from natural → spread |
| `rect` | `wordRect` | Per-word measurement |

### Function rename sketch

```text
initJustifiedLineReveal(effectSection)
  splitContentParagraphs(textColumn)
  measureColumn(textColumn)           → { columnWidthPx, columnBounds }
  for each textLine:
    layout = computeLineSpreadLayout(lineWords, columnWidthPx, columnBounds)
    applySpreadOffsets(layout)
    attachLineScrollReveal(lineWords, textLine, SCROLL)
```

---

## Teaching notes (why naming wins here)

The animation has **two coordinate stories**: natural flow positions from the DOM, and spread positions from your cursor math. Names should encode which story a value belongs to (`naturalLeftInColumnPx` vs `spreadLeftEdgePx`). `deltaX` only says “difference in X”; `spreadOffsetX` says “how far we pushed the word to justify the line” — which is exactly what scroll will ease back to zero.

`gaps` is the most dangerous name in the file: in CSS and typography, “gap” almost always means a length. Here it is a **count**. Renaming to `spreadGapCount` vs `spreadGapPx` removes an entire class of debugging mistakes.

---

## Suggested refactor order

1. Add `SCROLL` / `SPLIT` config constants + storyboard comment (no behavior change).  
2. Rename variables to the lexicon above (mechanical, high clarity win).  
3. Extract the four functions; single-pass word measurement.  
4. `document.fonts.ready` + `ScrollTrigger.refresh()`.  
5. `gsap.context()` + null guards.  
6. Resize refresh (if the effect ships beyond a fixed demo page).

---

## What is already solid

- **Per-line ScrollTrigger** is the right model; one global scrub would break independent line timing.  
- **`gsap.set` then `gsap.to({ x: 0 })`** correctly separates initial spread from scroll-driven return.  
- **`Math.max(..., 0)` on free space** avoids negative gaps when words overflow the column.  
- **CSS `will-change: transform` on `.word`** matches the transform-heavy approach.

---

*Next step:* `/gsap-code refactor` to apply the naming system and extracted functions in `script.js`, or pick a subset (naming-only pass first).
