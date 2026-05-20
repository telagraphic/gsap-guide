**Part of [GSAP Refactor](SKILL.md) by Nick Lyons**

A pattern for writing and refactoring GSAP animations into a human-readable storyboard format. Every timing value, scale, position, and spring config is extracted to named constants at the top of the file so you can read the animation like a script and tune any value instantly.

Generate a file named ANIMATION_OVERVIEW.md in a folder named `./docs`. Create `./docs` if it does not exist.


## Big Picture

Provide a big picture of the animation describing if time or scroll or other based animation, layering, types of transforms, and css or javascript techniques implemented to be aware of.


## When to use

- User says "summarize animation", "explain this animation", "what is this animation", "storyboard", etc.
- User points to a file or current directory that has html, css and javascript files


## The Storyboard Pattern

Every animated component follows this exact structure:
### 1. ASCII Storyboard

A block comment at the top of the file that reads like a shot list. Anyone can scan it and understand the full sequence without reading code:

```javascript
/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *    0ms   waiting for scroll into view
 *  300ms   card fades in, scale 0.85 → 1.0
 *  900ms   heading highlights
 * 1500ms   rows slide up (staggered 200ms)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  cardAppear:  300,   // card fades in
  heading:     900,   // heading highlights
  rows:        1500,  // rows start staggering
};
```


If not time based, use scroll progress as percentage or viewport progress as the replacement for timing:

```javascript
/*
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
 */
```


Scroll-based with ScrollTrigger storyboard:

```
VIEWPORT (what you SEE — top paints over bottom in DOM order)
══════════════════════════════════════════════════════════════

PHASE ──► scroll position          paint stack (bottom → top)     progress    transforms (inline)
──────────────────────────────────────────────────────────────────────────────────────────────────

BEFORE    │....................│  [ fixed gallery stage ]         (idle /     defaults or
TRACK     │  hero │ intro ████ │  ████████████████████████         last)       last values*
          └─ opaque .container ─┘           ▲
                                    covered by scrolling content


START     track top ─── hits ───► bottom edge of viewport
          │.....................│  [ fixed gallery ]              p → 0        grid scale(1)
          │ ░░░ track (0px) ░░░ │  █ transparent “hole”           trigger      sides +0
          │        (start)      │                                 arms         hero img scale(2)


INSIDE    ~600vh of track in view  [ fixed gallery ] READS AS    p : 0→1      • grid scale ↑
TRACK     │ ░░░░░░░░░░░░░░░░░░░ │  foreground (mostly air)                     (1 → 1+maxScale)
(scrub)   │  transparent ruler  │  ▲ still see fixed stage                      • sides translateY ↑
          │....................│                                              • hero img scale ↓
                                                                              scrub lags scroll ~1s


END       track bottom ── hits ──► viewport bottom
          │.....................│  same stack                    p → 1        grid scale(1+maxScale)
          │ ░░░ track (end) ░░░ │                                 “rest”       sides +300px
          └────────────────────┘                                              hero ~1.15


AFTER     outro / footer ████ again
TRACK     │....................│  [ fixed gallery ]             (inactive)    transforms NOT reset
          └─ opaque ──────────┘           ▲                    in this proj
                                     covered again

Legend: ███ opaque section   ░░░ transparent .gallery-scroll-track   * inactive trigger
```



Rules for the storyboard comment:
- Right-align the ms values for scannability
- Use `→` to show value transitions (e.g. `scale 0.8 → 1.5`)
- Note stagger intervals in parentheses
- Keep descriptions short — one line per stage

### 2. TIMING Object

A single `const TIMING` object with every stage delay in milliseconds. This is the **only place** timing values live. If not time based, use scroll progress as percentage or viewport progress as the replacement for timing.

```tsx
const TIMING = {
  cardAppear:    300,   // card fades in and scales up
  headingGlow:   900,   // heading text highlights
  detailRows:    1500,  // rows start staggering in
  ctaButton:     2100,  // button fades in
};
```


### 3. Element Config Objects

Each animated element (or group of elements) gets its own named config object with all its visual values and config.

```tsx
/* Card container */
const CARD = {
  initialScale: 0.85,   // scale before appearing
  finalScale:   1.0,     // resting scale
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
};

/* Detail rows */
const ROWS = {
  stagger:  0.2,   // seconds between each row
  offsetY:  12,    // px each row slides up from
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
  items: [
    { label: "Row 1", value: "A" },
    { label: "Row 2", value: "B" },
  ],
};
```


### 4. Show connections across HTML, CSS, JS

Identify important connections between CSS properties and values for an element or layer and how it is modified by Javascript. CSS will typically be applied before Javascript executes so it is important to call out what properties and values have an effect on the styling and transforms by the GSAP code.




## How to apply

When the user provides a file or code with animations:

1. **Read the code** and identify every animated element and its timing or key transforms
2. **Extract** all magic numbers (delays, scales, positions, springs) into config objects
3. **Write the storyboard comment** describing the sequence in plain English
4. **Create the TIMING object** with all stage delays
5. **Create element config objects** grouping values by animated element


### Quick checklist

Before finishing, verify:
- [ ] Storyboard comment at top matches the actual TIMING values
- [ ] Zero magic numbers in code
- [ ] Repeated elements use `.map()` over a data array




