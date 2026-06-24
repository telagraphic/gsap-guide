#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { convert } from "../src/convert/index.js";
import { serializeConfig } from "../src/canonical/build-canonical-block.js";

function parseArgs(argv) {
  const opts = { format: "define", id: null, file: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--id") opts.id = argv[++i];
    else if (arg === "--format") opts.format = argv[++i];
    else if (!arg.startsWith("-")) opts.file = arg;
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.file) {
  console.error("Usage: text-tuner-convert <file.js> --id <playground-id> [--format define|config]");
  process.exit(1);
}
if (!opts.id) {
  console.error("--id is required");
  process.exit(1);
}

const source = await readFile(opts.file, "utf8");
const { config, warnings } = convert(source, { id: opts.id });

if (!config) {
  console.error("Convert failed:");
  warnings.forEach((w) => console.error(`  - ${w}`));
  process.exit(1);
}

warnings.forEach((w) => console.warn(`warning: ${w}`));

if (opts.format === "config") {
  console.log(serializeConfig(config));
} else {
  console.log(`define({\n  "${opts.id}": ${serializeConfig(config).replace(/^/gm, "  ").trim()}\n});`);
}
