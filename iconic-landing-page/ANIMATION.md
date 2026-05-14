# Scroll-linked gallery animation — reference

This document explains **layering**, **timing**, **what transforms change**, and **how centering + sizing** work together so you can re-read it later and **recreate or adapt** the effect.

**Source files:** `index.html`, `styles.css`, `script.js` (GSAP ScrollTrigger + Lenis).

---

## 1. Big picture

- A **fixed fullscreen “stage”** (`.sticky` → `.gallery-wrapper`) stays in the viewport.
- The **rest of the page** (`.container`: hero, intro, `ws`, outro, `footer`) **scrolls on top** in normal document flow.
- **No `gsap.to()` timeline** on elements: one `ScrollTrigger` with **`scrub: 1`** runs **`onUpdate`**, which sets **`element.style.transform`** from **`self.progress`** (0 → 1) while the user scrolls through a long **transparent** section **`.ws`** (`600vh`).
- **Lenis** smooths scroll and calls **`ScrollTrigger.update`** so scrubbed values stay in sync.

---

## 2. Layering and timing (combined)

Read the experience as **scroll position**, not wall-clock time. **`self.progress`** is the single “clock” for the motion: **0** at the trigger **start**, **1** at the **end**.

### 2.1 Stack (who paints where)

| Layer | Role |
|--------|------|
| **`.sticky`** | `position: fixed`, `100vw` × `100vh`, `overflow: hidden`, dark background. This is the **viewport frame** that **clips** the gallery. |
| **`.gallery-wrapper`** | `position: fixed`, sized and centered (see §5). The **image grid** lives here. |
| **`.container` sections** | In-flow sections scroll **above** the fixed stage (later in DOM). Opaque sections (e.g. hero, intro) **cover** the gallery; **`.ws`** is **transparent** so the fixed gallery **reads as the focus** during that segment. |

**`.ws` is not the parent of the gallery in the DOM.** It is only the **ScrollTrigger trigger** (a scroll “ruler”) plus a **600vh spacer** so there is enough scroll distance to move `progress` from 0 to 1.

### 2.2 Phases (progress vs what you see)

| Phase | Scroll / viewport | What you perceive | What the code is doing |
|--------|-------------------|-------------------|-------------------------|
| **Before `.ws` enters** | Hero / intro dominate (opaque backgrounds). | Mostly page content, not the gallery stage. | Trigger not in range; transforms may still be at defaults or last values. |
| **Start of range** | `start: "top bottom"` — **top** of `.ws` meets **bottom** of viewport. | Beginning of the “gallery chapter.” | `progress` → **0**. |
| **Inside `.ws`** | `600vh` of scroll while `.ws` moves through. | Transparent section → **fixed gallery** is the visual focus; grid **zooms**, sides **slide down**, center **hero image scales down**. | `onUpdate` runs; **`progress` 0 → 1** maps to transform math. **`scrub: 1`** smooths values to scroll. |
| **End of range** | `end: "bottom bottom"` — **bottom** of `.ws` meets **bottom** of viewport. | Motion reaches its **end state** for this setup. | `progress` → **1**. |
| **After `.ws`** | Outro / footer scroll over again. | Page content returns. | Trigger inactive; **this project does not reset** inline transforms on leave (optional improvement). |

### 2.3 Storyboard (scroll-native + optional mental clock)

There are **no fixed milliseconds** in code — motion is **scrubbed to scroll**. Use **`progress`** (0 → 1) as the authoritative timeline. If it helps to think in time, pick any “virtual duration” **T**; then **ms ≈ progress × T** (ratios only).

