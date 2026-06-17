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
8. Sections 5 and 8 use the same gsap effect under the hood, extract to component then include into section module






# Learnings


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

### Pattern C — staggered timeline (footer)

Multiple siblings fade in on a **sequential** timeline. Each element has its own tween start time. **Do not** bulk-remove `anim-prehide` on the first tween’s `onStart`.

#### Anti-pattern — bulk class removal on first tween

```js
// ❌ Removes hide from hint + tag before their tweens start
.to(footerTitle, {
  opacity: 1,
  onStart: () => removePrehideClasses(...footerTargets),
})
.to(footerHint, { opacity: 1 }, "+=0.25")
```

When `anim-prehide` is removed from hint/tag, they have no class hide and no GSAP inline yet → default `opacity: 1` → **flash**. Re-enter/leave breaks because class, CSS, and inline opacity fight on different cycles.

#### Preferred — component CSS + per-element tweens + lifecycle sync

**HTML:** no `anim-prehide` on footer nodes (optional elsewhere).

**CSS:** hide on the component rule — one owner for first paint and reset:

```css
.page-footer__tag,
.page-footer__title,
.page-footer__hint {
  opacity: 0;
}
```

**JS:**

```js
function resetFooter() {
  gsap.set(footerTargets, { clearProps: "opacity" });
}

const footerTimeline = gsap.timeline({
  paused: true,
  onComplete: () => removePrehideClasses(...footerTargets), // no-op if class absent; safe sync
  onReverseComplete: resetFooter,
});

footerTimeline
  .to(footerTitle, { opacity: 1, duration: 0.5, ease: EASEOUTQUAD })
  .to(footerHint, { opacity: 1, duration: 0.5, ease: EASEOUTQUAD }, "+=0.25")
  .to(footerTag, { opacity: 1, duration: 0.5, ease: EASEOUTQUAD }, "<");
```

| Phase | Who owns hidden |
|--------|------------------|
| First paint | CSS `opacity: 0` on `.page-footer__*` |
| During stagger | GSAP inline `opacity` per element (overrides CSS while tween runs) |
| Forward complete | `removePrehideClasses` if class present — DOM matches visible state |
| Reverse complete | `clearProps: "opacity"` — CSS owns hidden again for next `play()` |

Why this is smoother than `anim-prehide` on footer:

- GSAP and CSS both target **opacity on the same node** — no class removal race.
- Hint/tag stay at CSS `0` until their tween starts — no early unhide.
- `clearProps` on reverse gives a clean baseline for `onEnterBack` / `play()`.

**Rule:** For staggered timelines, remove hide class **onComplete** (all revealed) or **per-tween `onStart` on that target only** — never bulk-remove on an unrelated sibling’s `onStart`.

---

## Decision cheat sheet

```text
GSAP animates the same element that has anim-prehide?
  → reveal() helper: remove class onStart + autoAlpha
  → single element, single tween — OK

GSAP animates SplitText children?
  → anim-prehide on a wrapper (or nowhere on splittable nodes)
  → remove wrapper class once after split
  → hide/show with transform (yPercent) inside masks, not parent opacity

Staggered timeline — multiple siblings, different start times?
  → CSS opacity: 0 on component rules OR anim-prehide left on until each tween
  → never bulk removePrehideClasses on first tween's onStart
  → onComplete: sync classes; onReverseComplete: clearProps("opacity")
```

---

## What to avoid

- `anim-prehide` on parent + opacity tween on child
- Leaving `anim-prehide` and relying on inline override (works for icon, confusing in DevTools)
- `classList.remove` on SplitText nodes that never had the class
- Animating both wrapper and lines for opacity
- **`removePrehideClasses(...allTargets)` on the first tween of a stagger** — unhides siblings before their tweens run

---


**Bottom line:** Class = pre-JS hide. GSAP = post-JS motion. For splits, **unlock the container once**, animate **lines with transforms only**. For staggered opacity timelines (footer), use **component CSS `opacity: 0`** + per-element tweens + **`clearProps` on reverse** — not bulk class removal on the first tween.



## Module Interface Patterns

Looking at @scroll-trigger-architecture/docs/DOCUMENTATION.md I have several modules to implement:

The end goal is to include each module into an one Orchestrator array TIMELINE and initialize each module corresponding to each section. Every module will use ScrollTrigger for scroll based animations.  



| module-type        | function                                                                                |
| ------------------ | --------------------------------------------------------------------------------------- |
| gsap timeline      | returns a gsap animation driven by a master timeline                                    |
| gsap scrolltrigger | returns a gsap animation driven by scroll trigger(s) for one or more elements           |
| gsap effect        | returns a gsap effect that accepts an element and configuration setting for customizing |


Here is how each section maps to these modules:


| section   | module-type         |
| --------- | ------------------- |
| hero      | gsap animation      |
| section-1 | gsap scrolltrigger  |
| section-2 | gsap scrolltrigger  |
| section-3 | gsap effect         |
| section-4 | gsap scrolltrigger  |
| section-5 | gsap effect         |
| section-6 | gsap effect         |
| section-7 | gsap scroll trigger |
| section-8 | gsap effect         |
| footer    | gsap-animation      |



## Module Interface

There should be a consistent API between all methods, using extension for adding method names that apply for specific use cases in module pattern. We need an interface that covers all the lifecycle methods for all 3 module types.

For these lifecycle methods, we'll need a cleanup as you suggested for killing tweens, and scroll triggers.
We could create a utility function that does the clean up work and either use it in each module, allowing for plug and play for those that require it versus calling a universally in one master timeline.


