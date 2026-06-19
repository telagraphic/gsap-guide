# GSAP Landing Page Architecture

## Design

- using grid to maintain alignment for each frame


## HTML & CSS

- challenge, using a generic page structure for each frame but each frame uses custom code from other sources, harmonizing it using a common language or context challenge with styles and markup
- creating animation specific utility classes that replaces custom classes



### AI Gotchas
AI is not smart enough to see overlapping classes with 3 of 4 same properties and will create two classes when they could be 1.

Class renaming was still coupled to the code with names like


```css
/* Panel 7 — letter spiral */
.panel-nine__line {
  display: flex;
}

.panel-nine__char {
  position: relative;
  display: inline-block;
  overflow: hidden;
}
```


After telling the prompt to separate styles into tokens, typography, animation and page files to make classes more utility like, AI still does this:


```css
.anim-clip-slot {
  display: inline-block;
  font-size: var(--type-heading);
  font-weight: var(--weight-display);
  line-height: var(--leading-tight);
  position: relative;
  text-transform: uppercase;
  clip-path: polygon(0 2%, 0 98%, 100% 98%, 100% 2%);
}
```

Could be the dumb zone in the context window that leads to this or spelling out in detail what I want.

It did a perfect job on typography classes but not animations, this could have been due to complicated code and not understanding my intent with one prompt, when it should have been grill through further refinement of the code refactoring prompt process.


### Renaming and Updating

Breaking prompts into smaller tasks that target smaller sections of the code can provide a much better and consistent experience.

Telling the prompt to create utility classes or pick a better bem name scheme for the html and then update the css accordingly is not always great.

If your vibe coding, then who cares, but if you are working with others or need a more consistent mental model of how you work.

Renaming the html classes and updating the css worked best when providing a BEM naming scheme example, having it create the rest of the class names, then updating 1/4 of the code and identifying other patterns prevents weird class names that break from convention.

## Refactoring

Having AI do the chore work is great. I can now see the bigger picture of the code landscape.

Creating a solid token naming system that harmonizes with the class types (page, typography, color, animation) and how that metaphor links to the actual design system elements of the same names.

Instead of just writing class names ad hoc, I can create my own design system heirarchy reflected in the different levels.



animation-wide-slide
animation-slot-machine-roll
animation-character-waterdrop
animation-character-ripple



data-panel-5 header is broken


## Split Text Fine Tuning

Glyph, lines, mask and styles that control the stacking tightness and vertical rhythm.

How to test with your split text playground?

- add clip-path control
- yPercent control
- add gsap related css props
-



# Architecture & Patterns

## Short

- storyboard and config at top
- helper methods
- frame by frame functions/sections
- spaghetti over specific pattern

## Medium

- break out to separate files
- central timeline orchestrator
- import helpers
- half spaghetti, more pattern


## Longer

- Implement registry, factory pattern per each file
- central timeline orchestrator
- more helpers, primitives
- gsap components with lifecycle methods
- animation classes


## Styles: GSAP and Classes

GSAP targets the elements inline styles so it beats classes.
But watch out for this.





## Storyboard, Config, One Timeline


### Spaghetti Code


See https://github.com/telagraphic/gsap-guide/blob/1b0e80f85d2799115ffa3b68564d52ce4050a36f/scroll-trigger-architecture/script.js for before code.


Before;
```javascript
 /*
  *  Header Hero — First Frame
  *
  */


  const hero = document.querySelector(".page-header");
  const heroIcon = hero.querySelector(".page-header__icon");
  const heroTag = hero.querySelector(".page-header__tag");
  const heroHint = hero.querySelector(".page-header__hint");
  const heroHeaders = hero.querySelectorAll(".page-header__titles h1");

  const heroTimeline = gsap.timeline();

  const iconTimeline = gsap.timeline();
  const tagTimeline = gsap.timeline();
  const hintTimeline = gsap.timeline();

  gsap.set(heroIcon, {
    autoAlpha: 0,
  });

  iconTimeline.fromTo(
    heroIcon,
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
      duration: 0.5,
      ease: "easeOutQuad",
    },
  );

  tagTimeline.fromTo(
    heroTag,
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
      duration: 0.5,
      ease: "easeOutQuad",
    },
  );

  hintTimeline.fromTo(
    heroHint,
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
      duration: 0.5,
      ease: "easeOutQuad",
    },
  );

  const headerLines = new SplitText(heroHeaders, {
    type: "lines",
    mask: "lines",
    linesClass: "lines++",
  });

  headerLines.lines.forEach((line, i) => {
    const position = i + 1;
    console.log(position);

    const lineCount = position % 2 === 0 ? position : 0;
    // console.log(lineCount);

    gsap.set(line, {
      opacity: 0,
      yPercent: lineCount ? -100 : 100,
    });

    // console.log(lineCount);
    gsap.to(line, {
      opacity: 1,
      yPercent: 0,
      duration: 1,
      stagger: 0.02,
      ease: lineCount ? "easeOutQuad" : "easeOutQuart",
    });
  });

  heroTimeline
    .add(tagTimeline, "+=.5")
    .add(hintTimeline, ">-.25")
    .add(iconTimeline, ">-.5");
```


