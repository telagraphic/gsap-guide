import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SCHEMA_VERSION } from "../../src/schema/version.js";
import {
  GLOBAL_SCAFFOLD,
  DEFAULT_CONFIG,
  buildScaffoldConfig,
  withSchemaVersion,
} from "../../src/schema/defaults.js";
import { ANIM_PROPS, EASE_OPTIONS, STAGGER_FROM, TWEEN_PROP_KEYS } from "../../src/schema/anim-props.js";

describe("defaults", () => {
  it("buildScaffoldConfig sets id-based selectors and schema version", () => {
    const cfg = buildScaffoldConfig("hero-lines");
    assert.equal(cfg.__schema, SCHEMA_VERSION);
    assert.equal(cfg.targets.text, '[data-playground="hero-lines"]');
    assert.equal(cfg.targets.element, '[data-playground-trigger="hero-lines"]');
    assert.equal(cfg.scrollTrigger.trigger, '[data-playground-trigger="hero-lines"]');
    assert.equal(cfg.animate, "lines");
    assert.equal(cfg.splitText.mask, "lines");
  });

  it("buildScaffoldConfig merges global overrides from discover defaults", () => {
    const cfg = buildScaffoldConfig("hero-lines", {
      animate: "words",
      to: { duration: 2 },
    });
    assert.equal(cfg.animate, "words");
    assert.equal(cfg.to.duration, 2);
    assert.equal(cfg.targets.text, '[data-playground="hero-lines"]');
  });

  it("buildScaffoldConfig merges Tier 1 define-style patch", () => {
    const cfg = buildScaffoldConfig("config-header", {
      splitText: { type: "words", mask: "none" },
      animate: "words",
    });
    assert.equal(cfg.splitText.type, "words");
    assert.equal(cfg.splitText.mask, "none");
    assert.equal(cfg.animate, "words");
  });

  it("GLOBAL_SCAFFOLD matches cold-start teaching defaults", () => {
    assert.equal(GLOBAL_SCAFFOLD.from.yPercent, 100);
    assert.equal(GLOBAL_SCAFFOLD.to.ease, "power2.out");
    assert.equal(GLOBAL_SCAFFOLD.scrollTrigger.scrub, true);
  });

  it("DEFAULT_CONFIG includes legacy demo selectors", () => {
    assert.equal(DEFAULT_CONFIG.targets.element, ".frame--2");
    assert.equal(DEFAULT_CONFIG.scrollTrigger.trigger, ".frame--2");
  });

  it("withSchemaVersion stamps __schema", () => {
    const cfg = withSchemaVersion({ animate: "lines" });
    assert.equal(cfg.__schema, SCHEMA_VERSION);
    assert.equal(cfg.animate, "lines");
  });
});

describe("anim-props", () => {
  it("exports panel and runner constants", () => {
    assert.equal(ANIM_PROPS.length, 10);
    assert.equal(TWEEN_PROP_KEYS.length, 10);
    assert.ok(EASE_OPTIONS.includes("power2.out"));
    assert.ok(STAGGER_FROM.includes("random"));
    assert.equal(ANIM_PROPS.find((p) => p.key === "yPercent")?.defaultFrom, 100);
  });
});
