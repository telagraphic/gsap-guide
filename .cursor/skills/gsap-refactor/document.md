**Part of [GSAP Refactor](SKILL.md) by Nick Lyons** · Follow the Shared Rules in [SKILL.md](SKILL.md)

Two jobs: synthesize what changed from the original code to the refactor, and teach *why* — so a junior engineer internalizes the patterns, not just the diff.

Teach like a senior dev: explain the design pattern over the anti-pattern, the composable component over the one-off. Frame it as a reusable "how to refactor GSAP" guide, not a changelog.

Reference `./docs/REFACTOR_PLAN.md` for the before/after. Output to `./docs/ANIMATION_REFACTOR.md`.

## Document outline

```
# <Title> — one line on what the animation does

## What changed and why
[The refactoring decisions, as a table: before → after → why it's better.
 GSAP/JS reasoning lives in the "why" column. This is the heart of the doc.]

## Patterns applied
[Ordered list of the higher-level patterns — composability, config objects,
 lifecycle methods — each with one line on what problem it solves]

## The hard parts
[The 1–2 concepts that aren't obvious. Metaphor here if it earns its place.]

## Function sequence
[Tree diagram of the refactored call flow — see Shared Rules in SKILL.md]
```

## What each section must do

**What changed and why.** This is where depth lives. For each meaningful change: the before, the after, and the GSAP or JS concept that makes the new version better (performance, reusability, readability, memory). Don't list trivial renames individually — group them ("abbreviations → full words across all configs"). The "why" column teaches; make it carry real reasoning, not "it's cleaner."

**Patterns applied.** Name the pattern, state the problem it solves in one line. e.g. *Config object — single source of truth for tunable values, replaces magic numbers scattered across ScrollTriggers.* If you exposed `play/pause/kill` methods, explain the orchestration use case (master timeline, Lenis, parent ScrollTrigger) in one or two sentences.

**The hard parts.** The concept a reader would otherwise get wrong. A good metaphor belongs here if one exists — the proven ones:

| Concept | Metaphor | Why it fits |
|---|---|---|
| `self.progress` (0→1) | Dimmer switch | One number = how far through the segment; off → on |
| `scrub: 1` | Heavy camera dolly | Camera eases toward scroll instead of snapping |
| Trigger vs animated els | Thermostat vs radiators | One sensor decides *when*; many outputs change *what* |

Reuse these only if relevant. Don't invent weak ones to fill the table.

## Length
Teaching depth is the priority — but the diff is not the lesson, the *reasoning* is. Cut anything that describes a change without explaining the principle behind it.
