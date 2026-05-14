# Scroll-linked gallery animation — reference

This document explains **layering**, **timing**, **what transforms change**, and **how centering + sizing** work together so you can re-read it later and **recreate or adapt** the effect.

**Source files:** `index.html`, `styles.css`, `main.js` (Lenis + `ScrollTrigger.refresh` wiring), `gallery-scrub-factory.js` / `gallery-scrub-class.js` (scrub logic). Pair chapters with **`data-gallery-id`** on `.gallery-viewport` and `.gallery-scroll-track`.

---

## 1. Big picture

- A **fixed fullscreen “stage”** (`.gallery-viewport` → `.gallery-grid`) stays in the viewport.
- The **rest of the page** (`.container`: hero, intro, `gallery-scroll-track`, outro, `footer`) **scrolls on top** in normal document flow.
- **No `gsap.to()` timeline** on elements: one `ScrollTrigger` with **`scrub: 1`** runs **`onUpdate`**, which sets **`element.style.transform`** from **`self.progress`** (0 → 1) while the user scrolls through a long **transparent** section **`.gallery-scroll-track`** (`600vh`).
- **Lenis** smooths scroll and calls **`ScrollTrigger.update`** so scrubbed values stay in sync.

---

## 2. Layering and timing (combined)

Read the experience as **scroll position**, not wall-clock time. **`self.progress`** is the single “clock” for the motion: **0** at the trigger **start**, **1** at the **end**.

### 2.1 Stack (who paints where)

| Layer | Role |
|--------|------|
| **`.gallery-viewport`** | `position: fixed`, `100vw` × `100vh`, `overflow: hidden`, dark background. This is the **viewport frame** that **clips** the gallery. |
| **`.gallery-grid`** | `position: fixed`, sized and centered (see §5). The **image grid** lives here. |
| **`.container` sections** | In-flow sections scroll **above** the fixed stage (later in DOM). Opaque sections (e.g. hero, intro) **cover** the gallery; **`.gallery-scroll-track`** is **transparent** so the fixed gallery **reads as the focus** during that segment. |

**`.gallery-scroll-track` is not the parent of the gallery in the DOM.** It is only the **ScrollTrigger trigger** (a scroll “ruler”) plus a **600vh spacer** so there is enough scroll distance to move `progress` from 0 to 1. Use **`data-gallery-id`** on the track and matching **`.gallery-viewport`** for multi-chapter setups.

### 2.2 Phases (progress vs what you see)

| Phase | Scroll / viewport | What you perceive | What the code is doing |
|--------|-------------------|-------------------|-------------------------|
| **Before `.gallery-scroll-track` enters** | Hero / intro dominate (opaque backgrounds). | Mostly page content, not the gallery stage. | Trigger not in range; transforms may still be at defaults or last values. |
| **Start of range** | `start: "top bottom"` — **top** of `.gallery-scroll-track` meets **bottom** of viewport. | Beginning of the “gallery chapter.” | `progress` → **0**. |
| **Inside `.gallery-scroll-track`** | `600vh` of scroll while `.gallery-scroll-track` moves through. | Transparent section → **fixed gallery** is the visual focus; grid **zooms**, sides **slide down**, center **hero image scales down**. | `onUpdate` runs; **`progress` 0 → 1** maps to transform math. **`scrub: 1`** smooths values to scroll. |
| **End of range** | `end: "bottom bottom"` — **bottom** of `.gallery-scroll-track` meets **bottom** of viewport. | Motion reaches its **end state** for this setup. | `progress` → **1**. |
| **After `.gallery-scroll-track`** | Outro / footer scroll over again. | Page content returns. | Trigger inactive; **this project does not reset** inline transforms on leave (optional improvement). |

### 2.3 Storyboard (scroll-native + optional mental clock)

There are **no fixed milliseconds** in code — motion is **scrubbed to scroll**. Use **`progress`** (0 → 1) as the authoritative timeline. If it helps to think in time, pick any “virtual duration” **T**; then **ms ≈ progress × T** (ratios only).