```javascript

  /* ─────────────────────────────────────────────────────────
   * HERO ANIMATION STORYBOARD
   *
   * Time-based intro (fires on fonts.ready). CSS `.anim-prehide`
   * sets opacity: 0 before JS runs; GSAP removes it per phase.
   *
   *    0ms   reveal titles container (remove anim-prehide)
   *  500ms   header lines slide in — odd lines from yPercent 100,
   *          even lines from yPercent -(position × 100) → 0
   *          (1s each, stagger 20ms, masked via SplitText)
   *  +500ms   tag caption fades in, opacity 0 → 1 (500ms)
   *  −250ms   hint caption overlaps tag fade-in (500ms)
   *  −500ms   icon overlaps hint fade-in (500ms)
   *   end    remove anim-prehide from icon, tag, hint
   *
   * Child timelines (icon, tag, hint, lines) are built first,
   * then sequenced on heroTimeline with relative positions.
   * ───────────────────────────────────────────────────────── */

  /**
   * Hero Configuration
   */
  const HERO_CONFIG = {
    SELECTORS: {
      HEADER: ".page-header",
      ICON: ".page-header__icon",
      TAG: ".page-header__tag",
      HINT: ".page-header__hint",
      HEADER_TITLES: ".page-header__titles",
      HEADER_TITLE: ".page-header__titles h1",
    },
    HERO: {
      TIMELINE: {
        opacity: 1,
        duration: 0.5,
        ease: EASEOUTQUAD,
      }
    },
    TAG: {
      TIMELINE: {
        opacity: 1,
        duration: 0.5,
        ease: EASEOUTQUAD,
      }
    },
    HINT: {
      TIMELINE: {
        opacity: 1,
        duration: 0.5,
        ease: EASEOUTQUAD,
      }
    },
    HEADER_TITLE: {
      SPLIT_TEXT: {
        TYPE: "lines",
        MASK: "lines",
        LINES_CLASS: "page-header-lines",
      },
      TIMELINE: {
        yPercent: 0,
        duration: 1,
        ease: EASEOUTQUAD,
        stagger: 0.02,
      }
    }
  };


  const hero = document.querySelector(HERO_CONFIG.SELECTORS.HEADER);
  const heroIcon = hero.querySelector(HERO_CONFIG.SELECTORS.ICON);
  const heroTag = hero.querySelector(HERO_CONFIG.SELECTORS.TAG);
  const heroHint = hero.querySelector(HERO_CONFIG.SELECTORS.HINT);
  const heroHeaders = hero.querySelector(HERO_CONFIG.SELECTORS.HEADER_TITLES);

  const heroTimeline = gsap.timeline();
  const iconTimeline = gsap.timeline();
  const tagTimeline = gsap.timeline();
  const hintTimeline = gsap.timeline();
  const linesTimeline = gsap.timeline();


  iconTimeline.to(heroIcon, HERO_CONFIG.HERO.TIMELINE);
  tagTimeline.to(heroTag, HERO_CONFIG.TAG.TIMELINE);
  hintTimeline.to(heroHint, HERO_CONFIG.HINT.TIMELINE);

  const headerLines = new SplitText(heroHeaders.querySelectorAll(HERO_CONFIG.SELECTORS.HEADER_TITLE) , {
    type: "lines",
    mask: "lines",
    linesClass: "page-header-lines",
  });

  headerLines.lines.forEach((line, i) => {
    const position = i + 1;
    const fromY = position % 2 === 0 ? position * -100 : 100; // your logic
    gsap.set(line, { yPercent: fromY });
  });
  
  linesTimeline.to(headerLines.lines, HERO_CONFIG.HEADER_TITLE.TIMELINE);


  /**
   * Master Timeline Orchestrator
   *
   **/

  heroTimeline
    .call(removePrehideClasses, [heroHeaders])
    .add(linesTimeline, "+=0.5")
    .add(tagTimeline, "+=.5")
    .add(hintTimeline, ">-.25")
    .add(iconTimeline, ">-.5")
    .call(removePrehideClasses, [heroIcon, heroTag, heroHint])
    .play();

```


## Mix and Match

It might be overkill to add a registry for gsap objects.
Or it be overkill to create factories but still use a registry for killing and reverting animation.

The best balance is separating the files, use a storyboard and config pattern and write classic gsap spaghetti code.

The whole idea is show how we can compose larger abstractions via a basic set of patterns.