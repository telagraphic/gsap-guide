**Part of [GSAP Refactor](SKILL.md) by Nick Lyons**

Implement a code refactoring to improve spaghetti GSAP code to a more component/module pattern.

Reference the `./docs/ANIMATION_AUDIT.md` if it exists to assist for this task.


## Guided Flow Questions

Review `./docs/ANIMATION_AUDIT.md` and ask enough follow up questions on how to address each design and code issue. Refer to the Refactoring Goals section below for more questions.

If no `./docs/ANIMATION_AUDIT.md` exists, proceed with reviewing the `code-audit.md` skill to derive a set of questions to ask for finalizing the refactoring requirements and final plan. Refer to the Refactoring Goals section below for more questions.

Generate a `./docs/REFACTOR_PLAN.md` once the question and answer conversation is complete and final to record an artifact for future review.

## Refactoring Goals
### 1. Identify modern approaches and patterns
Implement an improved design pattern if applicable. Prefer modern syntax and modern GSAP. But don't be overly clever, emphasize clear step by step sequential readability versus complicated or overly abstract code.

### 2. Apply consistent labels and names
Prefer a consistent naming system for functions and variables to clearly communicate the purpose with full words, not abbreviations.
### 3. Improve composability
Breaking the code into related functionality will improve the readability and reduce complexity of understanding. Move reads and writes or configuration or execution into their own functions as best as possible.

### 4. Expose functionality or lifecycle via methods
Depending on the animation, expect that it will be called from an orchestrator via another GSAP scroll trigger, master timeline or Lenis smooth scroll. This means exposing a play, pause, stop, revert or kill and remove methods might be applicable.

As a part of this refactoring skill, ask if these features will be useful or provide a use case where it could be.

## How to Apply

Once the question and answer session is complete, it is time to implement the actual code changes.

Ask "Should we proceed with the refactoring plan?" to confirm if the requirements are ready for development.