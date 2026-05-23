**Part of [GSAP Refactor](SKILL.md) by Nick Lyons** · Follow the Shared Rules in [SKILL.md](SKILL.md)

Review the code for bugs, anti-patterns, lack of architecture, and suggest refactoring concepts or ideas to improve the codebase according to GSAP and Javascript best practices.

Generate a file named `./docs/ANIMATION_AUDIT.md` with your results and response.

## When to use

- User says "critique this animation", "improvements", "refactor ideas", 
- User points to a file or current directory that has html, css and javascript files

## Audit Methodology

### 1. Understand the code 
First, reference the `./docs/ANIMATION_STORYBOARD.md`  and `./docs/ANIMATION_CODE.md`  if it exists for an overview of the animation and code to ensure you understand.

### 2. First Impressions
What stands out first as the biggest problem or issue with the code?

Top priority should be converting spaghetti or one-off hardcoded javascript coupled to the markup to be refactored into a more re-usable component (or class) or timeline based approach.

### 3. Identify better patterns or design approaches
Call out anti-patterns and bad code that can cause performance issues, memory issues, duplicate code, code smells, poor naming conventions, etc...

We want to implement best practices over unclear or generic implementations and variable or function names.

### 4. Report suggestions that would improve the codebase along with a supporting reason
Prioritize a list of improvements and suggestions for improved design patterns and programming paradigms that would make the code more component or module based. Ideally, we should aim for a self-contained component/module that can be implemented within an existing codebase easily.

- Prefer full word names versus abbreviates, use consistent vocabulary in the names for same the label
- DRY code over duplication, similar functions
- Ternaries for setting config objects for mobile/desktop
- Smaller more focused functions versus complex multiline functions
- Guard clauses where applicable
- Encapsulate conditionals for clearer code
- Config objects for shared gsap values

Provide explanations for changes/improvements that might be big or complicated so that an understanding of the coding concept or rationale can be learned by the programmer. Provide this list in a table sorted by top priority or biggest win.

Issues table should be formatted as:


| Issue/Problem                       | Refactor/Fix      | Why                                                                         | Priority/Impact   |
| ----------------------------------- | ----------------- | --------------------------------------------------------------------------- | ----------------- |
| Multiple configurations for opacity | One config object | Set in one place instead of multiple locations in the ScrollTrigger objects | High, Med, or Low |



## Output Format

Structure the critique as:

```
## Code Flow


## First Impressions
[1 paragraph, direct and honest]

## Overall Design Architecture 
[1 paragraph, with supporting table of possible options for improvements]

## Table of Fixes/Refactors
[Prioritized list of issues, suggestions sorted ASC by priority/impact]

```

