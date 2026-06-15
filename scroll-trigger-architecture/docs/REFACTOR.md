# Considerations


- Running the split text trigger via a timeline to sync with master timeline
- Setting a config for values
- Create a factory for timelines, splittext, scroll trigger
- Export each frame as a separate file and import into the main file
- Code organization with separate files for each frame
- Code patterns used for all frames: timelines, scroll trigger, split text, etc...
- Code structure with a storyboard config object for each element


## Component Ideas

- Could implement a cloneNode for frame 4 for further optimization
- How to combine waterfall cascade, slot machine rool, falling letters?
https://madewithgsap.com/effects/tutorial041
https://madewithgsap.com/effects/tutorial027

- Component based on html shape
- Or tagging the html with a data-animation="animationType" to then create the markup, assign styles and run the code



# Before Refactoring

- convert gsap.set to styles
- extract repeated properties styles into css properties
- re-order the html and css to be in sync, make sure each data-panel proceeds ASC
- review refactoring approaches


- add more types of split text
- character slide ins, etc...
- map out some variations
- create just a hide class versus a autoAlpha and opacity?
- create functions for removing anim-hide



# Refactoring Approach



1. Remove gsap.sets, update anim-prehide
2. Extract each frame into a storyboard configuration
3. List out frames, factories, components
4. Create timeline orchestrator, replace frame by frame
4. Create frame one by one
5. Refactor each frame to a registry, factory pattern
6. Refactor to gsap component lifecycle and
7. Refine splittext and scrolltrigger creaetion to primitives



# GSAP Animations

You're seeing two different inheritance cases, not a GSAP bug.

## Why icon/tag/hint “just work”

GSAP animates **the same node** that has `anim-prehide`:

```html
<p class="page-header__tag anim-prehide">
```

```js
tagTimeline.to(heroTag, { opacity: 1, ... });
```

Inline `opacity: 1` beats the class’s `opacity: 0`. The class stays in the DOM but is visually overridden. It works, but you now have **two sources of truth** (class says hidden, inline says visible).

## Why headlines don’t

`anim-prehide` is on the `<h1>`, but GSAP animates **child line nodes** from SplitText:

```text
h1.anim-prehide          ← opacity: 0 (hides entire subtree)
  └─ mask
       └─ .page-header-lines  ← GSAP animates yPercent here
```

Parent `opacity: 0` multiplies down — child motion doesn’t matter. Removing `anim-prehide` from `line` does nothing useful because the class was never on `line`, and the parent still had it until you fixed it with `closest(".page-header__title")`.

You should **not** animate both `h1` and lines. That’s the heavy/wrong fix.

---

## Preferred pattern: one hide owner, one reveal target

### Rule

| Phase | Who owns “hidden” |
|--------|-------------------|
| Before JS | CSS class (FOUC prevention) |
| After JS starts | GSAP (or remove class once, then motion-only) |

Don’t rely on inline styles fighting a class long-term. Either remove the class when GSAP takes over, or never put the class on a **parent** of what you animate.

---

### Pattern A — simple elements (icon, tag, hint)

One small helper keeps everything in sync:

```js
function reveal(el, vars = {}) {
  return gsap.to(el, {
    autoAlpha: 1,
    ...vars,
    onStart: () => el.classList.remove("anim-prehide"),
  });
}

reveal(heroTag, { duration: 0.5, ease: EASEOUTQUAD });
```

- Class handles first paint.
- `onStart` drops the class so DOM state matches reality.
- `autoAlpha` sets opacity + visibility together (if you add `visibility` back to `.anim-prehide` later).

Leaner than hoping inline opacity overrides forever.

---

### Pattern B — SplitText headlines (lean)

**Don’t put `anim-prehide` on each `<h1>`.** Put it on the **container** once:

```html
<div class="page-header__titles anim-prehide">
  <h1 class="page-header__title">ScrollTrigger</h1>
  ...
</div>
```

Then in JS — one unlock, motion on lines only:

```js
const titles = hero.querySelector(".page-header__titles");

const headerLines = SplitText.create(heroHeaders, {
  type: "lines",
  mask: "lines",
  linesClass: "page-header-lines",
});

titles.classList.remove("anim-prehide"); // once, not per line or per h1

headerLines.lines.forEach((line, i) => {
  const lineCount = (i + 1) % 2 === 0 ? i + 1 : 0;

  gsap.set(line, { yPercent: lineCount ? -100 : 100 });
  gsap.to(line, { yPercent: 0, duration: 1, ease: EASEOUTQUAD });
});
```

Why this is lean:

- **One** `classList.remove`, not N lines or 4 h1s.
- **No opacity** on lines — mask + `yPercent` does the reveal.
- No parent opacity blocking children after the single container unlock.
- Split + `gsap.set` in the same synchronous block keeps flash minimal.

---

## Decision cheat sheet

```text
GSAP animates the same element that has anim-prehide?
  → reveal() helper: remove class onStart + autoAlpha

GSAP animates SplitText children?
  → anim-prehide on a wrapper (or nowhere on splittable nodes)
  → remove wrapper class once after split
  → hide/show with transform (yPercent) inside masks, not parent opacity
```

---

## What to avoid

- `anim-prehide` on parent + opacity tween on child
- Leaving `anim-prehide` and relying on inline override (works for icon, confusing in DevTools)
- `classList.remove` on SplitText nodes that never had the class
- Animating both wrapper and lines for opacity

---


**Bottom line:** Class = pre-JS hide. GSAP = post-JS motion. For splits, **unlock the container once**, animate **lines with transforms only**. That’s the lean sync — same idea as icon/tag/hint, but the “reveal target” for SplitText is the wrapper, not each line.



## Module System

Looking at @scroll-trigger-architecture/docs/DOCUMENTATION.md I have a several patterns to implement for each section: return a module that contains a bundled registry, a factory function or a lifecycle component that is both a bundled reigstry and factory. Either way, there needs to be a module or component that is returned that have has dom refs, tween coupling and lifecycle methods for controlling each section via the main @scroll-trigger-architecture/js/script.js TIMELINE registry.

Secondly, there are 3 patterns each section can be: a gsap timeline animation that is returned, an object that returns the tweens that are driven by scroll trigger, and a gsap component module that returns lifecycle methods for trigger before, after events if needed and a settings configuration for animated properties specific to it.

It would be ideal to have a starting out API for each pattern that can be extended with predictable naming and methods when needed.

