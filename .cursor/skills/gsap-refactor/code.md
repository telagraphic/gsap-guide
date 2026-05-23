**Part of [GSAP Refactor](code-design/ai/skills/intrinsic-css/SKILL.md) by Nick Lyons** · Follow the Shared Rules in [SKILL.md](code-design/ai/skills/intrinsic-css/SKILL.md)

Explain how the animation code works — the key calculations, how variables relate, and how scroll/time drives what appears on screen. Visualize viewport, scroll, and timeline with ASCII diagrams.

Output to `./docs/ANIMATION_CODE.md`.

## When to use
- User says "review the animation code", "analyze the animation", "break down the code", "how does this work"
- User points to a file or directory with HTML/CSS/JS

## Document outline

Use this structure exactly. Omit a section if the code doesn't warrant it (say so in one line rather than padding it).

```
# <Animation name>
[1–2 sentences: what it is, what drives it — time, scroll, or both]

## Key variables & calculations
[Table: variable | what it does | changes or fixed? | what drives the change]

## How it works, step by step
[The core calculation, shown with ONE diagram + ONE sample-value table
 at progress 0 / 0.5 / 1 (or equivalent keyframes). Max ~4 rows.]

## Function call sequence       (only if multi-function)
[Tree diagram — see Shared Rules in SKILL.md]

## The tricky part
[The ONE concept a reader would get wrong, explained plainly. Metaphor if it helps.]
```

## What each section must do

**Key variables & calculations.** Only the variables that *drive* the animation. Skip loop counters and obvious locals. The "what drives the change" column is the teaching — that's where the relationships live.

**How it works.** Pick the single most important transform and trace it. One ASCII diagram showing the geometry, one table showing real values at a few keyframes. Don't re-explain the table in prose afterward — the table *is* the explanation. Name what DOM/GSAP methods return only when the return value is non-obvious (e.g. `self.progress` → 0–1 float; skip explaining `querySelector`).

**The tricky part.** Every animation has one piece that isn't obvious from reading it — a coordinate-space gotcha, a scrub-lag effect, a transform-origin dependency. Find it and make the reader *see* it. This is where your depth budget goes.

## Length
Detail beats brevity here, but earn it. A reader should finish understanding the animation, not your description of it. If a section restates the code without adding insight, cut it.
