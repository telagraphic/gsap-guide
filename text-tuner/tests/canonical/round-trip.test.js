import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCanonicalBlock } from "../../src/canonical/build-canonical-block.js";
import { parseCanonicalBlock } from "../../src/canonical/parse-canonical-block.js";
import { convert } from "../../src/convert/index.js";
import { DEFAULT_CONFIG } from "../../src/schema/defaults.js";

const sampleConfig = {
  ...DEFAULT_CONFIG,
  targets: {
    element: '[data-playground-trigger="hero"]',
    text: '[data-playground="hero"]',
  },
  splitText: {
    type: "words,lines",
    mask: "lines",
    autoSplit: true,
    smartSplit: true,
  },
  animate: "lines",
  from: { yPercent: 100 },
  to: { yPercent: 0, duration: 1, ease: "power2.out" },
  stagger: { timing: "amount", amount: 0.12, from: "start" },
  scrollTrigger: {
    trigger: '[data-playground-trigger="hero"]',
    start: "top 30%",
    end: "top top",
    scrub: true,
    markers: false,
  },
};

test("buildCanonicalBlock produces SplitText.create shape", () => {
  const block = buildCanonicalBlock(sampleConfig);
  assert.match(block, /SplitText\.create/);
  assert.match(block, /onSplit\(self\)/);
  assert.match(block, /gsap\.set\(self\.lines/);
  assert.match(block, /scrollTrigger:/);
});

test("parseCanonicalBlock round-trips Copy code", () => {
  const block = buildCanonicalBlock(sampleConfig);
  const { config, warnings } = parseCanonicalBlock(block, { id: "hero" });
  assert.equal(warnings.length, 0);
  assert.equal(config.animate, "lines");
  assert.equal(config.splitText.type, "words,lines");
  assert.equal(config.splitText.mask, "lines");
  assert.equal(config.from.yPercent, 100);
  assert.equal(config.to.yPercent, 0);
  assert.equal(config.to.duration, 1);
  assert.equal(config.stagger.amount, 0.12);
  assert.equal(config.scrollTrigger.start, "top 30%");
  assert.equal(config.targets.text, '[data-playground="hero"]');
});

test("convert applies active id to targets", () => {
  const block = buildCanonicalBlock(sampleConfig);
  const { config } = convert(block, { id: "imported-paragraph" });
  assert.equal(config.targets.text, '[data-playground="imported-paragraph"]');
  assert.equal(config.targets.element, '[data-playground-trigger="imported-paragraph"]');
});