Ideas for a universal interface for animation module/component lifecycle:


| methods     | function                                                                                                    | public/private                                                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| init        | configuration settings, use a default to prevent error                                                      | private? called by create for initalizing                                                                                                                         |
| setup       | configuration settings, use a default to prevent error                                                      | private? called by create for initalizing                                                                                                                         |
| create      | read dom and create dom refs                                                                                | public, ensures the module scroll trigger is on, has refs and is ready for scroll based animations, for timeline based animation it ensures the timeline is ready |
| play/start  | scroll trigger is live and ready to respond                                                                 | for gsap animations, we                                                                                                                                           |
| reset/clear | remove tweens/scrolltriggers                                                                                | public                                                                                                                                                            |
| destroy     | not sure???                                                                                                 | public                                                                                                                                                            |
| revert      | if module uses splittext autoSplit, we can revert the splittext after the trigger and animation is complete | public                                                                                                                                                            |
| on          | timeline based animations are ready to execute                                                              | public                                                                                                                                                            |
| off         |                                                                                                             |                                                                                                                                                                   |



## Module Structure

We should keep the current storyboard, configuration and then animation code structure for each module.

Each separate module covers a section of the index.html and will contain:

1. storyboard description and module pattern explanation
2. configuration object for selectors, splittext, scroll trigger, to and from timeline properties
3. a returned module pattern with methods for calling in @scripts.js TIMELINE
4. each pattern implements a tween, scroll trigger and timelines registry that bundles references to the actual gsap object for proper cleanup: kill, revert on animations or stop for timelines
5. each module pattern accounts for responsize resize for scroll trigger animations if applicable



## Considerations

First, we should determine who will be responsible for killing tweens and scrolltriggers? Each module can store the tweens in an tween map/array and then import a utility function for killing tweens/scrolltriggers if the module uses tweens. This let's use re-use if for a responsive resize if the module uses autoSplit or if we need to kill tweens/triggers before running the animation again. It's is more composable.

In the parent Orchestrator, on a page navigation or page refresh, we can call these teardown or cleanup methods in super loop for each section when needed.

## Refactor Phases

Order of refactoring steps:

1. Identify a universal interface for all 3 module types
2. Provide some psuedo-code for the 3 module types, what will it look like
3. Move long code from @scroll-trigger-architecture/scripts.js into separate files /timeline/section{N}.js
4. Import each section into @scroll-trigger-architecture/scripts.js
5. Create an orchestrator array where each section can be added for creation/initiation
6. Go one by hand through each section and apply a fitting module pattern based on what the code is doing
7. Further refactor code into generic utils, primitives and gsap effect components


### Order of Operations

Once each section code is moved to it's respective file, we will go through each section and refactor it to a module pattern, then include it in the orchestrator timeline to ensure each one is working in a step by step fashion. No bulk code updates, this will cause complexity and testing issues.








Store tweens in a tweens map per each module instead of named entries

SplitText and autoSplit field

- wrap tweens in a callback for autoSplit setup?

```javascript
function initSectionItem(section, splitConfig, scrollConfig) {
  const header = section.querySelector("h1");
  const item = { section, header, split: null, headerTween: null, linesTween: null };

  const buildTweens = (lines) => {
    item.headerTween?.scrollTrigger?.kill();
    item.linesTween?.scrollTrigger?.kill();
    item.headerTween?.kill();
    item.linesTween?.kill();

    gsap.set([item.header, lines], { autoAlpha: 0 });

    item.headerTween = gsap.to(item.header, { autoAlpha: 1, scrollTrigger: { ... } });
    item.linesTween = gsap.to(lines, { autoAlpha: 1, stagger: scrollConfig.lineStagger, scrollTrigger: { ... } });
  };

  if (splitConfig.autoSplit) {
    item.split = new SplitText(section.querySelector("p"), {
      ...splitConfig,
      onSplit(self) { buildTweens(self.lines); },
    });
  } else {
    item.split = new SplitText(section.querySelector("p"), splitConfig);
    buildTweens(item.split.lines);
  }

  return item;
}
```




```javascript


// create dom refs from selectors
const elements = createElements(CONFIG.SELECTORS);

// create tweens registry for lifecycle mgmt
const tweens = new Map();


// callback for autoSplit if an option
const buildTweens = () {
  tweens.forEach(tween) {
    tween.scrollTrigger?.kill();
    tween.kill();
  }

  const headerTween = gsap.to(CONFIG.HEADER, CONFIG.TWEEN);
  tweens.set(headerTween);
}



```



```javascript
/**
 * Returns a page object of elements for Page.js class
 * @param {Object} selectorChildren - An object of selector strings or DOM elements
 * @returns {Object} A page object of elements
 */

export const createPageObjectFromSelectors = (selectorChildren) => {
  const elements = {};

  for (const [key, selector] of Object.entries(selectorChildren)) {
    // Handle pre-selected elements (HTMLElement, NodeList, or Array)
    if (
      selector instanceof window.HTMLElement ||
      selector instanceof window.NodeList ||
      Array.isArray(selector)
    ) {
      elements[key] = selector;
      return;
    }

    // Handle selector strings
    const selectedElements = $$(selector);
    if (selectedElements.length === 0) {
      elements[key] = null;
    } else if (selectedElements.length === 1) {
      elements[key] = $(selector);
    } else {
      elements[key] = Array.from(selectedElements);
    }
  }

  return elements;
};
```



