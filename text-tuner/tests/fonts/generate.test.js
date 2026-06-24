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

test("generatePreviewFonts writes manifest with starter families", async () => {
  const result = await generatePreviewFonts({
    dir: "fonts",
    outCss: "fonts.css",
    outManifest: "fonts.manifest.json",
    cwd: ROOT,
  });

  assert.equal(result.families, 6);

  const manifest = JSON.parse(
    await readFile(join(ROOT, "fonts.manifest.json"), "utf8")
  );
  assert.equal(manifest.version, 1);
  assert.equal(manifest.families.length, 6);
  assert.ok(manifest.families.some((f) => f.slug === "fh-enso" && f.cssVar === "--font-fh-enso"));

  const css = await readFile(join(ROOT, "fonts.css"), "utf8");
  assert.match(css, /@font-face/);
  assert.match(css, /--font-fh-enso/);
});
