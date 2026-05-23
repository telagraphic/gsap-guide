
---
name: gsap-refactor
description: "GSAP Refactor by Nick Lyons — a toolkit for storyboarding, auditing, refactoring, documenting, varying, debugging, optimizing and porting spaghetti code to component/modules. Inspired and borrows from Josh Puckett's Interface Craft skills. Triggers on: overview, summarize, animate, animation, transition, storyboard, refactor, document, audit, vary, variation, tweak, debug, jank, fps, performance, optimize, port, react, useGSAP."
argument-hint: "[description, file path, or sub-skill name]"

---

# GSAP: Refactoring, Documenting, and Teaching

**By Nick Lyons**

A toolkit for understanding gsap animations, auditing code, refactoring, and teaching via documentation.


| Skill                       | When to Use                                                                                                                      | What it does                                                                                        | Invoke                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [storyboard](storyboard.md) | Writing or attempting to understand what the animation code does or how it works into a human-readable DSL                       | Creates a diagram of time/scroll progress along with config objects for each animation              | `/gsap-refactor storyboard` or asked to describe an animation                                              |
| [analyze](analyze.md)       | Explain the code step by step and translate the changes to a visual diagram or metaphor                                          | Breakdown code animation step by step for understanding paired with diagrams to visually illustrate | `/gsap-refactor analyze` or asked to describe the code                                                     |
| [audit](audit.md)           | Discover and provide a list of code improvements for performance, readability, and reduce complexity                             | Outputs a prioritized list of refactoring items, code suggestions to implement                      | `/gsap-refactor audit` or asked to improvements or suggestions                                             |
| [refactor](refactor.md)     | Implement suggested code improvements, ask questions about refactoring approaches or preferences for the implementation refactor |                                                                                                     | `/gsap-refactor refactor` or asked to refactor or improve the code                                         |
| [document](document.md)     | Document the code refactoring changes with teachable explanations and details about implements and approaches                    |                                                                                                     | `/gsap-refactor document` or asked to explain the decisions or approaches for the code changes implemented |
| [variations](variations.md)             | Propose variations on a working animation — what to tweak or layer to change its feel or add nuance                              | Outputs a menu of concrete tweaks (ease, stagger, origin) and added channels, with code deltas      | `/gsap-refactor vary` or asked for variations, alternate feels, or "what else could I animate"             |
| [debug](debug.md)           | Fix a broken animation — jank, wrong trigger positions, transforms not reverting, Lenis/SPA conflicts                            | Diagnoses the cause from common GSAP failure modes and gives the minimal fix                         | `/gsap-refactor debug` or "it's janky", "not firing", "won't reset", "broken"                              |
| [optimize](optimize.md)     | Make a working-but-stuttering animation hit 60fps — reflow, layer, and callback costs                                            | Profiler-led list of fixes ranked by impact, with mobile cost flagged                                | `/gsap-refactor optimize` or asked about performance, jank, fps, "runs slow"                               |
| [port](port.md)             | Translate an animation between vanilla GSAP and React (`useGSAP`) without changing how it looks                                  | Faithful idiom conversion in either direction, noting what can't translate 1:1                       | `/gsap-refactor port` or "convert to React", "make this vanilla", "port to useGSAP"                        |


## Sub-Skill Routing


When the user invokes `/gsap-refactor`:

1. **With `storyboard` argument or animation-related context** → Load and follow [storyboard.md](storyboard.md)
2. **With `analyze` argument or animation-related context** → Load and follow [analyze.md](analyze.md)
3. **With `audit` argument or code improvement or refactoring context** → Load and follow [audit.md](audit.md)
4. **With `refactor` argument or implement changes context** → Load and follow [refactor.md](refactor.md)
5. **With `document` argument or explain-related context** → Load and follow [document.md](document.md)
6. **With `vary` argument or context asking for variations, alternate feels, or more nuance** → Load and follow [variations.md](variations.md)
7. **With `debug` argument or context describing broken behavior (jank, not firing, won't reset)** → Load and follow [debug.md](debug.md)
8. **With `optimize` argument or context about performance / fps / stutter** → Load and follow [optimize.md](optimize.md)
9. **With `port` argument or context about converting between vanilla GSAP and React** → Load and follow [port.md](port.md)
10. **With a file path** → Read the file, detect whether it needs overview, audit, refactor or document and apply the appropriate skill
11. **Ambiguous** → Ask which skill to use

In all cases, apply the **Shared Rules** below — they govern voice, depth, and output format for every sub-skill.

## Design Principles

1. **Readable over clever** — Anyone should be able to scan the top of a file and understand the animation sequence without reading implementation code
2. **Teaching in Documentation** — Implement a teaching based documentation approach when explaining API methods or code concepts/changes to underscore the importance of your suggestions

---

## Shared Rules

*Every sub-skill follows these. They are defined here once — do not duplicate them into sub-skill files.*

### Voice

Senior engineer reviewing work with a junior engineer they respect. Direct, analytical, honest — rooted in wanting the code to be great. No cruelty, no condescension, no hand-holding.

**BE:**
- **Specific** — "Three ScrollTriggers each set their own `scrub` value" not "scrub is configured in multiple places"
- **Decisive** — "This is duplicated" not "this might be slightly repetitive"
- **Factual first** — State what the code does before judging it
- **Impact-aware** — Connect every observation to a runtime, readability, or maintenance cost
- **Quantitative** — Count the call sites, name the property, measure the cost

**DO NOT:**
- **Hedge** — no "maybe," "perhaps," "it could be argued"
- **Apologize** — no "unfortunately"
- **Narrate** — never write "In this section I will..." Just do it
- **Pad** — no empty compliments, no restating the prompt back
- **Prescribe without reasoning** — never "change X to Y" without the why

### Where depth goes (and where it doesn't)

Detail and teaching depth are the priority — but spend the budget deliberately:

- **Spend depth on:** the non-obvious calculation, the "why" behind a refactor decision, the one concept a reader would otherwise get wrong.
- **Spend nothing on:** code that's self-evident, restating what a diagram already showed, metaphors for things that need none.

A row, table, diagram, or paragraph that doesn't teach something the reader couldn't get by glancing at the code should be cut. **One strong explanation beats three weak ones.**

### Metaphor gate

Use a metaphor only when it makes a non-obvious concept click. Skip it for self-evident code. A forced metaphor costs more attention than it saves.

### Function call diagram format

```
preloadImages()
    │
    ├─> prepareImages()
    │       └─> normalizeImages()  → Uses: SELECTORS.LAZY_IMAGES
    │
    └─> loadSingleImage()  (per image)
            └─> isImageLoaded()? → handleImageReady() → decodeImage()
```

### Output quality bar

- **No restated instructions** — the document does the work, it doesn't describe doing it
- **No magic numbers** in any code shown — extract to named config
- **Every section earns its place** — if two sections overlap, merge them
- **Scannable** — a reader should find any section by glancing at headers











