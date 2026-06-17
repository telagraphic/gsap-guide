# Scroll-Trigger Architecture

A single-page GSAP demo that teaches scroll-driven animation patterns. Each **section** of the page is a self-contained animation recipe; scroll (via ScrollTrigger) determines when most animations run.

## Language

**Section**:
One animatable region of the page — hero, a `data-section` block, or the footer.
_Avoid_: frame, panel

**Module**:
A JavaScript unit that owns one section's animation config, GSAP objects, and lifecycle.
_Avoid_: component

**Orchestrator**:
An ordered init registry in `script.js` that exposes `initAnimations()` and `destroyAllModules()`. Calls `create()` on each module, then `ScrollTrigger.refresh()`. Does not drive animation progress — scroll does.
_Avoid_: TIMELINE (as the orchestrator variable name), page-wide master timeline

**Registry**:
A per-module collection of GSAP handles (tweens, timelines, SplitText instances). All kills go through the registry — `killTweens()` for partial rebuilds (`onSplit`), `destroy()` for full teardown.

**Effect**:
A reusable animation recipe in `js/effects/` — a factory function (e.g. `createWideSlide`) that builds tweens and registers them on the calling module's registry. Not `gsap.registerEffect` unless we later wrap a factory for cross-project reuse.

## Relationships

- The **Orchestrator** creates one **Module** per **Section**, then calls `create()` on each in DOM order
- Each **Module** owns one **Registry** and sets up its own ScrollTriggers (where applicable)
- Scroll position determines when module animations fire; the orchestrator only registers and initializes
- **Effect** implementations may be shared by multiple **Modules** (sections 5 + 8)
- HTML hooks use `data-section="N"`; JS selectors use `[data-section='N']`
- **`destroyAllModules()`** runs on page leave / re-init (SPA, view transitions, Lenis teardown) — not on scroll or `onSplit`

## Example dialogue

> **Dev:** "Should we call `destroy()` when the user scrolls?"
> **Domain expert:** "No — scroll drives playback. Call `destroyAllModules()` only when leaving the page or re-initializing: SPA navigation, view transitions, or before destroying Lenis."

> **Dev:** "Should we keep `data-panel` in HTML since it's already there?"
> **Domain expert:** "No — rename to `data-section` so HTML, CSS, and JS all scan the same way. `section` is the word everywhere."

## Flagged ambiguities

_(none — frame/panel/data-panel resolved)_
