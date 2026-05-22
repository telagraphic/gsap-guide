> Full version: [EXPLANATIONS.md](./EXPLANATIONS.md)

# Clip-path + scroll reveal (dumb simple)

**Idea:** `.word` is a **fixed mail slot**. Two copies of the same text slide down through it on scroll. The slot never moves — only the text does.

```css
/* style.css — on .word, not the inner spans */
clip-path: polygon(0 2%, 0 98%, 100% 98%, 100% 2%);
```

That polygon = horizontal band (~2%–98% of the word box). Anything outside is invisible. **2%/98%** trims font ink that bleeds past a tight `line-height: 0.8` box.

```html
<span class="word">
  <span class="word-hidden">Soundtrack®</span>   <!-- absolute, translate(0,-100%) -->
  <span class="word-visible">Soundtrack®</span>  <!-- in flow, starts in slot -->
</span>
```

| Copy | Starts | After scroll (`yPercent` 0→100) |
|------|--------|----------------------------------|
| visible | In the slot | Below the slot (clipped away) |
| hidden | One line above (clipped away) | In the slot |

```
START                          END
 [hidden]                         [hidden] ← in slot ✓
════════ slot ════════           ════════ slot ════════
 [visible]                        [visible] ← below slot
```

`clip-path` only **cuts**; GSAP **`yPercent`** on **both** children **slides** them. Reveal = conveyor belt through a peephole.

---

# `x` / `y` vs `xPercent` / `yPercent`

GSAP moves via **`transform`** (not `top`/`left`). Layout box stays put; pixels slide.

| GSAP | Means |
|------|--------|
| `x`, `y` | px (default) |
| `xPercent`, `yPercent` | % of **this element’s** width / height |

Pair by axis: `x`↔`xPercent`, `y`↔`yPercent`. Not interchangeable across axes.

**This effect uses `yPercent: '+=100'`** so each word moves **one of its own line heights** — matches CSS `translate(0,-100%)` on hidden. `y: 60` would move every word 60px (wrong for mixed word sizes).

```
hidden:  -100% (CSS) + 100% (GSAP) ≈ 0%   → fills slot
visible: 0% + 100% (GSAP)              → leaves slot below
```

**Moves:** child `transform`. **Fixed:** parent `clip-path`, layout slot size. **`+=100`:** add 100% on top of current transform (stacks with CSS).

---

# Layout, paint, composite (one model)

**Not three DOM copies.** One `<span>` passes through a **pipeline** each frame. “Layout vs painted” = **different steps**, not parallel planes.

```
DOM + CSS  →  layout  →  paint  →  composite  →  screen
              (boxes)   (pixels)  (GPU stack)
```

| Stage | What you get | Updates when… |
|-------|----------------|---------------|
| **Layout** | Box: x, y, w, h, line breaks — where flow/scroll think it lives | `width`, `height`, `font-size`, content, `display`, etc. |
| **Paint** | Glyphs, fills, **`clip-path`** cut on `.word` | Color, mask, text, invalidation |
| **Composite** | Final pixels; **`transform`** / `opacity` on GPU layers | GSAP `yPercent` every scrub frame (often cheap) |

**Stack** only at composite: sheets blended (background → photo → words → scroll label). Not every element gets its own GPU layer — browsers promote animated `transform` when worth it.

---

## Layout box vs what you see

**Layout** = reserved space in the document (siblings wrap around it).  
**Transform** = move the **drawn** text without moving that reservation.

```
LAYOUT (slot stays in headline)     PAINTED (after yPercent)
┌─────────────┐                            ┌─────────────┐
│   "sound"   │                            │   "sound"   │  ← shifted down
└─────────────┘                            └─────────────┘
```

Neighbors don’t jump — the box didn’t reflow. GSAP uses `transform` to skip reflow; that’s why the headline doesn’t wiggle on scroll.

---

## Resize vs transform

| You change | Pipeline |
|------------|----------|
| `width`, `height`, `margin`, `font-size`… | Layout → usually paint → composite |
| `transform`, `opacity` (often) | Often **composite only** (layout box unchanged) |

**Caveats:** `clip-path` on `.word` is paint-time (fixed here). Forcing `getBoundingClientRect()` during tweens can trigger layout sync and jank.

---

## Don’t mix up “layer”

| Term | Meaning |
|------|---------|
| **Layout box** | Space in the document |
| **Stacking context** | Paint order (`z-index`, `transform`, etc.) |
| **Compositor layer** | GPU texture + matrix — what moves cheaply |

Better phrase: **layout box** (geometry) vs **compositor layer** (pixels on screen).

---

## Your word effect on this pipeline

```
.word           layout size from .word-visible  |  clip-path masks at paint
  .word-visible in flow                         |  yPercent slides at composite
  .word-hidden  absolute (out of flow)         |  -100% CSS + yPercent slides
```

| Piece | Layout | Paint | Composite |
|-------|--------|-------|-----------|
| `.word` | Inline slot in headline | `clip-path` window | — |
| `.word-visible` | Defines `.word` size | Glyphs | `yPercent` ↓ |
| `.word-hidden` | No extra flow space | Glyphs above slot | `yPercent` ↓ |

**Slot stays put** in the sentence; **textures slide** through the mask. You see motion; you don’t see reflow.

**Not:** two DOM nodes on “layout plane” + “compositor plane.” **Yes:** one node → box → painted pixels → matrix moves pixels each frame.
