/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD (scroll-scrubbed, one trigger per .line)
 *
 * ON LOAD   Split paragraphs → lines + words; spread each line (gsap.set x)
 * ON SCROLL Per line: scrub spreadOffsetX → 0 (natural flow)
 *
 * progress 0.00   start "top bottom"     words x = spreadOffsetX
 * progress 1.00   end "top 60%"          words x = 0
 *
 * Lexicon: natural = DOM flow | spread = full-column justified layout
 * ───────────────────────────────────────────────────────── */

const SPLIT = {
  type: "lines, words",
  linesClass: "line",
  wordsClass: "word",
};

const SCROLL = {
  start: "top bottom",
  end: "top 60%",
  scrub: 0.2,
  ease: "power2.out",
};

/**
 * Split each content paragraph into .line / .word wrappers.
 */
function splitContentParagraphs(textColumn) {
  const paragraphs = textColumn.querySelectorAll(".content p");

  paragraphs.forEach((paragraph) => {
    SplitText.create(paragraph, SPLIT);
  });
}

/**
 * Column width and viewport bounds used for spread layout math.
 */
function measureColumn(textColumn) {
  return {
    columnWidthPx: textColumn.clientWidth,
    columnBounds: textColumn.getBoundingClientRect(),
  };
}

/**
 * One layout pass per word: width and natural left edge in the column.
 */
function measureLineWords(lineWords, columnBounds) {
  return lineWords.map((lineWord) => {
    const wordRect = lineWord.getBoundingClientRect();

    return {
      element: lineWord,
      widthPx: wordRect.width,
      naturalLeftInColumnPx: wordRect.left - columnBounds.left,
    };
  });
}

/**
 * Step 1: Add up how wide all words on the line are together.
 */
function sumWordWidthsPx(wordMeasurements) {
  let total = 0;
  for (const word of wordMeasurements) {
    total += word.widthPx;
  }
  return total;
}

/**
 * Step 2–4: Extra column space ÷ gap count → pixels between each word pair.
 */
function computeSpreadGapPx(columnWidthPx, wordMeasurements) {
  const lineWordsWidthSumPx = sumWordWidthsPx(wordMeasurements);
  const spreadGapCount = wordMeasurements.length - 1;

  if (spreadGapCount === 0) {
    return 0;
  }

  const remainingSpreadWidthPx = columnWidthPx - lineWordsWidthSumPx;
  const extraSpacePx = remainingSpreadWidthPx > 0 ? remainingSpreadWidthPx : 0;

  return extraSpacePx / spreadGapCount;
}

/**
 * Step 5: Walk each word — spread left edge vs natural left → spreadOffsetX.
 */
function assignSpreadOffsetToEachWord(wordMeasurements, spreadGapPx) {
  const wordLayouts = [];
  let spreadLeftEdgePx = 0;

  for (let wordIndex = 0; wordIndex < wordMeasurements.length; wordIndex++) {
    const word = wordMeasurements[wordIndex];
    const spreadOffsetX = spreadLeftEdgePx - word.naturalLeftInColumnPx;

    wordLayouts.push({
      ...word,
      spreadOffsetX,
    });

    spreadLeftEdgePx += word.widthPx;

    const hasWordAfterThis = wordIndex < wordMeasurements.length - 1;
    if (hasWordAfterThis) {
      spreadLeftEdgePx += spreadGapPx;
    }
  }

  return wordLayouts;
}

/**
 * Compute spread gap and each word's spreadOffsetX (natural → spread).
 */
function computeLineSpreadLayout(wordMeasurements, columnWidthPx) {
  const spreadGapPx = computeSpreadGapPx(columnWidthPx, wordMeasurements);
  return assignSpreadOffsetToEachWord(wordMeasurements, spreadGapPx);
}

/**
 * Apply instant spread transforms before scroll scrub runs.
 */
function applySpreadOffsets(wordLayouts) {
  wordLayouts.forEach(({ element, spreadOffsetX }) => {
    gsap.set(element, { x: spreadOffsetX });
  });
}

/**
 * Scrub each line's words from spread layout back to natural (x: 0).
 */
function attachLineScrollReveal(wordLayouts, textLine, scrollConfig) {
  const lineWords = wordLayouts.map((word) => word.element);

  gsap.to(lineWords, {
    x: 0,
    ease: scrollConfig.ease,
    scrollTrigger: {
      trigger: textLine,
      start: scrollConfig.start,
      end: scrollConfig.end,
      scrub: scrollConfig.scrub,
    },
  });
}

/**
 * Wire up split → measure → spread → scroll reveal for one effect section.
 */
function initJustifiedLineReveal(effectSection) {
  const textColumn = effectSection.querySelector(".container");

  splitContentParagraphs(textColumn);

  const { columnWidthPx, columnBounds } = measureColumn(textColumn);

  const textLines = effectSection.querySelectorAll(".line");
  textLines.forEach((textLine) => {
    const lineWords = Array.from(textLine.querySelectorAll(".word"));
    const wordMeasurements = measureLineWords(lineWords, columnBounds);
    const wordLayouts = computeLineSpreadLayout(
      wordMeasurements,
      columnWidthPx,
    );

    applySpreadOffsets(wordLayouts);
    attachLineScrollReveal(wordLayouts, textLine, SCROLL);
  });
}

const effectSection = document.querySelector(".mwg_effect097");

if (effectSection) {
  initJustifiedLineReveal(effectSection);
}
