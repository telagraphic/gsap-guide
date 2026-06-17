# Module Refactor — Implementation Plan

Living plan for refactoring `js/script.js` (~1100 lines) into per-section modules with a unified lifecycle interface. All [Decision Log](#decision-log) items are resolved.

---

## Goal

Replace monolithic inline animation code with **section modules** that:

1. Keep the existing **storyboard → config → animation** structure per section
2. Expose a **consistent lifecycle API** across three module kinds
3. **Own their GSAP objects** (tweens, ScrollTriggers, timelines, SplitText) for cleanup and resize
4. Plug into a thin **orchestrator** in `script.js`

---

## Design patterns overview

The refactor combines a small set of patterns. Each has one job; together they replace the monolithic `script.js` loop.

```text
script.js (Orchestrator)
    │  initAnimations() / destroyAllModules()
    ▼
modules/*.js (Module factory → Module instance)
    │  create() / destroy() / revert?
    ├── registry (per-module GSAP manager)
    ├── createElements() (DOM refs)
    ├── private rebuild helpers (onSplit / refreshInit)
    └── effects/*.js (Effect factories — sections 3, 5, 6, 8)
```

### Pattern reference

| Pattern | File(s) | Export / symbol | Function |
|---------|---------|-----------------|----------|
| **Orchestrator** | `js/script.js` | `initAnimations()`, `destroyAllModules()` | Page-level init registry: instantiate modules in DOM order, call `create()` on each, run `ScrollTrigger.refresh()`. On teardown, loop `destroy()`. Does not own tweens. |
| **Module factory** | `js/modules/hero.js`, `section-1.js` … `footer.js` | `createHero()`, `createSection1()`, … | Returns a **module instance** (closure). One factory per section. Called once by orchestrator before `create()`. |
| **Module instance** | _(return value of module factory)_ | `{ id, type, registry, create, destroy, revert? }` | Public lifecycle API for one section. `create()` runs DOM + SplitText + ScrollTrigger setup; `destroy()` delegates to registry. |
| **Registry** | `js/shared/registry.js` | `createRegistry()`, `killTween()` | Per-module **tween/timeline/SplitText manager**. Tracks handles so duplicates can be killed on resize/re-init. See [Animation registry — memory, duplication, and performance](#animation-registry--memory-duplication-and-performance). |
| **DOM factory** | `js/shared/createElements.js` | `createElements(selectorMap)` | Maps config selectors to DOM refs (`{ section, tracks, paragraphs }`). Used at start of `create()`. |
| **Effect factory** | `js/effects/wide-slide.js`, `tarot-grid.js`, … | `createWideSlide()`, … | Reusable animation recipe for effect-type modules. Receives targets + config + **module's registry**; builds tween(s) + ScrollTrigger; calls `registry.addTween()`. |
| **Rebuild helper** | _(private function inside module)_ | `buildTweens()`, `buildParagraph()`, `rebuildPhrases()` | Private partial-rebuild path. Calls `registry.killTweens()` then recreates animations. Used by `onSplit`, `refreshInit` — not on public API. |
| **Config object** | Top of each module / effect file | `CONFIG`, `WIDE_SLIDE_CONFIG`, … | Named storyboard + selector + tween/ST vars. Separates tuning from logic. |
| **Item bundle** | _(inside scrollTrigger modules with multiple targets)_ | `{ section, split, headerTween, linesTween }` | Optional per-target object when one section animates many groups (e.g. section 2 groups). Items stored in module closure; tweens also registered on registry. |
| **Primitives** _(Phase 4, optional)_ | `js/shared/scrollReveal.js`, … | `createScrollReveal()`, `createLineSplit()` | Shared low-level helpers when 3+ modules duplicate the same tween/ST setup. Not used on day one. |
| **Lenis adapter** _(Phase 5)_ | `js/lenis.js` | `initLenis()`, `destroyLenis()` | Smooth-scroll integration: `lenis.on('scroll', ScrollTrigger.update)` + GSAP ticker. `destroyPage()` = `destroyAllModules()` + `destroyLenis()`. |

### What is *not* a separate pattern

| Approach | Why we skipped it |
|----------|-------------------|
| `gsap.registerEffect` | Effect factories (plain functions) are sufficient for this project |
| Page-wide master timeline | Scroll drives playback; orchestrator only registers modules |
| Global registry | Each module owns its registry — avoids cross-section kill bugs |
| Public `init` / `reset` / `clear` | Merged into `create()` and `destroy()` |

### Pattern by section type

| Module type | Patterns used |
|-------------|---------------|
| **timeline** (hero, footer) | Module factory, registry (`addTimeline`, `addListener`), config |
| **scrollTrigger** (1, 2, 4, 7) | Above + DOM factory; + rebuild helper + item bundle when multi-target or `autoSplit` |
| **effect** (3, 5, 6, 8) | Above + effect factory; + rebuild helper when `autoSplit` or `refreshInit` |

### Call flow (init)

```text
1. orchestrator: createSection3()     → module instance (registry born here)
2. orchestrator: module.create()      → createElements → SplitText / tweens
3. module: registry.addTween(...)     → every gsap.to / fromTo registered
4. orchestrator: ScrollTrigger.refresh()
```

### Call flow (resize / onSplit)

```text
1. SplitText onSplit fires
2. module private buildParagraph()    → registry.killTweens()
3. effect factory or inline tween     → registry.addTween(...)
```

### Call flow (page leave / Lenis teardown)

```text
1. destroyAllModules()
2. each module.destroy()              → registry.destroy()
```

---

## Animation registry — memory, duplication, and performance

GSAP keeps tweens, timelines, and ScrollTriggers alive in internal lists until they are **killed** or **complete** (and `once: true` triggers still leave instances until killed). Creating an animation without storing a reference does not mean it is ephemeral — it means **your code cannot find it to clean it up**.

On an animation-heavy landing page like this one (dozens of scroll-scrubbed tweens, multiple `autoSplit` paragraphs, standalone `ScrollTrigger.create` gates, nested timelines), orphaned or duplicated instances are the main source of scroll jank and memory growth.

### Orphaned vs registered — what changes

| | **Orphaned** (no registry) | **Registered** (registry approach) |
|--|---------------------------|-------------------------------------|
| **Create** | `gsap.to(el, { scrollTrigger: { … } })` — return value discarded | `registry.addTween("lines", tween)` — handle stored |
| **Find later** | Search `ScrollTrigger.getAll()` or guess | `registry` Map keys |
| **Resize / `onSplit`** | Old instances keep running unless you kept a side array | `registry.killTweens()` kills exactly what this module created |
| **Page leave** | Instances + listeners may survive until navigation | `registry.destroy()` kills all |
| **Debug** | "Why are there 47 ScrollTriggers?" | `modules[2].registry` shows section 3's set |

**Animations still run either way.** The registry is not for GSAP — it is for **your code to own the lifecycle**.

### Three GSAP objects to track

When you write:

```js
gsap.to(target, {
  x: 0,
  scrollTrigger: { trigger: section, scrub: 1 },
});
```

GSAP creates **two** linked objects:

```text
Tween  ──attached──►  ScrollTrigger
  │                        │
  │                        ├── scroll listener (updates on scroll)
  │                        ├── pin spacer DOM (if pin: true)
  │                        └── refresh calculations
  └── runs on ticker while active
```

Killing only the tween or only the ScrollTrigger leaves the other half alive. The registry's `killTween()` does both:

```js
tween.scrollTrigger?.kill();
tween.kill();
```

**Timelines** are a third object. A timeline with `scrollTrigger: { … }` on it creates its own ScrollTrigger. Nested child timelines (hero's `iconTimeline`, `linesTimeline`, etc.) each need registration if you ever tear down or rebuild the hero.

**Standalone** `ScrollTrigger.create({ … })` (footer play/reverse) creates a ScrollTrigger **without** a tween — it must be registered via `addListener` or a dedicated `addScrollTrigger` and killed explicitly.

### How duplicates stack on this page

#### 1. `autoSplit` + `onSplit` without kill (sections 1, 2, 3)

SplitText reflows text on resize. Each reflow fires `onSplit` with new line/word nodes. If you create new tweens without killing old ones:

```text
Initial load     →  5 lines  →  5 tweens  →  5 ScrollTriggers
Resize #1        →  6 lines  →  6 NEW tweens  →  11 ScrollTriggers total
Resize #2        →  5 lines  →  5 NEW tweens  →  16 ScrollTriggers total
```

Every surviving ScrollTrigger still listens to scroll and runs scrub math. Section 3 multiplies this: **paragraphs × lines per paragraph**. Three paragraphs × five lines × three resizes = **45+ triggers** from code that thought it only had 15 animations.

**Current code risk:** Section 3 uses a per-paragraph `lineTweens` array and kills on `onSplit` — a manual registry. Section 2 creates tweens in a `forEach` with **no stored handles** — resize with `autoSplit` would stack duplicates if added later.

**Registry approach:** `onSplit` always starts with `registry.killTweens()` — one path, no forgotten arrays.

#### 2. `ScrollTrigger.refreshInit` without kill (section 8)

Section 8 rebuilds phrase animations when ScrollTrigger recalculates layout. Same stacking pattern as `onSplit`:

```text
refreshInit #1  →  buildPhraseTweens()  →  N tweens
refreshInit #2  →  buildPhraseTweens()  →  2N tweens (old N still listening)
```

Each duplicate still fires on scroll — phrases animate twice, scrub fights itself, CPU cost rises.

**Registry approach:** private `rebuildPhrases()` calls `registry.killTweens()` before creating new phrase tweens.

#### 3. Init called twice (hot reload, SPA return, mistaken double `create()`)

```text
First visit   →  script.js runs  →  ~40 ScrollTriggers across all sections
Hot reload    →  script.js runs again  →  ~80 ScrollTriggers (first set orphaned)
```

Without `destroyAllModules()` before re-init, the first set is unreachable from JS but still:

- listening to scroll / resize
- holding closures over old DOM nodes (detached after HMR)
- keeping SplitText wrapper markup if splits were not reverted

**Registry approach:** `destroyAllModules()` → each `registry.destroy()` → clean slate before second `initAnimations()`.

#### 4. Standalone ScrollTrigger (footer)

```js
ScrollTrigger.create({
  trigger: footer,
  onEnter: () => footerTimeline.play(),
  …
});
```

No tween return value to catch. Duplicate `create()` without kill → **two triggers** both call `play()` / `reverse()` on the same timeline — footer stutters or races.

**Registry approach:** `registry.addListener("footer-gate", () => st.kill())` or store the ST instance explicitly.

#### 5. Timelines + nested timelines (hero, footer)

```text
heroTimeline
  ├── linesTimeline  (+ ScrollTrigger if added later)
  ├── tagTimeline
  └── iconTimeline
```

Killing only the parent without children leaves child timelines on the ticker. Registering each timeline (or the master only, if children are nested **inside** it and killed with parent) must be consistent.

**Registry approach:** `registry.addTimeline("hero", heroTimeline)` — `killTweens()` kills timelines and their attached ScrollTriggers.

#### 6. SplitText without revert

SplitText wraps text in extra DOM (`<div class="split-line">` etc.). Rebuilding splits without `revert()` nests wrappers:

```text
split → wrap → onSplit → split again → wrap inside wrap
```

Not a GSAP memory leak per se, but DOM bloat slows layout, reflow, and `getBoundingClientRect` calls (section 3 spread math). `registry.revertSplits()` on full `destroy()` keeps DOM clean.

### Performance symptoms you will notice

| Symptom | Likely cause |
|---------|----------------|
| Scroll feels heavier after resize | Duplicate scrub ScrollTriggers per section |
| Animation "fights itself" (jumps, double speed) | Two tweens driving same targets |
| `ScrollTrigger.refresh()` gets slower over time | More instances to recalculate |
| Footer plays/reverses erratically | Duplicate `ScrollTrigger.create` callbacks |
| DevTools: `ScrollTrigger.getAll().length` grows | Orphaned instances from re-init or `onSplit` |
| Memory climb on long sessions (SPA) | Listeners + closures holding detached DOM |
| Mobile worse than desktop | More resizes → more `onSplit` → faster duplication |

On a **static** page with no resize and no re-init, orphans created once at load are less visible — GSAP runs fine. The landing page is not static: `autoSplit` (sections 1–3), `refreshInit` (section 8), future Lenis, and dev hot reload all recreate animations. That is when unreferenced instances hurt.

### Walkthrough — section 3 without registry vs with

**Without registry** (orphan create on each `onSplit`):

```js
onSplit(self) {
  self.lines.forEach((line) => {
    gsap.to(line.querySelectorAll(".anim-word"), {
      x: 0,
      scrollTrigger: { trigger: line, scrub: 0.2 },
    }); // ← 40+ orphaned instances after a few resizes
  });
}
```

**With registry:**

```js
onSplit(self) {
  registry.killTweens(); // ← removes previous line tweens + their ScrollTriggers

  self.lines.forEach((line, i) => {
    createWideSlide({ line, registry, key: `line-${i}`, … });
  });
}
```

After three resizes: **5 triggers** (current line count), not 20.

### Walkthrough — full page scale

Rough count for this demo at first load:

| Section | Approx. tweens / triggers |
|---------|---------------------------|
| Hero | 1 master timeline + 4 nested |
| Section 1 | 1 char tween + 1 lines scrub |
| Section 2 | 2 per group × 3 groups = 6 |
| Section 3 | 1 per line × ~15 lines |
| Section 4 | 1 per track × ~20 tracks |
| Sections 5–7 | ~10–30 combined |
| Section 8 | 1 per phrase × rebuild risk |
| Footer | 1 timeline + 1 standalone ST |

**~60–80 GSAP objects** at steady state. One unguarded re-init or resize loop without kill can **double** that. Scroll-scrubbed triggers run work on every scroll event — duplication is multiplicative on the main thread.

### Why per-module registry (not one global)

A single page-wide registry would work for kill, but per-module registries:

- **Scope kills** — section 3 resize does not kill section 4's tracks
- **Debug** — `createSection3().registry` isolates one section
- **Teardown order** — `destroyAllModules()` can destroy in DOM order without one Map growing unbounded with ambiguous keys
- **Portability** — module + registry moves to another project as one unit

### Rules (summary)

1. **Register on create** — every `gsap.to`, `fromTo`, `timeline`, standalone `ScrollTrigger.create`, and `SplitText` instance
2. **Kill tween + ScrollTrigger together** — use `killTween()` helper
3. **Partial rebuild** — `registry.killTweens()` at the start of every `onSplit` / `refreshInit` handler
4. **Full teardown** — `registry.destroy()` on page leave; revert splits
5. **Never rely on GC** — JavaScript garbage collection does not kill GSAP instances; they unregister only via `.kill()`

---

## Current State

| Asset | Status |
|-------|--------|
| `js/script.js` | All 10 animation regions inline (hero, sections 1–8, footer) |
| `js/timeline/sectionOne.js` | Partial extract — currently duplicates hero code, not wired in |
| `js/utils.js` | `removePrehideClasses` helper |
| Commented `TIMELINE` array | Suggests intended orchestrator shape, not implemented |

**Code ↔ markup mapping**

| Region | HTML anchor | Current pattern |
|--------|-------------|-----------------|
| Hero | `.page-header` | Master timeline, plays on load |
| Section 1 | `[data-section='1']` | ScrollTrigger: chars + scrubbed lines (`autoSplit`) |
| Section 2 | `[data-section='2']` | ScrollTrigger per `.page-section__group` |
| Section 3 | `[data-section='3']` | Custom wide-slide effect + scrub |
| Section 4 | `[data-section='4']` | ScrollTrigger pin / scrub |
| Section 5 | `[data-section='5']` | Tarot grid effect |
| Section 6 | `[data-section='6']` | Tarot / card effect variant |
| Section 7 | `[data-section='7']` | ScrollTrigger |
| Section 8 | `[data-section='8']` | Callback panel + `refreshInit` rebuild |
| Footer | `.page-footer` | Paused timeline + ScrollTrigger play/reverse |

---

## Terminology

| Term | Proposed meaning | Avoid |
|------|------------------|-------|
| **Section** | One animatable page region (hero, `data-section` N, or footer) | frame, panel |
| **Module** | A JS unit that owns one section's animation lifecycle | component (unless React) |
| **Orchestrator** | Parent in `script.js` that registers modules and runs global init/teardown | TIMELINE (as a GSAP object name) |
| **Registry** | Per-module store of GSAP handles (Map or bundled item objects) | — |
| **Effect module** | Module whose animation logic is reusable across sections (e.g. wide-slide, tarot) | `gsap.registerEffect` (unless we adopt it) |

**Naming convention (resolved):** `section` in JS, docs, and HTML. HTML attribute is `data-section="N"` (replacing `data-panel`). CSS selectors and JS configs use `[data-section='N']`. Module files: `section-N.js`, exports: `createSectionN()`. Hero and footer are unnumbered.

---

## Module Types

Three kinds from REFACTOR.md, aligned to actual code:

### 1. Timeline module (`timeline`)

**Sections:** hero, footer

**Behavior:** Builds one or more nested `gsap.timeline()` instances. Hero plays on load. Footer uses a **paused** timeline driven by ScrollTrigger callbacks (`onEnter` / `onLeave` play/reverse).

**Returns:** `{ timeline, registry, create, destroy, … }`

### 2. ScrollTrigger module (`scrollTrigger`)

**Sections:** 1, 2, 4, 7

**Behavior:** Creates scroll-linked tweens/timelines. May include SplitText with `autoSplit` + `onSplit` rebuild. May have multiple **items** per section (e.g. section 2's groups).

**Returns:** `{ items[], registry, create, destroy, revert, … }`

### 3. Effect module (`effect`)

**Sections:** 3, 5, 6, 8

**Behavior:** Encapsulates a named animation recipe (wide-slide spread, tarot flip, callback phrases). Accepts root element + config. May register `ScrollTrigger.refreshInit` listeners.

**Implementation:** Custom factories in `js/effects/` (Option A) — not `gsap.registerEffect`. Factories receive explicit args (`line`, `container`, `registry`) and register tweens on the module registry. Optional later: thin `gsap.registerEffect` wrapper around a core factory if effects ship as a library.

**Returns:** `{ registry, create, destroy, … }`

---

## Unified Module Interface

All modules export a **factory** that returns the same surface. Type-specific methods are optional extensions on timeline modules only.

```js
/**
 * @typedef {Object} AnimationModule
 * @property {string} id
 * @property {'timeline'|'scrollTrigger'|'effect'} type
 * @property {() => void} create   - Query DOM, build animations, populate registry
 * @property {() => void} destroy  - Full teardown via registry.destroy()
 * @property {() => void} [revert] - SplitText revert only (scrollTrigger / effect modules)
 * @property {ReturnType<createRegistry>} registry
 */
```

### Lifecycle methods (resolved)

| Method | Visibility | Responsibility |
|--------|------------|----------------|
| `create()` | Public | DOM refs, build animations, register every GSAP object |
| `destroy()` | Public | `registry.destroy()` — full kill + revert + listener removal |
| `revert()` | Public, optional | `registry.revertSplits()` only |
| `play()` / `pause()` | Public, timeline modules only | Footer timeline control |
| `buildTweens()` etc. | **Private** | Partial kill + rebuild (`onSplit`, `refreshInit`) |
| ~~`init` / `setup` / `reset` / `clear`~~ | — | Dropped — logic lives in `create()` or private helpers |

Orchestrator calls **`create()`** then **`ScrollTrigger.refresh()`**. On teardown: **`destroy()`** on each module only.

### Who kills tweens and ScrollTriggers?

**Always inside the module — never the orchestrator.**

Every tween/timeline/ScrollTrigger is registered at creation time. Kill happens through the module's **registry** on two paths:

```text
┌─────────────────────────────────────────────────────────┐
│  Orchestrator                                           │
│    create()  ──► module.create()                        │
│    destroy() ──► module.destroy() ──► registry.destroy() │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Module (internal)                                      │
│    onSplit / refreshInit ──► registry.killTweens()     │
│                              └── then rebuild tweens    │
└─────────────────────────────────────────────────────────┘
```

| Trigger | Caller | Registry method | What dies |
|---------|--------|-----------------|-----------|
| Page leave / hot reload | Orchestrator → `module.destroy()` | `registry.destroy()` | All tweens, timelines, ST instances, splits reverted, listeners removed |
| `autoSplit` resize | Private `buildTweens()` in module | `registry.killTweens()` | Tweens + their `scrollTrigger` only; SplitText stays |
| `refreshInit` (section 8) | Private `rebuild()` in module | `registry.killTweens()` | Same as resize — effect rebuilds, DOM stays |

**Rule:** If you create it with `gsap.to()` / `ScrollTrigger.create()`, you register it. If you need to kill it, you go through the registry — no ad-hoc `tween.kill()` scattered in module code.

### Registry + cleanup utility

```js
// js/shared/registry.js
export function killTween(tween) {
  tween?.scrollTrigger?.kill();
  tween?.kill();
}

export function createRegistry() {
  const tweens = new Map();
  const timelines = new Map();
  const splits = new Map();
  const listeners = new Map(); // { key → removeListener fn }

  return {
    addTween(key, tween) {
      tweens.set(key, tween);
      return tween;
    },
    addTimeline(key, timeline) {
      timelines.set(key, timeline);
      return timeline;
    },
    addSplit(key, split) {
      splits.set(key, split);
      return split;
    },
    addListener(key, removeFn) {
      listeners.set(key, removeFn);
    },

    /** Partial — for onSplit / refreshInit rebuild */
    killTweens() {
      for (const tween of tweens.values()) killTween(tween);
      for (const tl of timelines.values()) {
        tl.scrollTrigger?.kill();
        tl.kill();
      }
      tweens.clear();
      timelines.clear();
    },

    revertSplits() {
      for (const split of splits.values()) split.revert?.();
      splits.clear();
    },

    /** Full — for module.destroy() */
    destroy() {
      this.killTweens();
      this.revertSplits();
      for (const off of listeners.values()) off();
      listeners.clear();
    },
  };
}
```

### Module usage pattern

```js
export function createSection1() {
  const registry = createRegistry();

  function buildTweens(lines) {
    registry.killTweens(); // automatic partial cleanup before rebuild

    const linesTween = gsap.to(lines, {
      /* … */
      scrollTrigger: { /* … */ },
    });
    registry.addTween("lines", linesTween);
  }

  return {
    id: "section-1",
    type: "scrollTrigger",
    registry,
    create() {
      const split = SplitText.create(paragraph, {
        autoSplit: true,
        onSplit(self) { buildTweens(self.lines); },
      });
      registry.addSplit("paragraph", split);
    },
    destroy() {
      registry.destroy(); // orchestrator calls this — full automatic cleanup
    },
    revert() {
      registry.revertSplits();
    },
  };
}
```

The orchestrator never imports `killTween` or touches GSAP objects directly.

---

## File Structure (target)

```
scroll-trigger-architecture/
├── js/
│   ├── script.js                 # Orchestrator only
│   ├── utils.js
│   ├── easings.js
│   ├── shared/
│   │   ├── registry.js           # kill/revert helpers
│   │   ├── createElements.js     # selector → DOM map (from REFACTOR pseudo-code)
│   │   └── scrollReveal.js       # optional primitives (when duplicated 3×)
│   ├── modules/
│   │   ├── hero.js               # timeline
│   │   ├── section-1.js          # scrollTrigger
│   │   ├── section-2.js
│   │   ├── section-3.js          # effect (wide-slide)
│   │   ├── section-4.js
│   │   ├── section-5.js          # effect (tarot)
│   │   ├── section-6.js          # effect
│   │   ├── section-7.js
│   │   ├── section-8.js          # effect (callbacks)
│   │   └── footer.js             # timeline
│   └── effects/                  # shared effect implementations (phase 7)
│       ├── wide-slide.js
│       └── tarot-grid.js
└── docs/
    ├── PLAN.md                   # this file
    └── REFACTOR.md
```

Delete or repurpose `js/timeline/sectionOne.js` once hero/section-1 modules exist.

---

## Orchestrator Shape

```js
// js/script.js
import { createHero } from "./modules/hero.js";
import { createSection1 } from "./modules/section-1.js";
// …

const modules = [];

document.fonts.ready.then(() => {
  modules.push(
    createHero(),
    createSection1(),
    // … in DOM order
    createFooter(),
  );

  modules.forEach((m) => m.create());

  ScrollTrigger.refresh();
});

export function destroyAllModules() {
  modules.forEach((m) => m.destroy());
  modules.length = 0;
}

// init — call once after fonts.ready
export function initAnimations() {
  modules.push(createHero(), createSection1(), /* … */, createFooter());
  modules.forEach((m) => m.create());
  ScrollTrigger.refresh();
}
```

**Resolved:** The orchestrator is an **init registry** — it registers modules and calls `create()` so each section sets up its animations. **Scroll (via ScrollTrigger) determines when those animations run**; the orchestrator does not drive scroll progress or chain a page-wide master timeline. Hero is the exception: it plays on load via its internal timeline inside `hero.js`.

`destroyAllModules()` is **part of the orchestrator contract** — exported from day one, documented below. It is not wired to browser events on this static demo until Lenis / page transitions land (Phase 5).

---

## Global teardown — when and where

`destroyAllModules()` is baked into the design so the pattern ports to other projects (Lenis, View Transitions, Turbo, etc.). Each module implements `destroy()`; the orchestrator loops and clears the registry.

### When to call `destroyAllModules()`

| Scenario | Call teardown? | Notes |
|----------|----------------|-------|
| Static page — user scrolls and leaves | **No** | Normal demo use; modules live for page lifetime |
| `autoSplit` / `refreshInit` resize | **No** | Use private `registry.killTweens()` inside the module |
| `matchMedia` — rebuild all animations at breakpoint | **Maybe** | Full `destroy()` + `create()` on affected modules, or per-module rebuild |
| Dev hot reload / HMR | **Yes** (when hook exists) | Prevents duplicate ScrollTriggers stacking |
| SPA route leave (React router, Turbo, etc.) | **Yes** | Before unmounting DOM or navigating away |
| View Transitions / page transitions | **Yes** | Before transition out or after `viewTransition.finished` — pick one consistent hook |
| Lenis destroy / re-init | **Yes** | Tear down modules before destroying Lenis instance |
| Manual debug in DevTools | **Yes** | `destroyAllModules()` then `initAnimations()` to verify clean re-init |

### When **not** to call it

- **Not** on every scroll event
- **Not** inside `onSplit` — partial `registry.killTweens()` only
- **Not** inside `ScrollTrigger.refreshInit` — partial rebuild only (section 8)

### Porting to another project

```js
// orchestrator exports both directions
export function initAnimations() { /* push modules, create(), refresh */ }
export function destroyAllModules() { /* forEach destroy, clear array */ }

// SPA / page transition (example)
router.on("leave", async () => {
  destroyAllModules();
  // optional: await pageTransitionOut()
});

router.on("enter", () => {
  initAnimations();
});

// View Transitions API (example)
document.startViewTransition(async () => {
  destroyAllModules();
  await navigate();
  initAnimations();
});
```

### Lenis integration (Phase 5 — end of refactor)

Lenis is added **after** all sections are modular. Order matters: modules first, smooth scroll second.

```js
// js/lenis.js (Phase 5)
import Lenis from "lenis";

let lenis;

export function initLenis() {
  lenis = new Lenis({ /* … */ });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroyLenis() {
  lenis?.destroy();
  lenis = null;
}
```

```js
// script.js — full lifecycle
import { initAnimations, destroyAllModules } from "./orchestrator.js";
import { initLenis, destroyLenis } from "./lenis.js";

document.fonts.ready.then(() => {
  initAnimations();
  initLenis();
});

// page transition or route leave
export function destroyPage() {
  destroyAllModules();
  destroyLenis();
  ScrollTrigger.getAll().length; // debug: should be 0
}
```

**Lenis rule:** `ScrollTrigger.update` on Lenis scroll; never call `destroyAllModules()` on Lenis scroll — only on navigation/teardown.

---

## Section → Module Type Map

| Section | Module file | Type | Notes |
|---------|-------------|------|-------|
| hero | `hero.js` | timeline | Plays on load |
| section-1 | `section-1.js` | scrollTrigger | `autoSplit` on paragraphs |
| section-2 | `section-2.js` | scrollTrigger | Per-group items registry |
| section-3 | `section-3.js` | effect | `buildLineSpread` → `effects/wide-slide.js` later |
| section-4 | `section-4.js` | scrollTrigger | Pin/scrub |
| section-5 | `section-5.js` | effect | Tarot |
| section-6 | `section-6.js` | effect | Tarot variant |
| section-7 | `section-7.js` | scrollTrigger | |
| section-8 | `section-8.js` | effect | `refreshInit` rebuild |
| footer | `footer.js` | timeline | ST-gated play/reverse |

---

## Implementation Phases

Order from REFACTOR.md — **one section at a time**, verify in browser before next.

### Phase 0 — Foundations (no behavior change)

- [x] Resolve Decision Log (#1–6)
- [ ] **`data-panel` → `data-section` migration** (HTML, CSS, JS selectors — see [Migration scope](#data-section-migration))
- [ ] Add `js/shared/registry.js` + `createElements.js`
- [ ] Define `AnimationModule` JSDoc typedef in `shared/types.js` or registry file
- [ ] Scaffold orchestrator: `initAnimations()` + exported `destroyAllModules()` (no Lenis yet)

### Phase 1 — Extract + module shape (section by section)

For each section, in DOM order:

1. Cut storyboard + config + animation from `script.js` → `modules/section-N.js`
2. Wrap in factory returning `{ id, type, create, destroy, registry }`
3. Wire into orchestrator; delete inline block from `script.js`
4. Manual test: load, scroll, resize (if `autoSplit`), scroll back

**Suggested order:** hero → section-1 → section-2 → … → footer

### Phase 2 — Registry hardening

- [ ] Bundle tweens on items (section 2 groups, section 8 phrases)
- [ ] `autoSplit` + kill-in-`onSplit` where resize matters (sections 1, 2, 8)
- [ ] Footer: keep Pattern C from REFACTOR.md (CSS hide + `clearProps` on reverse)

### Phase 3 — Shared effects

- [ ] Extract `wide-slide` from section-3
- [ ] Extract shared tarot logic from sections 5 + 6
- [ ] Extract section-8 callback rebuild pattern

### Phase 4 — Primitives (only if duplicated)

- [ ] `createScrollReveal`, `createLineSplit`, etc. when 3+ modules share exact pattern

### Phase 5 — Lenis + scroll integration (last)

Add smooth scroll after all modules are extracted and tested.

- [ ] Add `js/lenis.js` — `initLenis()` / `destroyLenis()`
- [ ] Wire `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker` raf loop
- [ ] Export `destroyPage()` — `destroyAllModules()` then `destroyLenis()`
- [ ] Document hook point for future page transitions
- [ ] Verify pin/scrub sections (3, 4, 6, 7) after Lenis — `ScrollTrigger.refresh()` post-init
- [ ] Test teardown: `destroyPage()` → `ScrollTrigger.getAll().length === 0`

---

## Per-Module File Template

```js
/* ── STORYBOARD ───────────────────────────────────────
 * …
 * PATTERN: …
 * ───────────────────────────────────────────────────── */

import { createRegistry } from "../shared/registry.js";
import { createElements } from "../shared/createElements.js";

const CONFIG = {
  SELECTORS: { … },
  // split, scroll, tween vars
};

export function createSection2() {
  const registry = createRegistry();
  let elements = null;
  let items = [];

  function buildItem(group) { … }

  return {
    id: "section-2",
    type: "scrollTrigger",
    registry,
    create() {
      elements = createElements(CONFIG.SELECTORS);
      items = elements.groups.map(buildItem);
    },
    destroy() {
      registry.destroy();
      items = [];
      elements = null;
    },
    revert() {
      items.forEach((item) => item.split?.revert());
    },
  };
}
```

---

## Testing Checklist (per section)

- [ ] First paint: no FOUC (prehide / CSS opacity)
- [ ] Scroll into view: animation fires once (or scrubs correctly)
- [ ] Scroll away and back: footer reverses; `once: true` sections don't re-fire
- [ ] Resize: line counts update if `autoSplit`
- [ ] `destroyAllModules()` leaves no ScrollTriggers in `ScrollTrigger.getAll()`
- [ ] DevTools: module registry shows expected handles

---

## Decision Log

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| 1 | What is the Orchestrator — init registry vs master GSAP timeline? | **Resolved** | Init registry: `modules.forEach(m => m.create())` then `ScrollTrigger.refresh()`. Scroll drives playback; orchestrator only registers and sets up. |
| 2 | Canonical term: section vs frame vs panel? | **Resolved** | `section` everywhere. HTML: `data-section="N"`. JS: `section-N.js`, `createSectionN()`, `[data-section='N']`. Retire frame/panel in new code. |
| 3 | Public API: `destroy` only vs `reset` + `destroy`? | **Resolved** | Public: `create()`, `destroy()`, optional `revert()`. Partial kill via private `buildTweens()` → `registry.killTweens()`. |
| 4 | Private `init`/`setup` vs single `create()`? | **Resolved** | Single public `create()`; prep inlined or private helpers. |
| 7 | Who kills tweens / ScrollTriggers? | **Resolved** | Always inside module via registry. Orchestrator only calls `module.destroy()`. |
| 5 | Effect modules: custom factories vs `gsap.registerEffect`? | **Resolved** | Option A: `js/effects/*.js` export factories (`createWideSlide`, etc.) that receive `registry` and register tweens. Hybrid path documented if effects ship cross-project later. |
| 6 | SPA teardown needed now or stub for later? | **Resolved** | Export `destroyAllModules()` + `initAnimations()` from orchestrator now; document when to call (SPA, transitions, Lenis teardown). Wire Lenis in Phase 5 at end of refactor. No `pagehide` hook on static demo unless needed for dev. |

---

## `data-section` migration

Rename `data-panel` → `data-section` for consistent scanning across HTML, CSS, and JS.

**Update in Phase 0** (before or alongside first module extract):

| File | Occurrences |
|------|-------------|
| `index.html` | 8 `<section>` elements |
| `css/page.css` | ~15 attribute selectors (includes `data-panel="9"` — verify if orphan) |
| `js/script.js` | 8 `SECTION` config selectors |
| `images.html` | 1 (if still used) |

**Defer** (update when touched): `DOCUMENTATION.md`, `MARKUP-REFACTOR-PLAN.md`, `SPLIT-TEXT-REFACTORING.md`, `REFACTOR.md`, `NOTES.md`

**Pattern:**

```html
<!-- before -->
<section class="page-section" data-panel="2">

<!-- after -->
<section class="page-section" data-section="2">
```

```js
// CONFIG
SECTION: "[data-section='2']",
```

```css
.page-section[data-section="2"] { … }
```

---

## References

- [REFACTOR.md](./REFACTOR.md) — prehide patterns, module interface notes, pseudo-code
- [DOCUMENTATION.md](./DOCUMENTATION.md) — registry/factory options A–E (frame terminology)
- [MARKUP-REFACTOR-PLAN.md](./MARKUP-REFACTOR-PLAN.md) — HTML/CSS alignment
