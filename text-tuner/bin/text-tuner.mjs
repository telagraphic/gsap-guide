#!/usr/bin/env node

import { generatePreviewFonts } from "../scripts/generate-preview-fonts.mjs";

const [, , command, subcommand, ...rest] = process.argv;

if (command === "fonts" && subcommand === "generate") {
  const opts = { dir: "./fonts", outCss: "./fonts.css", outManifest: "./fonts.manifest.json" };
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--dir") opts.dir = rest[++i];
    else if (rest[i] === "--out-css") opts.outCss = rest[++i];
    else if (rest[i] === "--out-manifest") opts.outManifest = rest[++i];
  }
  const result = await generatePreviewFonts(opts);
  console.log(
    `Generated ${result.fontFiles} faces, ${result.families} families → ${opts.outCss}`
  );
} else {
  console.log(`text-tuner — dev typography panel for GSAP SplitText

Usage:
  npx text-tuner fonts generate [options]

Options:
  --dir <path>            Font binaries root (default: ./fonts)
  --out-css <path>        Output CSS (default: ./fonts.css)
  --out-manifest <path>   Output manifest (default: ./fonts.manifest.json)
`);
  process.exit(command ? 1 : 0);
}
