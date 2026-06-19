import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { createRegistry } from "../shared/registry.js";
import { EASEOUTQUAD } from "../easings.js";

/**
 * Text Wide Slide
 *
 * Star Wars credit wide-slide start → normal justification on scroll.
 *
 * spread.origin            left | center | right
 * spread.gapMultiplier     wider word gaps at start
 * spread.gapMin            floor gap for short lines
 * spread.spreadOvershoot   x offset strength (0–1)
 *
 * Nested lineTweens per paragraph — see docs/REFACTOR.md
 */

export function createTextWideSlide({ spread, scrollTrigger, container, paragraphs }) {
  const registry = createRegistry();

  function buildLineSpread(line) {
    const words = Array.from(line.querySelectorAll(".anim-word"));
    if (!words.length) return null;

    const containerWidth = container.clientWidth;
    const containerRect = container.getBoundingClientRect();

    const totalWordsWidth = words.reduce(
      (acc, word) => acc + word.getBoundingClientRect().width,
      0,
    );
    const gaps = words.length - 1;
    const freeSpace = Math.max(containerWidth - totalWordsWidth, 0);
    const rawGapSize = gaps > 0 ? freeSpace / gaps : 0;
    const gapSize = Math.max(
      rawGapSize * spread.gapMultiplier,
      gaps > 0 ? spread.gapMin : 0,
    );

    const spreadWidth = totalWordsWidth + (gaps > 0 ? gapSize * gaps : 0);

    let targetLeft;
    if (spread.origin === "center") {
      targetLeft = (containerWidth - spreadWidth) / 2;
    } else if (spread.origin === "right") {
      targetLeft = containerWidth - spreadWidth;
    } else {
      targetLeft = 0;
    }

    words.forEach((word, index) => {
      const rect = word.getBoundingClientRect();
      const currentLeft = rect.left - containerRect.left;
      const deltaX = (targetLeft - currentLeft) * spread.spreadOvershoot;

      gsap.set(word, { x: deltaX });
      targetLeft += rect.width + (index < words.length - 1 ? gapSize : 0);
    });

    return gsap.to(words, {
      x: 0,
      ease: EASEOUTQUAD,
      scrollTrigger: {
        trigger: line,
        start: scrollTrigger.start,
        end: scrollTrigger.end,
        scrub: scrollTrigger.scrub,
        invalidateOnRefresh: scrollTrigger.invalidateOnRefresh,
      },
    });
  }

  function buildParagraph(paragraph, paragraphIndex) {
    const lineTweens = [];

    const split = SplitText.create(paragraph, {
      type: "lines, words",
      linesClass: "anim-line",
      wordsClass: "anim-word",
      autoSplit: true,
      onSplit(self) {
        lineTweens.forEach((tween) => registry.killTween(tween));
        lineTweens.length = 0;

        self.lines.forEach((line, lineIndex) => {
          const tween = buildLineSpread(line);
          if (!tween) return;

          lineTweens.push(tween);
          registry.addTween(`p${paragraphIndex}-line${lineIndex}`, tween);
        });
      },
    });

    registry.addSplit(`p${paragraphIndex}`, split);
  }

  return {
    id: "text-wide-slide",
    type: "effect",
    registry,
    create() {
      paragraphs.forEach(buildParagraph);
    },
    destroy() {
      registry.destroy();
    },
    revert() {
      registry.resetSplits();
    },
  };
}