```text
/* ────────────────────────────────────────────────
 * ANIMATION STORYBOARD (scroll-scrubbed via .gallery-scroll-track)
 *
 * progress: 0 at start: "top bottom"
 *           1 at end:   "bottom bottom"
 * scrub: 1 — values ease toward scroll position
 *
 * LAYERING: fixed .gallery-viewport + .gallery-grid under scrolling
 *           .container; scroll track section is transparent (see §2.1–2.2).
 *
 * progress 0.00    Gallery: translate(-50%,-50%) scale(1)
 *                  Sides:   translateY(0px)
 *                  Main img: scale(2)
 *
 * progress 0.25    scale ≈ 1 + 0.25×maxScale;  sides +75px;
 *                  main img scale ≈ 2 − 0.2125
 *
 * progress 0.50    scale ≈ 1 + 0.50×maxScale;  sides +150px;
 *                  main img scale ≈ 2 − 0.425
 *
 * progress 0.75    scale ≈ 1 + 0.75×maxScale;  sides +225px;
 *                  main img scale ≈ 2 − 0.6375
 *
 * progress 1.00    Gallery: scale(1 + maxScale)
 *                  Sides:   translateY(300px)
 *                  Main img: scale(1.15)   [since 2 − 0.85]
 *
 * All three channels update together (continuous scrub).
 * ──────────────────────────────────────────────── */
```

**`maxScale`:** `window.innerWidth < 900` → **4**; else **2.65** (stronger zoom on small screens).

### 2.4 How `self.progress` relates to `.gallery-scroll-track` height (`600vh`) — and how to pick a height

**What `self.progress` actually is**

ScrollTrigger compares **current scroll** to two **scroll positions** on the page: the moment the **`start`** rule is true, and the moment the **`end`** rule is true. It maps the distance **between** those two positions to a **normalized** number **`self.progress`** from **0** (at `start`) to **1** (at `end`). Your math (`scale`, `yTranslate`, `mainImgScale`) **only** sees that **0→1** value — it never receives “vh” or pixels directly.

**How `.gallery-scroll-track` height enters the story**

- The **trigger** is the **`.gallery-scroll-track` element in the document flow**. Its **CSS height** (`600vh` here) sets how **tall that spacer is** in the **scrolling page**.
- With `start: "top bottom"` and `end: "bottom bottom"`, changing how **tall** `.gallery-scroll-track` is changes **how many scroll pixels** typically lie between “start satisfied” and “end satisfied.” So **`600vh` does not set progress to a formula like “1/600 per vh”** — it stretches or shrinks the **physical scroll length** that gets **compressed into** the same **`progress` 0→1** interval.
- **Larger `.gallery-scroll-track` height** → **longer** scroll through the effect → the same zoom (0 to max) happens **more slowly per pixel scrolled** (more “luxury” runway). **Smaller height** → you hit **`progress === 1`** sooner (snappier).

**“Transparent blank space filled with the gallery” — accurate mental model**

- The **`600vh`** region is **empty in-flow space** (transparent background). It **does not** contain `.gallery-grid` as layout children; the gallery stays **`position: fixed`**.
- Visually, while that spacer scrolls through the viewport, you **see** the fixed gallery **behind** it — so it **feels** like the animation “lives” in that section, but **layout-wise** the blank space only **creates scroll distance**; the **motion** is still driven by **`onUpdate`** + **`progress`**.

**How we “knew” to pick `600vh`**

- **GSAP does not choose this number.** There is no required height. **`600`** is an **author / design tuning** choice: try `300vh`, `450vh`, `600vh`, etc., until the scrub **feels** the right length on real hardware (mouse wheel, trackpad, Lenis smoothing).
- You can also change **feel** by editing **`start` / `end`** (different scroll window) without touching `.gallery-scroll-track` height, or combine both.

**Practical tuning**

- Effect **ends too soon** → increase `.gallery-scroll-track` height and/or move **`end`** further down the scroll story.
- Effect **drags** → decrease `.gallery-scroll-track` height and/or tighten **`end`**.

---

## 3. What the code animates — three channels (moving parts)

One number — **`self.progress`** — drives **three** independent transform outputs on **different nodes**.

