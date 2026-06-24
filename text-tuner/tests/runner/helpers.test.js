import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mergeInto, buildGsapStagger } from "../../src/schema/config.js";
import { buildScrollTriggerVars } from "../../src/runner/scroll-trigger-vars.js";
import { pickTweenProps } from "../../src/runner/tween-props.js";

describe("mergeInto", () => {
  it("merges nested patches in place", () => {
    const cfg = { to: { duration: 1, ease: "power2.out" }, scrollTrigger: { start: "top top" } };
    mergeInto(cfg, { to: { duration: 2 }, scrollTrigger: { scrub: true } });
    assert.equal(cfg.to.duration, 2);
    assert.equal(cfg.to.ease, "power2.out");
    assert.equal(cfg.scrollTrigger.scrub, true);
    assert.equal(cfg.scrollTrigger.start, "top top");
  });
});

describe("buildGsapStagger", () => {
  it("builds amount stagger", () => {
    assert.deepEqual(buildGsapStagger({ timing: "amount", amount: 0.2, from: "start" }), {
      from: "start",
      amount: 0.2,
    });
  });

  it("returns undefined when each is zero", () => {
    assert.equal(buildGsapStagger({ timing: "each", each: 0 }), undefined);
  });

  it("includes grid and axis when set", () => {
    const out = buildGsapStagger({ timing: "amount", amount: 0.1, grid: [2, 3], axis: "y" });
    assert.deepEqual(out?.grid, [2, 3]);
    assert.equal(out?.axis, "y");
  });
});

describe("buildScrollTriggerVars", () => {
  it("defaults trigger from targets.element", () => {
    const st = buildScrollTriggerVars({ start: "top top" }, { element: '[data-playground-trigger="x"]' });
    assert.equal(st.trigger, '[data-playground-trigger="x"]');
  });

  it("removes scrub when off", () => {
    const st = buildScrollTriggerVars({ scrub: false, scrubMode: "off" }, {});
    assert.equal(st.scrub, undefined);
    assert.equal(st.scrubMode, undefined);
  });

  it("maps smooth scrub mode to numeric scrub", () => {
    const st = buildScrollTriggerVars({ scrubMode: "smooth", scrubSmooth: 2 }, { element: ".a" });
    assert.equal(st.scrub, 2);
  });
});

describe("pickTweenProps", () => {
  it("picks defined tween keys only", () => {
    assert.deepEqual(pickTweenProps({ yPercent: 100, duration: 1 }), { yPercent: 100 });
    assert.deepEqual(pickTweenProps({ filter: "blur(4px)" }), { filter: "blur(4px)" });
  });
});
