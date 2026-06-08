
# Prevent Visible Flash

1. HTML + CSS paint → `.hero__circle` is fully visible (`background: white`, no `opacity` in CSS)
2. `script.js` loads and runs (as `type="module"`, deferred until after parse)
3. `gsap.set(heroIcon, { opacity: 0 })` finally hides it
4. `fromTo` animates it back to `opacity: 1`

Steps 1 and 3 are separated by at least one frame — that’s the flash.

`gsap.set` and the `fromTo` “from” values only apply **after** GSAP initializes. They can’t affect the first paint.

### What you’re missing

An **initial hidden state in CSS** (or HTML), so the icon is never visible before JS:

```css
.hero__circle {
  opacity: 0;
  /* or visibility: hidden; */
}
```

Then GSAP animates it in. CSS wins the race to first paint; JS handles the reveal.

### Optional GSAP tweak

Use `autoAlpha` instead of `opacity` — it sets both `opacity: 0` and `visibility: hidden`, which avoids edge cases where a 0-opacity element still affects rendering:

```js
gsap.set(heroIcon, { autoAlpha: 0 });

iconTimeline.fromTo(heroIcon, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'power2.inOut' });
```

That improves GSAP behavior but **does not** fix the pre-JS flash on its own. CSS (or an inline `style="opacity:0"` on the element) does.

### Summary

| Approach | Prevents flash? |
|----------|-----------------|
| `gsap.set` only | No — runs too late |
| `fromTo` with `opacity: 0` | No — same timing |
| CSS `opacity: 0` on `.hero__circle` | Yes |
| `autoAlpha` | Helps GSAP; still needs CSS for first paint |



# Layout shift on page load

The DevTools grid overlay tracks the **computed size of `.hero`**. Your hero uses:

```48:56:scroll-trigger-architecture/styles.css
.hero {
  min-height: 100vh;
  ...
  grid-template-columns: var(--grid-4);
  grid-template-rows: var(--grid-4);
```

`repeat(4, 1fr)` divides whatever height `.hero` ends up with. When that height changes, every track boundary moves — that's the shift between your screenshots.

### Cause 1: Font loading (most likely)

`body` uses Basier Circle from `fonts.css`, loaded asynchronously:

```40:42:scroll-trigger-architecture/styles.css
body {
  ...
  font-family: var(--font-basier-circle);
```

Your script runs SplitText and animations **immediately**, with no `document.fonts.ready`:

```64:92:scroll-trigger-architecture/script.js
const headerLines = new SplitText(heroHeaders, {
  type: "lines",
  mask: "lines",
  ...
});
```

Sequence:

1. First paint → fallback `sans-serif` metrics for the four huge `h1`s
2. Grid calculates against that text block size
3. Basier Circle loads → different ascenders, line-height (`0.75`), and `clamp(2rem, 10vw, 6rem)` sizing
4. `.hero__main` (rows 2–4) reflows → `.hero` may grow past `min-height: 100vh` → `1fr` rows redistribute → **grid lines jump**

That matches screenshot 1 (tag only, headings not settled) vs screenshot 2 (full headings, font + SplitText applied).

### Cause 2: SplitText DOM changes (also contributes)

SplitText restructures the `h1`s into line wrappers and masks. That changes measured height **after** the first layout pass — another reflow on top of the font swap, even if fonts were already loaded.

### What `autoAlpha` does *not* do here

`autoAlpha: 0` sets `opacity: 0` + `visibility: hidden`. Both still **reserve layout space** in the grid. So `autoAlpha` on icon/tag/hint:

- Can cause a **flash** if CSS doesn't hide them before JS runs
- Does **not** move grid tracks — those elements are tiny in rows 1 and 4

Missing CSS initial states is a flash problem, not a grid-shift problem.

### Fix order (recommended)

```js
document.fonts.ready.then(() => {
  // gsap.set initial states
  // SplitText
  // build timelines and play
});
```

Plus:

1. **CSS initial hidden state** on animated elements (stops flash, not shift)
2. **Lock hero height** if you want stable tracks: `height: 100vh` instead of only `min-height: 100vh`, so content growth doesn't resize the grid
3. **Run SplitText inside `fonts.ready`** so line breaks are computed with final font metrics

### Quick diagnosis

| Symptom | Likely cause |
|---------|----------------|
| White dot / text flash before animation | Missing CSS `opacity: 0` / `visibility: hidden` before JS |
| Grid overlay lines jumping | Font swap + SplitText reflow changing `.hero` height |
| Headers sliding from wrong position | SplitText run before fonts ready (wrong line splits) |

**Bottom line:** The grid shift is related to **`document.fonts.ready` and SplitText timing**, not `autoAlpha`. Wrap your hero setup in `document.fonts.ready`, hide elements in CSS for the flash, and consider fixing `.hero` to `height: 100vh` if you want immovable grid tracks.