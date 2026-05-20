
Approach this like a senior dev teaching a junior engineer about code refactoring approaches, good design patterns over anti-patterns or no structure, and concepts and this relates to javascript and GSAP. 

## Voice Rules

Over explaining and reviewing javascript or GSAP concepts should be clear, concise and to the point.

Prefer a teaching approach to explain the how and why behind the code refactoring. The goal is to explain GSAP and Javascript concepts for internalizing the concepts and language.

Approach this tasks as a refactoring "how to guide", showing why you made the decisions you did to achieve a more composable, re-usable pattern that can be implemented as a plug and play component in an existing codebase versus a one-off hardcoded spaghetti code for a one off implementation.

List out the steps that were used in the refactoring process to understand how to approach refactoring in the future.

See `./docs/REFACTOR_PLAN.md` for reference for the before and after changes implemented. 



## The Document Outline

```
# Title
[Short description of the code]


## Metaphors for concepts used
[Table of code to metaphor explanations]

## Refactoring approach and decisions
[List of itemized refactorings and changes with supporting reasons]

## Patterns and Paradigms
[Ordered list of higher level concepts used to guide the implementation]

## Function sequence
[Arrow chart of function calls to visually see how the code works]
```


## Document sections

### 1. Use metaphors to explain animations
Use metaphors to explain what and how the GSAP code does. A useful metaphor to explain an animation or motion concept can really explain the code being implemented as real life examples can reinforce the concepts embedded in code.

| Idea                                       | Metaphor                                            | Why it fits                                                                                                                                                                                 |
| ------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`self.progress` (0 → 1)**                | **Dimmer switch** or **fuel gauge**                 | One number summarizes “how far through this scroll segment you are.” Fully off → fully on.                                                                                                  |
| **ScrollTrigger `start` / `end`**          | **Start line and finish line** on a course          | The race only “counts” while the runner (your trigger element) is between those lines relative to the viewport.                                                                             |
| **`scrub`**                                | **Heavy camera dolly** (or power steering with lag) | You turn the wheel (scroll), but the camera **catches up smoothly** instead of snapping to every micro-movement. `scrub: 1` means “don’t teleport; ease toward the scroll position.”        |
| **Trigger element vs things you animate**  | **Thermostat vs radiators**                         | The thermostat **senses** when to run (trigger + range). The radiators are **what actually change temperature** (grid, columns, image). Same room can have one sensor driving many outputs. |

Or a sequential process based description:

```
### The three “channels” of motion

While the user scrolls through the trigger’s range, we drive three kinds of change (see [`script.js`](script.js) lines 18–28 and [`gallery-scrub-factory-refactor.js`](gallery-scrub-factory-refactor.js) `computeGalleryMotion` + `applyGalleryMotionToDom`):

1. **Grid** — zoom with `translate(-50%, -50%) scale(...)`. **Metaphor:** **camera push-in** on a framed collage; center stays pinned in the middle of the stage.
2. **Side columns** — `translateY(...)` **Metaphor:** **escalator steps** beside a fixed center—the sides drift past at a different rate than the “hero” story in the middle.
3. **Hero image** — `scale(...)` shrinks as progress grows. **Metaphor:** **stepping back** from a poster so more of the wall grid reads.

```



### 2. Refactoring decisions and teachings
Compare the old code to the new code changes and why it was selected. Explain using GSAP or Javascript concepts how and why the code change is better, improved or performant.

### 3. Patterns and Paradigms
List out the patterns and paradigms implemented to understand the code concepts implemented.

### 4. Function Sequence
Provide an updated function sequencing for the refactored code.


```
preloadImages()
    │
    ├─> prepareImages()
    │       ├─> normalizeImages()
    │       │       └─> Uses: SELECTORS.LAZY_IMAGES
    │       └─> excludePreloaderImages()
    │               └─> Uses: SELECTORS.PRELOADER
    │
    ├─> createProgressTracker()
    │       └─> Returns: trackProgress function
    │
    └─> For each image:
            └─> loadSingleImage()
                    │
                    ├─> isImageLoaded()? YES
                    │       └─> handleImageReady()
                    │               └─> decodeImage()        
```

### 5. Hard concepts to get
Identify the hard concepts that are not obvious and explain how they work for the animation code.


### Create a REFACTOR_GUIDE.md

Take your time to find the best explanations for the above sections and save it to a document called `.docs/REFACTOR_GUIDE.md`. 

