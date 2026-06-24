import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseScrollPosition,
  formatScrollPosition,
  parseScrollOffsetPart,
} from "../../src/schema/scroll-position.js";
import {
  normalizeStaggerConfig,
  parseStaggerGrid,
  formatStaggerGridForInput,
  typeIncludes,
  resolveAnimateTarget,
  needsRebuild,
} from "../../src/schema/config.js";

describe("scroll-position", () => {
  it("parses edge-only strings", () => {
    const p = parseScrollPosition("top top");
    assert.equal(p.elementEdge, "top");
    assert.equal(p.viewEdge, "top");
    assert.equal(formatScrollPosition(p), "top top");
  });

  it("parses and formats offset strings", () => {
    const p = parseScrollPosition("top 25%");
    assert.equal(p.elementEdge, "top");
    assert.equal(p.viewOffset, 25);
    assert.equal(p.viewUnit, "%");
    assert.equal(formatScrollPosition(p), "top 25%");
  });

  it("round-trips common ST positions", () => {
    for (const raw of ["top top", "top bottom", "center center", "top 80%"]) {
      assert.equal(formatScrollPosition(parseScrollPosition(raw)), raw);
    }
  });

  it("parseScrollOffsetPart handles bare edges", () => {
    assert.deepEqual(parseScrollOffsetPart("center"), {
      edge: "center",
      offset: 0,
      unit: "%",
    });
  });
});

describe("config", () => {
  it("typeIncludes splits comma-separated types", () => {
    assert.equal(typeIncludes("words,lines", "words"), true);
    assert.equal(typeIncludes("words,lines", "chars"), false);
  });

  it("resolveAnimateTarget falls back in priority order", () => {
    assert.equal(resolveAnimateTarget("lines", "chars"), "lines");
    assert.equal(resolveAnimateTarget("words", "chars"), "words");
  });

  it("normalizeStaggerConfig handles legacy mode simple", () => {
    const out = normalizeStaggerConfig({ mode: "simple", value: 0.05 });
    assert.equal(out.timing, "each");
    assert.equal(out.each, 0.05);
    assert.equal(out.mode, undefined);
  });

  it("parseStaggerGrid accepts JSON and comma forms", () => {
    assert.deepEqual(parseStaggerGrid("[2, 3]"), [2, 3]);
    assert.deepEqual(parseStaggerGrid("2, 3"), [2, 3]);
    assert.equal(parseStaggerGrid(""), null);
    assert.equal(formatStaggerGridForInput([2, 3]), "[2, 3]");
  });

  it("needsRebuild detects typography, splitText, and targets changes", () => {
    const base = {
      typography: { fontSize: 1 },
      splitText: { type: "lines" },
      targets: { text: '[data-playground="a"]' },
      to: { duration: 1 },
    };
    assert.equal(needsRebuild(base, { ...base, to: { duration: 2 } }), false);
    assert.equal(
      needsRebuild(base, { ...base, typography: { fontSize: 2 } }),
      true
    );
    assert.equal(
      needsRebuild(base, { ...base, splitText: { type: "words" } }),
      true
    );
    assert.equal(
      needsRebuild(base, { ...base, targets: { text: '[data-playground="b"]' } }),
      true
    );
    assert.equal(needsRebuild(null, base), true);
  });
});
