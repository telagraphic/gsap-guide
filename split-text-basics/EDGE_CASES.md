# SplitText edge cases: line masks and font metrics

This document explains why line-level SplitText masks can clip display serifs (e.g. Editorial New) at tight `line-height`, while char-level splits often look fine. It covers browser typography terms, how clipping occurs in this project, and CSS strategies for future fixes.

---

## Where this shows up in the playground

When split type is **lines**, frames 2 and 6 use line masks and `yPercent` reveal animations:

| Frame | File | Config |
|-------|------|--------|
| 2 | `script.js` | `type: splitType`, `mask: splitType`, `yPercent` reveal |
| 6 | `script.js` | `type: splitType`, `mask: splitType`, `yPercent` reveal |

With **chars**, the same frames use per-character clip regions; clipping is far less noticeable.

Typical repro: **Editorial New**, **line-height ~1.10**, split type **lines**. **Geist** at the same line-height often looks correct.

---

## How browsers draw text

Browsers lay out **rectangular boxes** from font metrics, then paint glyph outlines inside (and sometimes outside) those boxes.

### Font metrics (from the font file)

| Term | Meaning |
|------|---------|
| **em square** | Design grid unit; `1em` = `font-size` in CSS |
| **ascent** | Distance above the baseline (capitals / ascenders) |
| **descent** | Distance below the baseline |
| **line gap** (leading) | Extra space between lines in the font’s default linespacing |
| **cap height** | Height of capital letters |
| **x-height** | Height of lowercase “x” |
| **glyph bounds** / **ink box** | Min/max extents of the actual vector outline |

Design tools show the **glyph outline** (ink). CSS line layout uses **metric boxes**, not the union of all ink bounds.

### CSS line layout terms

| Term | What it is |
|------|------------|
| **line box** | Rectangle reserved for one line in inline layout |
| **`line-height`** | Desired height of the line box (unitless, length, or `%`) |
| **half-leading** | Extra space above/below when `line-height` exceeds content height |
| **strut** | Anonymous inline on each line using parent `font-size` / `line-height` / `font-family` |
| **baseline** | Alignment line glyphs sit on |
| **content area** | Roughly ascent + descent from font metrics (browser-specific rounding) |
| **overflow** | Ink or decorations painting outside the padding edge |

Unitless `line-height: 1.10` means: line box height ≈ `1.10 × font-size`.

### Ink vs layout box

- **Layout box** (line box): from `font-size`, `line-height`, ascent/descent/line-gap.
- **Glyph ink**: actual Bézier paths; can extend **above ascent** or **below descent** (swashes, diacritics, serif overshoots).

```
  INK (what you see)              LAYOUT (what CSS measures)
  ─────────────────              ───────────────────────────

       ┌── overshoot ──┐
       │   ╱‾‾‾╲       │              ┌─────────────────┐  ← top of line box
       │  │  H  │       │              │                 │
       │  │     │       │   vs         │   content area  │  ← ascent + descent
       │   ╲___╱        │              │                 │
       └── descender ───┘              └─────────────────┘  ← bottom of line box
            may extend                      line-height
            past line box                   fixes this height
```

> **The full glyph outline is not required to fit inside the line box.**  
> Browsers may paint outside it unless something clips (`overflow`, `visibility: clip`, `clip-path`, mask wrapper).

Geist is tuned for UI text at tight leading. Display serifs (Editorial New) often have more overshoot relative to the same numeric `line-height`. Headlines use `text-transform: uppercase` and large `clamp(2.5rem, 8vw, 6rem)` type in `styles.css`, which magnifies the effect.

---

## SplitText line mask structure

GSAP SplitText with `mask: "lines"` wraps each line in an extra element and clips it (`visibility: clip` in GSAP 3.13+). The animated target is `self.lines`; masks live in `self.masks`.

```
  h1.frame__headline
  │
  ├── [mask wrapper]  ◄── clip region = THIS element’s layout box
  │     │
  │     └── .line     ◄── animated (yPercent 100 → 0)
  │           └── words / chars / glyphs
  │
  ├── [mask wrapper]
  │     └── .line
  ...
```

### Clipping vs ink (ASCII)

```
  Side view — one line, tight line-height (e.g. 1.10)

  MASK CLIP WINDOW (fixed at split / measure time)
  ┌────────────────────────────────────────┐
  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ░ = clipped (invisible)
  ├────────────────────────────────────────┤  ← top of line box / mask
  │                                        │
  │     ████████  visible glyph ink        │
  │     ██    ██                           │
  │     ████████                           │
  │                                        │
  ├────────────────────────────────────────┤  ← bottom of line box / mask
  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
  └────────────────────────────────────────┘

  Editorial New: ascenders / serifs may paint into ░ zones
  Geist:         ink often stays inside the middle band
```

### yPercent animation inside the mask

```
  At yPercent: 100 (line shifted down)     At yPercent: 0 (rest)

  ┌──────────────────┐                   ┌──────────────────┐
  │░░░░░░░░░░░░░░░░░░│                   │░░ clipped top ░░│
  ├──────────────────┤                   ├──────────────────┤
  │                  │                   │   ████████       │
  │                  │                   │   ██    ██       │
  ├──────────────────┤                   ├──────────────────┤
  │   ████████       │                   │░░ clipped bot ░░│
  │   (below view)   │                   └──────────────────┘
  └──────────────────┘
```

The mask window stays fixed; the line moves inside it. If the window is shorter than the ink, tops or bottoms clip even at `yPercent: 0`.

---

## Why “same line-height on mask and text” still clips

