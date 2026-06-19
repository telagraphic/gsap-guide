import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { createRegistry } from "../shared/registry.js";

/**
 * Horizontal Slide
 *
 * Pinned horizontal track with per-slide containerAnimation triggers.
 *
 * exit.startEnd              slide 1 scrub-out window
 * exit.set / exit.vars       initial state + scrubbed tween vars
 * headingEnter.startEnd      heading enter window (slides 2+)
 * paragraphEnter.startEnd    paragraph enter window (slides 2+)
 * leave.*                    time-based stagger fade on onLeave (non-final slides)
 *
 * Slide roles:
 *   first  — scrubbed exit (exit config)
 *   middle — scrubbed enter + onLeave fade
 *   last   — scrubbed enter only
 *
 * See docs/REFACTOR.md · nested effect module pattern
 */

export function createHorizontalSlide({
  section,
  track,
  slides,
  splitText,
  exit,
  headingEnter,
  paragraphEnter,
  leave,
}) {
  const registry = createRegistry();
  let trackTween = null;

  function scrollDistance() {
    const slideList = slides;
    const lastSlide = slideList[slideList.length - 1];

    return lastSlide.offsetLeft + lastSlide.offsetWidth - section.clientWidth;
  }

  function createTrackTween() {
    trackTween = gsap.to(track, {
      x: () => -scrollDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1,
        start: "top top",
        end: () => "+=" + scrollDistance(),
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
  }

  function slideTrigger(slide, startEnd) {
    return {
      trigger: slide,
      containerAnimation: trackTween,
      scrub: true,
      ...startEnd,
    };
  }

  function fadeOutOnLeave(lines) {
    const { opacity, stagger, ease } = leave;
    gsap.to(lines, { opacity, stagger, ease });
  }

  function withLeaveOnLast(scrollTriggerConfig, lines, isLastSlide) {
    if (isLastSlide) return scrollTriggerConfig;
    return { ...scrollTriggerConfig, onLeave: () => fadeOutOnLeave(lines) };
  }

  function animateSlide(
    lines,
    slide,
    { startEnd, set, vars },
    { leaveOnExit = false, isLast = false, initialSet = {} } = {},
  ) {
    gsap.set(lines, { ...set, ...initialSet });

    let scrollTriggerConfig = slideTrigger(slide, startEnd);
    if (leaveOnExit) {
      scrollTriggerConfig = withLeaveOnLast(scrollTriggerConfig, lines, isLast);
    }

    const tween = gsap.to(lines, { ...vars, scrollTrigger: scrollTriggerConfig });
    registry.addTween(tween);
  }

  function buildSlide(slide, { isFirst, isLast }) {
    const heading = slide.querySelector(".page-section__title");
    const paragraph = slide.querySelector("p");

    const headingSplit = SplitText.create(heading, { ...splitText.lines });

    const applyLines = (lines, animation, initialSet = {}) => {
      if (isFirst) {
        animateSlide(lines, slide, exit, { initialSet });
        return;
      }
      animateSlide(lines, slide, animation, {
        leaveOnExit: true,
        isLast,
        initialSet,
      });
    };

    applyLines(headingSplit.lines, headingEnter, { yPercent: 0 });

    SplitText.create(paragraph, {
      ...splitText.lines,
      ...splitText.paragraph,
      onSplit(self) {
        applyLines(self.lines, paragraphEnter);
      },
    });
  }

  return {
    id: "horizontal-slide",
    type: "effect",
    registry,
    create() {
      createTrackTween();
      slides.forEach((slide, index) => {
        buildSlide(slide, {
          isFirst: index === 0,
          isLast: index === slides.length - 1,
        });
      });
    },
    destroy() {
      registry.destroy();
    },
    revert() {
      registry.resetSplits();
    },
  };
}
