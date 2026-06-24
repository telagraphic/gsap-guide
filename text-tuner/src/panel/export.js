import { serializeConfig } from "../canonical/build-canonical-block.js";
import { buildCanonicalBlock } from "../canonical/build-canonical-block.js";

export function copyConfigToClipboard(config) {
  return navigator.clipboard.writeText(serializeConfig(config));
}

export function copyCodeToClipboard(config) {
  return navigator.clipboard.writeText(buildCanonicalBlock(config));
}

export function copyCssToClipboard(exportTypographyCss, typography) {
  return navigator.clipboard.writeText(exportTypographyCss(typography));
}

export async function flashButton(btn, label) {
  if (!btn) return;
  const prev = btn.textContent;
  btn.textContent = label;
  await new Promise((r) => setTimeout(r, 1200));
  btn.textContent = prev;
}