```text
/* ────────────────────────────────────────────────
 * ANIMATION STORYBOARD (scroll-scrubbed via .ws)
 *
 * progress: 0 at start: "top bottom"
 *           1 at end:   "bottom bottom"
 * scrub: 1 — values ease toward scroll position
 *
 * LAYERING: fixed .sticky + .gallery-wrapper under scrolling
 *           .container; .ws is transparent (see §2.1–2.2).
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

### 2.4 How `self.progress` relates to `.ws` height (`600vh`) — and how to pick a height

**What `self.progress` actually is**

ScrollTrigger compares **current scroll** to two **scroll positions** on the page: the moment the **`start`** rule is true, and the moment the **`end`** rule is true. It maps the distance **between** those two positions to a **normalized** number **`self.progress`** from **0** (at `start`) to **1** (at `end`). Your math (`scale`, `yTranslate`, `mainImgScale`) **only** sees that **0→1** value — it never receives “vh” or pixels directly.

**How `.ws` height enters the story**

- The **trigger** is the **`.ws` element in the document flow**. Its **CSS height** (`600vh` here) sets how **tall that spacer is** in the **scrolling page**.
- With `start: "top bottom"` and `end: "bottom bottom"`, changing how **tall** `.ws` is changes **how many scroll pixels** typically lie between “start satisfied” and “end satisfied.” So **`600vh` does not set progress to a formula like “1/600 per vh”** — it stretches or shrinks the **physical scroll length** that gets **compressed into** the same **`progress` 0→1** interval.
- **Larger `.ws` height** → **longer** scroll through the effect → the same zoom (0 to max) happens **more slowly per pixel scrolled** (more “luxury” runway). **Smaller height** → you hit **`progress === 1`** sooner (snappier).

**“Transparent blank space filled with the gallery” — accurate mental model**

- The **`600vh`** region is **empty in-flow space** (transparent background). It **does not** contain `.gallery-wrapper` as layout children; the gallery stays **`position: fixed`**.
- Visually, while that spacer scrolls through the viewport, you **see** the fixed gallery **behind** it — so it **feels** like the animation “lives” in that section, but **layout-wise** the blank space only **creates scroll distance**; the **motion** is still driven by **`onUpdate`** + **`progress`**.

**How we “knew” to pick `600vh`**

- **GSAP does not choose this number.** There is no required height. **`600`** is an **author / design tuning** choice: try `300vh`, `450vh`, `600vh`, etc., until the scrub **feels** the right length on real hardware (mouse wheel, trackpad, Lenis smoothing).
- You can also change **feel** by editing **`start` / `end`** (different scroll window) without touching `.ws` height, or combine both.

**Practical tuning**

- Effect **ends too soon** → increase `.ws` height and/or move **`end`** further down the scroll story.
- Effect **drags** → decrease `.ws` height and/or tighten **`end`**.

---

## 3. What the code animates — three channels (moving parts)

One number — **`self.progress`** — drives **three** independent transform outputs on **different nodes**.

| Channel | Target | Property (via inline `style.transform`) | Role |
|--------|--------|-------------------------------------------|------|
| **A** | `.gallery-wrapper` | `translate(-50%, -50%) scale(scale)` | **Whole grid** zooms in / out (here: zoom **in** as progress increases). |
| **B** | `.col:not(.main)` | `translateY(yTranslate)` | **Side columns** move **down** in px. Center column **`.main`** is excluded. |
| **C** | `.img.main img` | `scale(mainImgScale)` | **Center “hero” photo** scales **down** from **2** toward **1.15** while the wrapper zooms up — **counter-motion** for depth. |

Reference (`script.js`):

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
- **`mainImgScale = 2 − progress × 0.85`** — From **2** to **1.15**. Matches the CSS starting point **`transform: scale(2)`** on `.img.main img` at progress **0**, then the script **overrides** every update.

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
- **Result:** the **visual center** of `.gallery-wrapper` stays on the **viewport center**.

So centering answers **where** the box sits, not how big it is.

### 6.2 How the gallery fills (or exceeds) the viewport

Centering does **not** set size. Size comes from:

- **`height: 100vh`** — strip is **viewport-tall**.
- **`width: 160vw`** — strip is **wider than the viewport** on purpose (horizontal gallery).
- **`.sticky`** — **`100vw` × `100vh`** + **`overflow: hidden`** — **clips** what sticks out past the screen edges.

So: **160vw + 100vh** defines the **layout box**; **translate centering** aligns that box; **ScrollTrigger** does not require centering — centering keeps **`scale(...)`** growth feeling **anchored to the middle** of the screen.

### 6.3 How CSS and JS work together

**CSS** (defaults):

```css
.gallery-wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  width: 160vw;
  height: 100vh;
}
```

**JS** replaces the **entire** `transform` on `.gallery-wrapper` each update but **keeps the same translate** and only changes **`scale`**:

```javascript
galleryWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
```

**CSS** on the hero image sets the **starting** scale; **JS** then owns **`mainImg`** transforms for the scrub. Side columns get **only** `translateY` in JS (no centering translate on those).

---

## 7. ScrollTrigger + Lenis (minimal spec)

| Setting | Meaning |
|---------|---------|
| `trigger: ".ws"` | Measure scroll using the **`.ws` element** in the document. |
| `start: "top bottom"` | Range begins when **top** of `.ws` hits **bottom** of viewport. |
| `end: "bottom bottom"` | Range ends when **bottom** of `.ws` hits **bottom** of viewport. |
| `scrub: 1` | Values **lag/smooth** toward scroll (1 ≈ moderate smoothing). |
| `onUpdate(self)` | Read **`self.progress`**, compute transforms, assign **`style.transform`**. |

Lenis: `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker` calling `lenis.raf` keeps ScrollTrigger aligned with **smooth** scroll.

---

## 8. Recreate checklist

1. **HTML:** Fixed block **before** scrolling content: `.sticky` > `.gallery-wrapper` with columns; **sibling** `.container` with sections including **empty** `.ws` spacer.
2. **CSS:** `.sticky` fixed full viewport + `overflow: hidden`. `.gallery-wrapper` fixed, **`160vw` × `100vh`**, **`top/left` + `translate(-50%,-50%)`**. `.ws` **transparent**; set **height in `vh`** to tune how long **`progress` 0→1** takes to scroll (see **§2.4**). `.img.main img` **`scale(2)`** start.
3. **JS:** `ScrollTrigger.create` on `.ws` with **`start` / `end` / `scrub`** and **`onUpdate`**: read **`progress`**, set **`maxScale`**, update **three** transform targets as above.
4. **Optional:** `onLeaveBack` / `onLeave` with `gsap.set` or clearing inline styles if you need a **reset** when leaving `.ws`.

---

*End of reference.*
