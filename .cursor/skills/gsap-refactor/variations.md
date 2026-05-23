**Part of [GSAP Refactor](code-design/ai/skills/intrinsic-css/SKILL.md) by Nick Lyons** · Follow the Shared Rules in [SKILL.md](code-design/ai/skills/intrinsic-css/SKILL.md)

Propose variations on an existing animation: what to tweak to change its feel, and what to add to make it richer. The goal is a menu of concrete, codeable options — not vague "you could make it bouncier."

Output to `./docs/ANIMATION_VARIATIONS.md`.

## When to use
- User says "variations", "make it feel different", "what else could I animate", "spice this up", "more nuanced"
- User has a working animation and wants alternates without rebuilding it

## First, read what exists
Reference `./docs/ANIMATION_STORYBOARD.md` or `./docs/ANIMATION_CODE.md` if present. Identify what's *already* animated — every variation is "change this" or "add a channel alongside this." Don't propose what's already there.

## Two kinds of variation

**1. Tweak — same properties, different feel.** Change values or the curve, not the channels. Cheapest to try, lowest risk.

**2. Layer — animate more properties at once.** Add a channel that moves *with* the existing one. This is where nuance comes from: real motion rarely changes one thing in isolation.

## What to tweak (the dials)

Most GSAP animations only ride 2–3 properties. The biggest feel-change per line of code comes from the curve and the choreography, not from adding properties.

| Dial | What it changes | Try |
|---|---|---|
| `ease` | The *character* of the motion — the single highest-leverage tweak | `power2.out` (decelerate), `back.out(1.7)` (overshoot), `elastic`, `expo`, custom `CustomEase` |
| `duration` / `scrub` | Pace; `scrub: true` snaps, `scrub: 1` lags ~1s behind scroll | Lengthen for weight, shorten for snap |
| `stagger` | Offset between repeated elements — turns a group move into a wave | `stagger: 0.08`, or `{ each, from: "center" \| "edges" \| "random" }` |
| `transformOrigin` | The pivot — same scale/rotate reads completely differently | `"top left"`, `"50% 100%"`, `"center"` |
| start/end (ScrollTrigger) | When the animation arms and rests | Widen the range for a slower scrub, tighten for punch |

**Ease is the first thing to try.** It's one string and it changes everything about how the motion *feels*. Show the same animation with two or three eases before touching anything else.

## What to layer (commonly animated properties)

GSAP animates any numeric CSS property plus transforms. The reliable, GPU-friendly channels:

| Property | Effect | Pairs well with |
|---|---|---|
| `x` / `y` | Translate (use these, not `left`/`top` — they're transform-based, no layout reflow) | Almost anything |
| `scale` / `scaleX` / `scaleY` | Zoom; non-uniform scale = squash/stretch | `transformOrigin`, `rotation` |
| `rotation` / `rotationX` / `rotationY` | Spin; the X/Y variants tilt in 3D | `transformPerspective`, `scale` |
| `opacity` | Fade | A transform — fades alone feel flat |
| `filter` (`blur`, `brightness`) | Focus pull, glow | `opacity` for a depth-of-field reveal |

### Underused properties that add nuance
These are where animations stop looking generic. Most code never touches them:

| Property | What it unlocks | Note |
|---|---|---|
| `transformPerspective` | Makes `rotationX/Y` read as real 3D depth instead of flat skew | Set on the element (e.g. `400`–`1000`); lower = more dramatic |
| `skewX` / `skewY` | Shear — pairs with `x` velocity to fake momentum/lag on fast moves | Subtle (2–8deg); great on scroll-velocity-driven motion |
| `transformOrigin` | Covered above as a dial, but *animating between origins* is rare and striking | |
| `filter: blur()` | Motion blur on fast moves, focus-pull on reveals | Costs more GPU — test on mobile |
| `clip-path` / `--custom-prop` | Reveal wipes, animating CSS variables that drive gradients/masks | GSAP animates CSS vars directly: `gsap.to(el, { "--x": "100%" })` |
| `drawSVG` / `morphSVG` (plugins) | Line-drawing and shape morphing | Requires the GSAP plugin |

## The "move together" principle
A single property changing alone reads as mechanical. Nuance comes from **correlated channels**: as something scales up it also fades in and drifts up 8px; as a card flips on `rotationY` its `transformPerspective` and a `blur` resolve together. When proposing a layer, state *which existing channel it rides alongside* and why they belong together.

## Document outline

```
# Variations on <animation name>
[1 line: what's currently animated, so the deltas are clear]

## Quick tweaks (same properties)
[Table or short list: dial → value to try → resulting feel. Lead with ease.]

## Layered variations (add channels)
[2–4 concrete options. Each: what property to add, which existing channel
 it rides with, the feel it creates, and a code snippet showing the addition.]

## One worth building
[Pick the single most promising variation and give the fuller version —
 the config additions and the tween/timeline change, ready to drop in.]
```

## Rules
- **Concrete over adjectives.** "Add `rotationX: 12` with `transformPerspective: 600`" not "make it more dynamic."
- **Show the delta, not the whole file.** Variations are additions to working code — show what changes.
- **Respect the existing config pattern.** New values go in the existing config objects (see storyboard skill), never as inline magic numbers.
- **Flag cost.** If a variation animates a non-transform property (`filter`, `clip-path`, layout props), note the performance trade-off.
