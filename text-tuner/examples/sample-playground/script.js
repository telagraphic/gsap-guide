/**
 * Text Tuner sample playground — consumer-shaped boot script.
 * Tier-1 configs live in define-configs.js; everything else ships from the package.
 */

import { define, discover, attach } from "../../src/index.js";
import { SAMPLE_DEFINE_CONFIGS } from "./define-configs.js";

define(SAMPLE_DEFINE_CONFIGS);
discover();

await attach({
  fallbackId: "cold-start-lines",
  storageKey: "sample-playground",
  targets: ".split-target",
  fontsManifest: new URL("../../fonts.manifest.json", import.meta.url).href,
});
