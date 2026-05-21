
---
name: gsap-refactor
description: "GSAP Refactor by Nick Lyons — a toolkit for storyboarding, auditing, refactoring and documenting spaghetti code to component/modules. Inspired and borrows from Josh Puckett's Interface Craft skills. Triggers on: overview, summarize, animate, animation, transition, storyboard, refactor, document, audit."
argument-hint: "[description, file path, or sub-skill name]"

---

# GSAP: Refactoring, Documenting, and Teaching

**By Nick Lyons**

A toolkit for understanding gsap animations, auditing code, refactoring, and teaching via documentation.


| Skill                       | When to Use                                                                                                                      | Invoke                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [storyboard](storyboard.md) | Writing or attempting to understand what the animation code does or how it works into a human-readable DSL                       | `/gsap-code storyboard` or asked to describe an animation                                              |
| [audit](audit.md)           | Discover and provide a list of code improvements for performance, readability, and reduce complexity                             | `/gsap-code audit` or asked to improvements or suggestions                                             |
| [refactor](refactor.md)     | Implement suggested code improvements, ask questions about refactoring approaches or preferences for the implementation refactor | `/gsap-code refactor` or asked to refactor or improve the code                                         |
| [document](document.md)     | Document the code refactoring changes with teachable explanations and details about implements and approaches                    | `/gsap-code document` or asked to explain the decisions or approaches for the code changes implemented |


## Sub-Skill Routing


When the user invokes `/gsap-code`:

1. **With `storyboard` argument or animation-related context** → Load and follow [storyboard.md](storyboard.md)
2. **With `audit` argument or code improvement or refactoring context** → Load and follow [audit.md](audit.md)
3. **With `refactor` argument or implement changes context** → Load and follow [refactor.md](refactor.md)
4. **With `document` argument or explain-related context** → Load and follow [document.md](document.md)
5. **With a file path** → Read the file, detect whether it needs overview, audit, refactor or document and apply the appropriate skill
6. **Ambiguous** → Ask which skill to use

## Design Principles

1. **Readable over clever** — Anyone should be able to scan the top of a file and understand the animation sequence without reading implementation code
2. **Teaching in Documentation** — Implement a teaching based documentation approach when explaining API methods or code concepts/changes to underscore the importance of your suggestions