| Channel | Target | Property (via inline `style.transform`) | Role |
|--------|--------|-------------------------------------------|------|
| **A** | `.gallery-grid` | `translate(-50%, -50%) scale(scale)` | **Whole grid** zooms in / out (here: zoom **in** as progress increases). |
| **B** | `.gallery-col:not(.gallery-col--main)` | `translateY(yTranslate)` | **Side columns** move **down** in px. Center column **`.gallery-col--main`** is excluded. |
| **C** | `.gallery-tile--hero img` | `scale(mainImgScale)` | **Center “hero” photo** scales **down** from **2** toward **1.15** while the wrapper zooms up — **counter-motion** for depth. |

Reference (`gallery-scrub-factory.js` — see `computeGalleryScrubTransforms`):

```javascript
const maxScale = screenWidth < 900 ? 4 : 2.65;
const scale = 1 + self.progress * maxScale;
const yTranslate = self.progress * 300;
const mainImgScale = 2 - self.progress * 0.85;

galleryWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
sideCols.forEach((col) => {
  col.style.transform = `translateY(${yTranslate}px)`;
});
mainImg.style.transform = `scale(${mainImgScale})`;
```

---

## 4. Formulas in plain language

- **`scale = 1 + progress × maxScale`** — At **progress 0**, scale **1**. At **progress 1**, scale **`1 + maxScale`** (e.g. **3.65** on desktop). The entire collage **grows**.
- **`yTranslate = progress × 300`** — Sides move from **0px** to **300px** down.
- **`mainImgScale = 2 − progress × 0.85`** — From **2** to **1.15**. Matches the CSS starting point **`transform: scale(2)`** on `.gallery-tile--hero img` at progress **0**, then the script **overrides** every update.

**Visual summary:** the **world (wrapper) enlarges**, the **sides sink**, the **hero deflates** — all from the same scroll slider.

---

## 5. Value snapshots (desktop `maxScale = 2.65`)

| progress | Gallery `scale` | Sides `translateY` | Main img `scale` |
|----------|-----------------|---------------------|------------------|
| 0 | 1.00 | 0px | 2.00 |
| 0.25 | 1.66 | 75px | 1.79 |
| 0.5 | 2.33 | 150px | 1.58 |
| 0.75 | 2.99 | 225px | 1.36 |
| 1 | 3.65 | 300px | 1.15 |

On narrow viewports, **`maxScale = 4`** so the **gallery scale** column runs up to **5** at progress **1**; **sides** and **main img** end values are unchanged.

---

## 6. Centering, width/height, and JavaScript (recreate-critical)

### 6.1 Why `translate(-50%, -50%)` is there

- **`top: 50%; left: 50%`** (with `position: fixed`) puts the element’s **top-left corner** at the **center of the viewport**.
- **`translate(-50%, -50%)`** shifts the box by **half of its own width** left and **half of its own height** up. Percentages here are relative to **the element being transformed**.
- **Result:** the **visual center** of `.gallery-grid` stays on the **viewport center**.

So centering answers **where** the box sits, not how big it is.

### 6.2 How the gallery fills (or exceeds) the viewport

Centering does **not** set size. Size comes from:

- **`height: 100vh`** — strip is **viewport-tall**.
- **`width: 160vw`** — strip is **wider than the viewport** on purpose (horizontal gallery).
- **`.gallery-viewport`** — **`100vw` × `100vh`** + **`overflow: hidden`** — **clips** what sticks out past the screen edges.

So: **160vw + 100vh** defines the **layout box**; **translate centering** aligns that box; **ScrollTrigger** does not require centering — centering keeps **`scale(...)`** growth feeling **anchored to the middle** of the screen.

### 6.3 How CSS and JS work together

**CSS** (defaults):

```css
.gallery-grid {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  width: 160vw;
  height: 100vh;
}
```

**JS** replaces the **entire** `transform` on `.gallery-grid` each update but **keeps the same translate** and only changes **`scale`**:

```javascript
galleryWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
```

**CSS** on the hero image sets the **starting** scale; **JS** then owns **`mainImg`** transforms for the scrub. Side columns get **only** `translateY` in JS (no centering translate on those).

---

