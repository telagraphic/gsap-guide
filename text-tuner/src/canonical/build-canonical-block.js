import { normalizeStaggerConfig } from "../schema/config.js";

export function buildStaggerLiteral(stagger) {
  const s = normalizeStaggerConfig(stagger);
  const from = JSON.stringify(s.from || "start");
  const parts =
    s.timing === "each"
      ? [`each: ${s.each}`, `from: ${from}`]
      : [`amount: ${s.amount}`, `from: ${from}`];
  if (s.ease) parts.push(`ease: ${JSON.stringify(s.ease)}`);
  if (s.grid) parts.push(`grid: [${s.grid[0]}, ${s.grid[1]}]`);
  if (s.axis && s.axis !== "both") parts.push(`axis: ${JSON.stringify(s.axis)}`);
  return `{ ${parts.join(", ")} }`;
}

/**
 * Production Copy code block (canonical import/export shape).
 * @param {import('../schema/defaults.js').SplitScrollConfig} cfg
 */
export function buildCanonicalBlock(cfg) {
  const animateKey = cfg.animate;
  const fromLit = JSON.stringify(cfg.from, null, 2).split("\n").join("\n    ");
  const toVars = { ...cfg.to };
  const duration = toVars.duration ?? 1;
  const ease = toVars.ease ?? "power2.out";
  delete toVars.duration;
  delete toVars.ease;
  const staggerLit = buildStaggerLiteral(cfg.stagger);
  const maskLine =
    cfg.splitText.mask && cfg.splitText.mask !== "none"
      ? `\n  mask: ${JSON.stringify(cfg.splitText.mask)},`
      : "";
  const scrubVal =
    cfg.scrollTrigger.scrub === false
      ? "false"
      : typeof cfg.scrollTrigger.scrub === "number"
        ? cfg.scrollTrigger.scrub
        : "true";

  const toSpread = Object.keys(toVars).length ? `...${JSON.stringify(toVars)},\n      ` : "";

  return `const split = SplitText.create(${JSON.stringify(cfg.targets.text)}, {
  type: ${JSON.stringify(cfg.splitText.type)},${maskLine}
  autoSplit: ${cfg.splitText.autoSplit},
  smartSplit: ${cfg.splitText.smartSplit},
  onSplit(self) {
    gsap.set(self.${animateKey}, ${fromLit});
    return gsap.to(self.${animateKey}, {
      ${toSpread}duration: ${duration},
      ease: ${JSON.stringify(ease)},
      stagger: ${staggerLit},
      scrollTrigger: {
        trigger: ${JSON.stringify(cfg.scrollTrigger.trigger)},
        start: ${JSON.stringify(cfg.scrollTrigger.start)},
        end: ${JSON.stringify(cfg.scrollTrigger.end)},
        scrub: ${scrubVal},
        markers: ${!!cfg.scrollTrigger.markers},
      },
    });
  },
});`;
}

export function serializeConfig(cfg) {
  return JSON.stringify(cfg, null, 2);
}