`controls.js` applies the same `line-height` to the headline and all descendants (including mask nodes):

```javascript
headline.style.lineHeight = lineHeightValue;
headline.querySelectorAll("*").forEach((el) => {
  el.style.lineHeight = lineHeightValue;
});
```

That keeps typography consistent but does **not** make the clip region equal the **visible ink**.

| Concept | Controls |
|--------|----------|
| CSS `line-height` | Layout line box (strut height) |
| Glyph ink | Painted outline from font metrics |
| Mask clip | Mask wrapper’s box at split/measure time |

Same `line-height` on mask + line ≠ same **visible** height inside the clip.

---

## Font change, then line-height (playground order)

1. **Font change** → `rebuildDemos()` → SplitText splits and builds masks with new font metrics at current line-height.
2. **Line-height change** → `applyTypography()` updates styles immediately; rebuild is debounced (~150ms).

```
  Timeline
  ─────────────────────────────────────────────────────────►

  [Font: Editorial New]     [Line-height: 1.10]
         │                         │
         ▼                         ▼
    full rebuild              styles on all nodes
    masks measured            (mask + line + glyphs)
    at this moment            debounced rebuild later
```

Clipping can appear when:

- Line box is too short for the font’s ink at that `line-height`.
- Mask size was computed for a line box that doesn’t include overshoot.
- Brief mismatch before debounced re-split remeasures lines.

`autoSplit: true` helps on resize and font load; arbitrary line-height tweaks may not remeasure masks until rebuild.

---

## Lines vs chars

```
  CHAR MASK (one clip per glyph)          LINE MASK (one clip per row)

  ┌──┐ ┌──┐ ┌──┐ ┌──┐                    ┌────────────────────────┐
  │ H│ │ E│ │ L│ │ O│                    │ H E L L O   W O R L D    │
  └──┘ └──┘ └──┘ └──┘                    └────────────────────────┘
   ↑    ↑    ↑    ↑                         ↑
   small boxes — ink usually fits          one box — all ascenders must
                                           fit in one line-height band
```

| Split + mask | Clip unit | Typical result |
|--------------|-----------|----------------|
| **chars** | Per character | Small clips; ink usually fits |
| **lines** | Per visual line | One clip per row; tall fonts clip |

---

## Glossary (quick reference)

| Informal | Technical term |
|----------|----------------|
| Font’s ink | Glyph outline, ink bounds, visual extents |
| Layout box | Line box, inline box, content area |
| Line spacing | `line-height`, half-leading, leading |
| Clip from mask | Overflow clipping, `visibility: clip`, clip rectangle |
| Font vertical metrics | Ascent, descent, line gap (`hhea` / `OS/2`) |

---

## CSS mitigation strategies

### 1. Extra vertical room on mask wrappers (recommended)

Target mask elements via SplitText classes. If you set `linesClass: "split-line++"`, GSAP appends `"-mask"` for mask wrappers (e.g. `split-line-mask` — confirm in DevTools after split).

```css
.split-line-mask {
  padding-block: 0.15em; /* tune per font */
  box-sizing: content-box;
}
```

Padding on the mask grows the clip area without changing the headline’s typographic rhythm.

### 2. Looser line-height on masks only

```css
.split-line-mask {
  line-height: 1.25;
}
```

Inner `.line` can keep playground line-height; mask clip box is taller.

### 3. `clip-path: inset()` with negative inset

```css
.split-line-mask {
  clip-path: inset(-0.12em -0.05em);
}
```

Explicitly enlarges the clip region beyond the layout box.

### 4. Font-specific overrides

```css
.frame__headline[data-font="editorial-new"] .split-line-mask {
  padding-block: 0.2em;
}
```

Set `data-font` from the playground when the font changes so serif families get more slack without affecting Geist.

### 5. Re-split after typography changes

For `lines` + masks, ensure rebuild runs after line-height settles so mask dimensions match the new line box. The playground already debounces line-height rebuilds; masked frames benefit most from full `rebuildDemos()`.

### 6. Alternative split/mask granularity

Use `mask: "words"` or `mask: "chars"` for problematic fonts — same tradeoff as choosing chars in the playground.

### 7. Modern trim properties (limited support)

`text-box-trim` / `text-box-edge` (and related proposals) adjust layout boxes toward cap-height / ex-height. Support is still uneven; useful to watch, not a universal fix today.

### 8. Avoid `overflow: visible` on masks for reveals

Stops clipping but breaks curtain-style `yPercent` reveals unless you add a controlled `clip-path`.

---

## Suggested implementation pattern (future)

1. Add `linesClass: "split-line++"` on masked frames (2 & 6) when using line splits.
2. Style `.split-line-mask` (or verified class) in `styles.css` or a dedicated masks partial.
3. Use `padding-block` or negative `clip-path: inset()` on mask wrappers.
4. Optional `data-font` on `.frame__headline` from `controls.js` for serif-specific rules.
5. Keep `autoSplit: true` and rebuild after line-height changes for line splits.

---

## One-line summary

**CSS allocates rectangular line boxes from font metrics; glyphs may paint outside those boxes; line masks clip to the box, not the ink — display serifs at tight `line-height` expose that gap; char masks hide it because each clip is smaller and per-glyph.**

---

## Related files

- `script.js` — frames 2 & 6 mask + `yPercent` setup
- `controls.js` — `applyTypography()` line-height on headline and descendants
- `styles.css` — `--playground-line-height`, `.frame__headline`
- `SPLITTEXT_GUIDE.md` — SplitText API including `mask` and `linesClass`
