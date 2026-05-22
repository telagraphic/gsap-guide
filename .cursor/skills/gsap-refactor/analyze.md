
**Part of [GSAP Refactor](SKILL.md) by Nick Lyons**

Review the GSAP code to explain calculations, what variables names mean, how they related to each other and visualize viewport, scroll, and timeline using ASCII diagrams.

Use realistic values for the explanations and show over time or scroll how the values change. Connect how these value changes update the visual animation.

Generate a file named `./docs/ANIMATION_CODE.md` with your answer.

## When to use

- User says "analyze the animation", "breakdown the code", "how does the code work", 
- User points to a file or current directory that has html, css and javascript files

## The Document Outline

```
# Variables, calculations, etc used in the code
[Table of variables and what function they serve, how they change]

# Metaphors for concepts used
[Table of code to metaphor explanations if needed]

# Step by step breakdown
[Step by step breakdown for animation calculations, use diagrams to illustrate, show tables of sample values that are transformed]

# Simplify
[If an animation has complex code, simplify or dumb it down to a more imperative step by step sequence]

# Summary
[Summarize the main components]

```




## What to breakdown

### 1. Variables and calculations used in the animation
Provide a table of variables and calculations that are used and what they do by function. Do they change or stay the same? What drives the change and how does it translate visually on the screen?


### 2. Describe with a metaphor
Can the calculations or code be explained with a useful metaphor?


### 3.  Step by step breakdown
Break down the code step by step into it's component parts and use ASCII diagrams for explaining the transforms and changes. Use sample values to show how the animation changes element and browser values to see how it translates visually on the screen.

Explain DOM or GSAP methods and properties what they return for understanding how they work.

### 4. Simply and dumbify
For complicated or un-intuitive code, break it down to a more simply step by step imperative approach. Turn the complex into a simpler walk through.

## Output Format

Structure the critique as:

```
# Variables, calculations, etc used in the code
[Table of variables and what function they serve, how they change]

# Metaphors for concepts used
[Table of code to metaphor explanations if needed]

# Step by step breakdown
[Step by step breakdown for animation calculations, use diagrams to illustrate, show tables of sample values that are transformed]

# Simplify
[If an animation has complex code, simplify or dumb it down to a more imperative step by step sequence]

# Summary
[Summarize the main components]

```


## Voice Rules

Follow these strictly. They define the critique style.

### BE:
- **Specific** — "There are six columns of data per row" not "there's a lot of data"
- **Decisive** — "This is overwhelming" not "this might feel overwhelming"
- **Factual first** — State what you see before judging it
- **Impact-aware** — Always connect the observation to how it affects the user
- **Quantitative** — Count elements, name colors, measure relative sizes

### DO NOT:
- **Be vague** — No "the design feels off" without saying exactly what and why
- **Prescribe without reasoning** — Never say "change X to Y" without explaining the why
- **Use jargon without explanation** — "Progressive disclosure" is fine. "The affordance signifiers lack semiotic clarity" is not.

### Tone Calibration
The voice is a senior designer reviewing work with a junior designer they respect. Direct, analytical, and honest — but rooted in wanting the work to be great. No cruelty, no condescension, but also no hand-holding. The goal is to make the designer *see* what you see.

