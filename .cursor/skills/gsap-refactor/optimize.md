**Part of [GSAP Refactor](SKILL.md) by Nick Lyons** · Follow the Shared Rules in [SKILL.md](SKILL.md)

Make a working animation run at 60fps. Distinct from [debug](debug.md) (it's broken) and [audit](audit.md) (it's poorly structured) — here the animation is correct but stutters or burns CPU/GPU.

Output to `./docs/ANIMATION_PERFORMANCE.md` if a record is wanted; otherwise inline.

## Measure first
Don't optimize blind. Open DevTools → Performance, record a scroll/interaction, look for: long frames (>16ms), purple "Layout"/"Recalculate Style" bars (reflow), green "Paint" bars. **Rendering → Paint flashing** shows what's repainting. Optimize what the profiler flags, not what you assume.

## The 60fps budget
Each frame has ~16ms. The cheap path is **transform + opacity only** — these skip layout and paint, compositing straight on the GPU. Everything else costs more.

| Animate this | Cost | Notes |
|---|---|---|
| `x`, `y`, `scale`, `rotation`, `opacity` | Cheap (composite) | The safe set. Prefer always. |
| `width`, `height`, `top`, `left`, `margin`, `padding` | Expensive (reflow) | Triggers layout every frame. Replace with transforms. |
| `box-shadow`, `filter: blur()` | Expensive (paint) | Heavy on mobile especially. Use sparingly, test on device. |
| `background-position`, `color` | Moderate (paint) | OK for short tweens, costly when scrubbed continuously. |

## Optimizations, by impact

| Fix | What it does | When |
|---|---|---|
| Layout props → transforms | Removes per-frame reflow — the biggest single win | Any `top`/`left`/`width` animation |
| `will-change: transform` (or `force3D: true`) | Promotes element to its own GPU layer ahead of time | Elements that animate on scroll; **remove after** — too many layers eats memory |
| `ScrollTrigger.config({ fastScrollEnd: true })` / `limitCallbacks: true` | Cuts redundant callback fires during fast scroll | Scrubbed triggers firing too often |
| Debounce resize / `invalidateOnRefresh` | Stops recalculating on every resize event | Resize-sensitive triggers |
| Kill offscreen / inactive triggers | Frees work the browser does for animations nobody sees | Long pages, many triggers, SPA routes |
| `gsap.ticker` for shared RAF loop | One loop instead of many competing `requestAnimationFrame`s | Custom per-frame logic alongside GSAP |
| Batch DOM reads then writes | Avoids layout thrashing (read→write→read forces sync reflow) | Code measuring then setting in a loop |

## Principles
- **Transform and opacity are free; everything else is borrowed.** Reach for layout-property animation only when transforms genuinely can't express it.
- **`will-change` is a loan, not a gift.** It speeds up the animation by spending memory on a layer. Apply right before, clear right after — leaving it on everything is a net loss.
- **Fewer, smarter triggers beat many naive ones.** Killing offscreen work often outperforms micro-tuning the visible animation.

## Output
- Lead with what the profiler showed (or what to profile if you can't run it).
- Give fixes **ranked by impact**, each with the property/line it targets and the expected gain.
- Note any **mobile-specific** cost (`filter`, `box-shadow`, large layers) separately — desktop-smooth ≠ mobile-smooth.