## 7. ScrollTrigger + Lenis (minimal spec)

| Setting | Meaning |
|---------|---------|
| `trigger` (e.g. `createGalleryScrollScrub({ galleryId: "1" })` resolves `.gallery-scroll-track[data-gallery-id="1"]`) | Measure scroll using the **in-flow scroll track** element. |
| `start: "top bottom"` | Range begins when **top** of `.gallery-scroll-track` hits **bottom** of viewport. |
| `end: "bottom bottom"` | Range ends when **bottom** of `.gallery-scroll-track` hits **bottom** of viewport. |
| `scrub: 1` | Values **lag/smooth** toward scroll (1 ≈ moderate smoothing). |
| `onUpdate(self)` | Read **`self.progress`**, compute transforms, assign **`style.transform`**. |

Lenis: `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker` calling `lenis.raf` keeps ScrollTrigger aligned with **smooth** scroll. **`ResizeObserver`** on `document.documentElement` (see `main.js`) coalesces to **`ScrollTrigger.refresh()`** on layout changes.

---

## 8. Recreate checklist

1. **HTML:** Fixed block **before** scrolling content: `.gallery-viewport` > `.gallery-grid` with columns; **sibling** `.container` with sections including **empty** `.gallery-scroll-track` spacer. Use matching **`data-gallery-id`** on viewport + track when using the factory.
2. **CSS:** `.gallery-viewport` fixed full viewport + `overflow: hidden`. `.gallery-grid` fixed, **`160vw` × `100vh`**, **`top/left` + `translate(-50%,-50%)`**. `.gallery-scroll-track` **transparent**; set **height in `vh`** to tune how long **`progress` 0→1** takes to scroll (see **§2.4**). `.gallery-tile--hero img` **`scale(2)`** start.
3. **JS:** `createGalleryScrollScrub({ galleryId })` (or `ScrollTrigger.create` on the track) with **`start` / `end` / `scrub`** and **`onUpdate`**: read **`progress`**, set **`maxScale`**, update **three** transform targets. **`main.js`** wires Lenis + **`ResizeObserver`** → **`ScrollTrigger.refresh()`**.
4. **Optional:** `onLeaveBack` / `onLeave` with `gsap.set` or clearing inline styles if you need a **reset** when leaving `.gallery-scroll-track`.

---

## 9. Adding a second (or Nth) gallery — explicit checklist

The reference above describes **one** chapter. For each additional gallery, **all** of the following must be true (skipping any one is the usual reason “it breaks”):

1. **Matching id on two nodes** — Same **`data-gallery-id`** on **one** `.gallery-viewport` (wrapping its `.gallery-grid`) **and** on **one** `.gallery-scroll-track` in the scrolling column. The factory resolves both from that id.
2. **Viewport DOM order** — Every `.gallery-viewport` should live **before** `<div class="container">` (same as §8). If a fixed viewport is inserted **after** `.container`, it is still a **later sibling** in paint order and can sit **on top of the whole page**, covering hero and sections. That is easy to mistake for “the code is broken” when it is a **stacking / DOM order** issue.
3. **One scroll track per id** — Without an in-flow **`.gallery-scroll-track[data-gallery-id="N"]`**, there is no trigger range for chapter N, so that gallery never gets a `ScrollTrigger` driven scrub for that chapter.
4. **Register in `main.js`** — Add **`"N"`** to the **`GALLERY_IDS`** array (or call `createGalleryScrollScrub({ galleryId: "N", ... })`). Only registered ids get an instance.
5. **Visibility when multiple fixed stages overlap** — Use **`hideViewportWhenTrackInactive: true`**. Pass **`viewportHideClearPastTopInsetPx`** (e.g. `100`) so each `.gallery-viewport` hides when the matching track’s **`getBoundingClientRect().bottom`** is at or above that offset from the viewport top, not only when ScrollTrigger’s **`isActive`** flips — this avoids a brief white or wrong layer after the scrub chapter ends.

If you only duplicated **`.gallery-viewport`** with a new id and skipped the track, **`main.js`**, or correct order, that is an **incomplete** setup, not a misunderstanding of the animation math.

---

*End of reference.*
