import gsap, { SplitText } from "../shared/gsap.js";
import { createRegistry } from "../shared/registry.js";

/**
 * Horizontal Slide
 *
 * Pinned horizontal track with per-slide containerAnimation triggers.
 *
 * exit.startEnd              scrub-out window (left edge → right edge clears viewport)
 * headingEnter.startEnd      heading enter window (slides 2+) — slide right → left
 * paragraphEnter.startEnd    paragraph enter window (slides 2+)
 *
 * Slide roles:
 *   first  — scrubbed exit only (set visible, then fade)
 *   middle — enter (set hidden) then exit (opacity only, no set — avoids clobbering enter)
 *   last   — enter only
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

    registry.addTween("track", trackTween);
  }

  function slideTrigger(slide, startEnd) {
    return {
      trigger: slide,
      containerAnimation: trackTween,
      scrub: true,
      ...startEnd,
    };
  }

  function animateEnter(
    lines,
    slide,
    { startEnd, set, vars },
    key,
    initialSet = {},
  ) {
    gsap.set(lines, { ...set, ...initialSet });

    const tween = gsap.to(lines, {
      ...vars,
      scrollTrigger: slideTrigger(slide, startEnd),
    });
    registry.addTween(key, tween);
  }

  function animateExit(
    lines,
    slide,
    { startEnd, set, vars },
    key,
    { initialSet = {}, applySet = false } = {},
  ) {
    if (applySet) {
      gsap.set(lines, { ...set, ...initialSet });
    }

    const tween = gsap.to(lines, {
      ...vars,
      immediateRender: false,
      scrollTrigger: slideTrigger(slide, startEnd),
    });
    registry.addTween(key, tween);
  }

  function buildSlide(slide, { slideIndex, isFirst, isLast }) {
    const heading = slide.querySelector(".page-section__title");
    const paragraph = slide.querySelector("p");

    const headingSplit = SplitText.create(heading, { ...splitText.lines });
    registry.addSplit(`slide-${slideIndex}-heading`, headingSplit);

    if (!isFirst) {
      animateEnter(
        headingSplit.lines,
        slide,
        headingEnter,
        `slide-${slideIndex}-heading-enter`,
      );
    }

    if (!isLast) {
      animateExit(
        headingSplit.lines,
        slide,
        exit,
        `slide-${slideIndex}-heading-exit`,
        {
          applySet: isFirst,
          initialSet: isFirst ? { yPercent: 0 } : {},
        },
      );
    }

    const paragraphSplit = SplitText.create(paragraph, {
      ...splitText.lines,
      ...splitText.paragraph,
      onSplit(self) {
        if (!isFirst) {
          animateEnter(
            self.lines,
            slide,
            paragraphEnter,
            `slide-${slideIndex}-paragraph-enter`,
          );
        }

        if (!isLast) {
          animateExit(
            self.lines,
            slide,
            exit,
            `slide-${slideIndex}-paragraph-exit`,
            { applySet: isFirst },
          );
        }
      },
    });

    registry.addSplit(`slide-${slideIndex}-paragraph`, paragraphSplit);
  }

  return {
    id: "horizontal-slide",
    type: "effect",
    registry,
    create() {
      createTrackTween();
      slides.forEach((slide, index) => {
        buildSlide(slide, {
          slideIndex: index,
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
