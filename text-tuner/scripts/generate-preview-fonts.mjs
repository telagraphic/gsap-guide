/**
 * Scan a fonts/ directory and emit fonts.css + fonts.manifest.json.
 *
 * Defaults (package starter):
 *   --dir ./fonts --out-css ./fonts.css --out-manifest ./fonts.manifest.json
 */

import { readdir, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EXTENSIONS = new Set([".woff2", ".woff", ".otf", ".ttf"]);
const SAFE_FILENAME = /^[A-Za-z0-9._-]+\.(woff2|woff|otf|ttf)$/;
const VARIABLE_AXIS_IN_NAME = /\[[a-z]+\]/i;

const WEIGHT_MAP = [
  ["extralight", 200],
  ["ultralight", 200],
  ["thin", 100],
  ["light", 300],
  ["book", 400],
  ["regular", 400],
  ["medium", 500],
  ["semibold", 600],
  ["bold", 700],
  ["extrabold", 800],
  ["ultrabold", 800],
  ["black", 900],
];

function parseArgs(argv) {
  const opts = {
    dir: "./fonts",
    outCss: "./fonts.css",
    outManifest: "./fonts.manifest.json",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir") opts.dir = argv[++i];
    else if (arg === "--out-css") opts.outCss = argv[++i];
    else if (arg === "--out-manifest") opts.outManifest = argv[++i];
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: generate-preview-fonts.mjs [options]

  --dir <path>            Font binaries root (default: ./fonts)
  --out-css <path>        Output CSS (default: ./fonts.css)
  --out-manifest <path>   Output manifest JSON (default: ./fonts.manifest.json)
`);
      process.exit(0);
    }
  }

  return opts;
}

export function slugToFamilyName(slug) {
  return slug
    .split("-")
    .map((part) => {
      if (part === "fh") return "FH";
      if (part === "kh") return "KH";
      if (part === "pp") return "PP";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function parseWeightAndStyle(filename) {
  const base = filename.replace(/\.[^.]+$/, "");
  const lower = base.toLowerCase();
  const style = /italic/.test(lower) ? "italic" : "normal";

  let weight = 400;
  for (const [token, value] of WEIGHT_MAP) {
    if (lower.includes(token)) {
      weight = value;
      break;
    }
  }

  return { weight, style };
}

function shouldIncludeFont(filename) {
  if (VARIABLE_AXIS_IN_NAME.test(filename)) {
    return { ok: false, reason: "variable-axis filename (e.g. [wght])" };
  }
  if (!SAFE_FILENAME.test(filename)) {
    return {
      ok: false,
      reason: "filename must be ASCII [A-Za-z0-9._-] only (no spaces or special characters)",
    };
  }
  return { ok: true };
}

function getFormat(filename) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (ext === ".woff2") return "woff2";
  if (ext === ".woff") return "woff";
  if (ext === ".otf") return "opentype";
  return "truetype";
}

async function collectFontFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFontFiles(fullPath, files);
    } else if (EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * @param {{ dir: string, outCss: string, outManifest: string, cwd?: string }} options
 */
export async function generatePreviewFonts(options) {
  const cwd = options.cwd || process.cwd();
  const fontsDir = resolve(cwd, options.dir);
  const outCss = resolve(cwd, options.outCss);
  const outManifest = resolve(cwd, options.outManifest);

  const allFiles = await collectFontFiles(fontsDir);
  allFiles.sort();

  const skipped = [];
  const fontFiles = [];

  for (const filePath of allFiles) {
    const filename = filePath.split(/[/\\]/).pop();
    const check = shouldIncludeFont(filename);
    if (check.ok) {
      fontFiles.push(filePath);
    } else {
      skipped.push({ path: relative(fontsDir, filePath), reason: check.reason });
    }
  }

  const families = new Set();
  const faceBlocks = [];
  const cssDir = dirname(outCss);
  const fontsFolderName = options.dir.replace(/^\.\//, "").split("/").pop() || "fonts";

  for (const filePath of fontFiles) {
    const relFromFontsDir = relative(fontsDir, filePath).replace(/\\/g, "/");
    const slug = relFromFontsDir.split("/")[0];
    const filename = relFromFontsDir.split("/").pop();
    const familyName = slugToFamilyName(slug);
    const { weight, style } = parseWeightAndStyle(filename);

    families.add(slug);

    const urlPath = join(fontsFolderName, relFromFontsDir).replace(/\\/g, "/");
    const relUrl = relative(cssDir, join(cssDir, urlPath)).replace(/\\/g, "/");

    faceBlocks.push(`@font-face {
  font-family: "${familyName}";
  src: url("${relUrl}") format("${getFormat(filename)}");
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`);
  }

  const sortedFamilies = [...families].sort();
  const rootVars = sortedFamilies
    .map((slug) => `  --font-${slug}: "${slugToFamilyName(slug)}", sans-serif;`)
    .join("\n");

  const css = `/* Generated by generate-preview-fonts.mjs — do not edit by hand */
/* ${fontFiles.length} @font-face declarations (${skipped.length} skipped) */

${faceBlocks.join("\n\n")}

:root {
${rootVars}
}
`;

  const manifest = {
    version: 1,
    families: sortedFamilies.map((slug) => ({
      slug,
      label: slugToFamilyName(slug),
      cssVar: `--font-${slug}`,
      family: slugToFamilyName(slug),
    })),
  };

  await mkdir(dirname(outCss), { recursive: true });
  await mkdir(dirname(outManifest), { recursive: true });
  await writeFile(outCss, css, "utf8");
  await writeFile(outManifest, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return { fontFiles: fontFiles.length, skipped: skipped.length, families: sortedFamilies.length };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const result = await generatePreviewFonts(opts);
  console.log(
    `Wrote ${result.fontFiles} @font-face rules, ${result.families} families → ${opts.outCss}, ${opts.outManifest}`
  );
  if (result.skipped > 0) {
    console.warn(`Skipped ${result.skipped} font file(s) — re-run with DEBUG=1 for details`);
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
