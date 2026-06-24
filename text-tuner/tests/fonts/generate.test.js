import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  generatePreviewFonts,
  slugToFamilyName,
} from "../../scripts/generate-preview-fonts.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;

test("slugToFamilyName formats starter slugs", () => {
  assert.equal(slugToFamilyName("fh-enso"), "FH Enso");
  assert.equal(slugToFamilyName("editorial-new"), "Editorial New");
  assert.equal(slugToFamilyName("basier-circle"), "Basier Circle");
});

test("generatePreviewFonts writes manifest from package fonts/", async () => {
  const result = await generatePreviewFonts({
    dir: "fonts",
    outCss: "fonts.css",
    outManifest: "fonts.manifest.json",
    cwd: ROOT,
  });

  assert.ok(result.families >= 6);

  const manifest = JSON.parse(
    await readFile(join(ROOT, "fonts.manifest.json"), "utf8")
  );
  assert.equal(manifest.version, 1);
  assert.equal(manifest.families.length, result.families);

  for (const entry of manifest.families) {
    assert.equal(entry.cssVar, `--font-${entry.slug}`);
    assert.equal(entry.family, slugToFamilyName(entry.slug));
    assert.equal(entry.label, entry.family);
  }

  assert.ok(manifest.families.some((f) => f.slug === "basier-circle" && f.cssVar === "--font-basier-circle"));
  assert.ok(manifest.families.some((f) => f.slug === "fh-dfaalt"));

  const css = await readFile(join(ROOT, "fonts.css"), "utf8");
  assert.match(css, /@font-face/);
  assert.match(css, /--font-basier-circle: "Basier Circle", sans-serif;/);
  assert.match(css, /--font-fh-dfaalt: "FH Dfaalt", sans-serif;/);
  assert.doesNotMatch(css, /--font-fh-enso:/);
});
