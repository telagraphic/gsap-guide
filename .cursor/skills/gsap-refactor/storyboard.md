**Part of [GSAP Refactor](SKILL.md) by Nick Lyons** · Follow the Shared Rules in [SKILL.md](SKILL.md)

A pattern for writing and refactoring GSAP animations into a human-readable storyboard format. Every timing value, scale, position, and spring config is extracted to named constants at the top of the file so you can read the animation like a script and tune any value instantly.

Generate a file named `./docs/ANIMATION_STORYBOARD.md`  in a folder named. Create `./docs` if it does not exist.

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


**Scroll-based variants.** When the animation is scrubbed rather than timed, replace `ms` with `progress` (0→1) or viewport percentage. Two forms:

- **Progress list** — each keyframe (0.00, 0.25, 0.50, 0.75, 1.00) lists every channel's value on its own line, noting `scrub` and that channels update together. Use when the reader needs exact values per step.
- **Viewport paint diagram** — a phase table (BEFORE / START / INSIDE / END / AFTER) showing scroll position, paint stack (bottom→top DOM order), progress, and inline transforms side by side. Use when *layering* and what-paints-over-what is the thing that confuses people. Include a legend for fill characters.

Both follow the same rules below; pick the one that clarifies the specific animation. Don't produce all three forms for one animation.



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

Identify important CSS properties and values that are used in the animation how they are modified by Javascript. CSS will typically be applied before Javascript executes so it is important to call out what properties and values have an effect on the styling and transforms by the GSAP code.


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




