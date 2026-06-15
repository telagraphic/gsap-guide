  /* ─────────────────────────────────────────────────────────
   * HERO STORYBOARD
   *
   *    0ms   titles cleared to play
   *  500ms   headline lines slide in, alternating (cascade)
   * +500ms   tagline fades in
   * −250ms   hint overlaps tag
   * −500ms   icon overlaps hint
   *    end   full header on stage
   * 
   * ─────────────────────────────────────────────────────────
   * 
   * PATTERN: MASTER TIMELINE drives 4 nested timeline animations
   * 
   * 
   * ───────────────────────────────────────────────────────── */

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
      },
    },
    TAG: {
      TIMELINE: {
        opacity: 1,
        duration: 0.5,
        ease: EASEOUTQUAD,
      },
    },
    HINT: {
      TIMELINE: {
        opacity: 1,
        duration: 0.5,
        ease: EASEOUTQUAD,
      },
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
      },
    },
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

  const headerLines = new SplitText(
    heroHeaders.querySelectorAll(HERO_CONFIG.SELECTORS.HEADER_TITLE),
    {
      type: "lines",
      mask: "lines",
      linesClass: "page-header-lines",
    },
  );

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



/**
 * Return the timeline for the section
 * Return a play method to play the timeline
 * Return a revert, or reset timeline method to kill the timeline
 * 
 * 
 * 
 */


