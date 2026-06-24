/** @typedef {{ slug: string, label: string, cssVar: string, family: string }} FontFamily */

/** Minimal fallback when manifest fetch fails (starter slugs). */
export const STARTER_FONT_FALLBACK = [
  { slug: "fh-enso", label: "FH Enso", cssVar: "--font-fh-enso", family: "FH Enso" },
  { slug: "editorial-new", label: "Editorial New", cssVar: "--font-editorial-new", family: "Editorial New" },
  { slug: "maple-mono", label: "Maple Mono", cssVar: "--font-maple-mono", family: "Maple Mono" },
  { slug: "fh-noetica", label: "FH Noetica", cssVar: "--font-fh-noetica", family: "FH Noetica" },
  { slug: "lock-serif", label: "Lock Serif", cssVar: "--font-lock-serif", family: "Lock Serif" },
  { slug: "basier-circle", label: "Basier Circle", cssVar: "--font-basier-circle", family: "Basier Circle" },
];

/**
 * @param {Array<{ slug?: string, label: string, cssVar?: string, family?: string }>} families
 * @returns {FontFamily[]}
 */
export function normalizeFamilies(families) {
  if (!Array.isArray(families)) return [];
  return families.map((entry) => {
    const slug =
      entry.slug ||
      String(entry.cssVar || "")
        .replace(/^--font-/, "")
        .trim();
    return {
      slug,
      label: entry.label || slug,
      cssVar: entry.cssVar || `--font-${slug}`,
      family: entry.family || entry.label || slug,
    };
  });
}

/**
 * @param {object} [options]
 * @param {string} [options.fontsManifest]
 * @param {FontFamily[]} [options.fonts]
 */
export async function resolveFonts(options = {}) {
  if (options.fonts) {
    return normalizeFamilies(options.fonts);
  }

  const url = options.fontsManifest ?? "./fonts.manifest.json";

  if (typeof fetch !== "function") {
    return STARTER_FONT_FALLBACK;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const families = normalizeFamilies(data.families);
    if (!families.length) throw new Error("empty families");
    return families;
  } catch (err) {
    console.warn(`[text-tuner] could not load fonts manifest at ${url}:`, err.message);
    return STARTER_FONT_FALLBACK;
  }
}

/**
 * @param {string} fontVar
 * @param {FontFamily[]} families
 */
export function warnUnknownFontVar(fontVar, families) {
  if (!fontVar || !families?.length) return;
  const known = families.some((f) => f.cssVar === fontVar);
  if (!known) {
    console.warn(
      `[text-tuner] typography.fontVar "${fontVar}" is not in the fonts manifest — add the family under fonts/ and run fonts generate`
    );
  }
}
