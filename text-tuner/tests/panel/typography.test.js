import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyTypographyToScope } from "../../src/panel/typography.js";

function mockPlaygroundTarget() {
  const vars = new Map();
  /** @type {Array<{ style: Map<string, string> }>} */
  const splitNodes = [];

  const root = {
    style: {
      setProperty(name, value) {
        vars.set(name, value);
      },
      getPropertyValue(name) {
        return vars.get(name) ?? "";
      },
    },
    querySelectorAll(selector) {
      if (selector === ".word, .line, .char") return splitNodes;
      return [];
    },
    addSplitNode(inlineFontSize) {
      const props = new Map();
      if (inlineFontSize) props.set("font-size", inlineFontSize);
      const node = {
        style: {
          removeProperty(name) {
            props.delete(name);
          },
          getPropertyValue(name) {
            return props.get(name) ?? "";
          },
        },
      };
      splitNodes.push(node);
      return node;
    },
    vars() {
      return vars;
    },
  };

  return root;
}

const SAMPLE_TYPOGRAPHY = {
  fontVar: "--font-fh-enso",
  fontSize: 2,
  lineHeight: 1.35,
  letterSpacing: 0.02,
  textAlign: "center",
  textTransform: "uppercase",
};

describe("applyTypographyToScope", () => {
  it("sets playground CSS vars on the scoped target", () => {
    const root = mockPlaygroundTarget();
    applyTypographyToScope(root, SAMPLE_TYPOGRAPHY);

    assert.equal(root.style.getPropertyValue("--font-sans-serif"), "var(--font-fh-enso)");
    assert.equal(root.style.getPropertyValue("--playground-font-size"), "2rem");
    assert.equal(root.style.getPropertyValue("--playground-line-height"), "1.35");
    assert.equal(root.style.getPropertyValue("--playground-letter-spacing"), "0.02em");
    assert.equal(root.style.getPropertyValue("--playground-text-align"), "center");
    assert.equal(root.style.getPropertyValue("--playground-text-transform"), "uppercase");
  });

  it("clears inline font-size on split descendants (.word, .line, .char)", () => {
    const root = mockPlaygroundTarget();
    const word = root.addSplitNode("24px");
    const line = root.addSplitNode("18px");
    const char = root.addSplitNode("14px");

    applyTypographyToScope(root, SAMPLE_TYPOGRAPHY);

    assert.equal(word.style.getPropertyValue("font-size"), "");
    assert.equal(line.style.getPropertyValue("font-size"), "");
    assert.equal(char.style.getPropertyValue("font-size"), "");
  });

  it("no-ops on null typography or missing root", () => {
    const root = mockPlaygroundTarget();
    applyTypographyToScope(root, null);
    applyTypographyToScope(null, SAMPLE_TYPOGRAPHY);
    assert.equal(root.vars().size, 0);
  });
});
