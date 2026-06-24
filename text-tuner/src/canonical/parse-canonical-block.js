import { normalizeStaggerConfig } from "../schema/config.js";
import { withSchemaVersion } from "../schema/defaults.js";

function parseBool(raw, fallback = false) {
  if (raw === "true") return true;
  if (raw === "false") return false;
  return fallback;
}

function parseNumber(raw, fallback = 0) {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function extractObjectLiteral(source, startIndex) {
  const open = source.indexOf("{", startIndex);
  if (open === -1) return null;

  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  return null;
}

function parseSimpleObject(literal) {
  const out = {};
  const body = literal.replace(/^\{|\}$/g, "").trim();
  if (!body) return out;

  const spread = body.match(/\.\.\.(\{[\s\S]*?\})/);
  if (spread) {
    try {
      Object.assign(out, JSON.parse(spread[1]));
    } catch {
      /* ignore malformed spread */
    }
  }

  const propRe = /([a-zA-Z_][\w]*)\s*:\s*([^,\n}]+)/g;
  let match;
  while ((match = propRe.exec(body))) {
    const key = match[1];
    if (key === "scrollTrigger" || key === "stagger") continue;
    let raw = match[2].trim();
    if (raw.startsWith("{") || raw.startsWith("[")) continue;
    if (raw.startsWith('"') || raw.startsWith("'")) {
      out[key] = raw.slice(1, -1);
    } else if (raw === "true" || raw === "false") {
      out[key] = raw === "true";
    } else {
      out[key] = parseNumber(raw, raw);
    }
  }
  return out;
}

function parseStaggerLiteral(literal) {
  const body = literal.replace(/^\{|\}$/g, "");
  const stagger = { timing: "amount", amount: 0.12, from: "start" };
  const warnings = [];

  if (/each\s*:/.test(body)) stagger.timing = "each";
  const amount = body.match(/amount\s*:\s*([^,}]+)/);
  const each = body.match(/each\s*:\s*([^,}]+)/);
  const from = body.match(/from\s*:\s*([^,}]+)/);
  const ease = body.match(/ease\s*:\s*([^,}]+)/);
  const grid = body.match(/grid\s*:\s*\[\s*(\d+)\s*,\s*(\d+)\s*]/);
  const axis = body.match(/axis\s*:\s*"([^"]+)"/);

  if (amount) stagger.amount = parseNumber(amount[1].trim(), 0.12);
  if (each) stagger.each = parseNumber(each[1].trim(), 0.05);
  if (from) stagger.from = from[1].trim().replace(/['"]/g, "");
  if (ease) stagger.ease = ease[1].trim().replace(/['"]/g, "");
  if (grid) stagger.grid = [Number(grid[1]), Number(grid[2])];
  if (axis) stagger.axis = axis[1];

  return { stagger: normalizeStaggerConfig(stagger), warnings };
}

function parseScrollTriggerLiteral(literal) {
  const st = {
    trigger: "",
    start: "top 25%",
    end: "top top",
    scrub: true,
    markers: false,
  };
  const warnings = [];

  const trigger = literal.match(/trigger\s*:\s*(['"])(.*?)\1/);
  const start = literal.match(/start\s*:\s*(['"])(.*?)\1/);
  const end = literal.match(/end\s*:\s*(['"])(.*?)\1/);
  const scrub = literal.match(/scrub\s*:\s*([^,}\n]+)/);
  const markers = literal.match(/markers\s*:\s*([^,}\n]+)/);

  if (trigger) st.trigger = trigger[2];
  if (start) st.start = start[2];
  if (end) st.end = end[2];
  if (scrub) {
    const raw = scrub[1].trim();
    if (raw === "false") st.scrub = false;
    else if (raw === "true") st.scrub = true;
    else st.scrub = parseNumber(raw, 1);
  }
  if (markers) st.markers = parseBool(markers[1].trim(), false);

  return { scrollTrigger: st, warnings };
}

/**
 * Parse canonical Copy code into SplitScrollConfig.
 * @param {string} source
 * @param {{ id?: string }} [options]
 */
export function parseCanonicalBlock(source, options = {}) {
  const warnings = [];
  const text = String(source || "").trim();

  if (!text) {
    return { config: null, warnings: ["Empty source"] };
  }

  const createMatch = text.match(
    /SplitText\.create\s*\(\s*(['"])(.*?)\1\s*,\s*\{([\s\S]*)\}\s*\)/
  );
  if (!createMatch) {
    return { config: null, warnings: ["Could not find SplitText.create(…) block"] };
  }

  const targetText = createMatch[2];
  const optionsBody = createMatch[3];

  const typeMatch = optionsBody.match(/type\s*:\s*(['"])(.*?)\1/);
  const maskMatch = optionsBody.match(/mask\s*:\s*(['"])(.*?)\1/);
  const autoSplitMatch = optionsBody.match(/autoSplit\s*:\s*(true|false)/);
  const smartSplitMatch = optionsBody.match(/smartSplit\s*:\s*(true|false)/);

  const setMatch = optionsBody.match(/gsap\.set\s*\(\s*self\.(\w+)\s*,\s*(\{[\s\S]*?\})\s*\)/);
  const toMatch = optionsBody.match(/gsap\.to\s*\(\s*self\.(\w+)\s*,\s*(\{[\s\S]*)/);

  if (!setMatch || !toMatch) {
    return { config: null, warnings: ["Missing gsap.set / gsap.to in onSplit"] };
  }

  const animate = setMatch[1];
  let from = {};
  try {
    from = JSON.parse(setMatch[2]);
  } catch {
    warnings.push("Could not parse gsap.set from-vars; using empty object");
  }

  const toLiteral = extractObjectLiteral(toMatch[2], 0);
  if (!toLiteral) {
    return { config: null, warnings: ["Could not parse gsap.to options"] };
  }

  const toBody = toLiteral;
  const durationMatch = toBody.match(/duration\s*:\s*([^,}\n]+)/);
  const easeMatch = toBody.match(/ease\s*:\s*(['"])(.*?)\1/);
  const staggerMatch = toBody.match(/stagger\s*:\s*(\{[\s\S]*?\})/);
  const stMatch = toBody.match(/scrollTrigger\s*:\s*(\{[\s\S]*\})/);

  const to = parseSimpleObject(toBody);
  delete to.duration;
  delete to.ease;
  delete to.stagger;
  delete to.scrollTrigger;

  const duration = durationMatch ? parseNumber(durationMatch[1].trim(), 1) : 1;
  const ease = easeMatch ? easeMatch[2] : "power2.out";

  let stagger = normalizeStaggerConfig({ timing: "amount", amount: 0.12, from: "start" });
  if (staggerMatch) {
    const parsed = parseStaggerLiteral(staggerMatch[1]);
    stagger = parsed.stagger;
    warnings.push(...parsed.warnings);
  }

  let scrollTrigger = {
    trigger: `[data-playground-trigger="${options.id || "id"}"]`,
    start: "top 25%",
    end: "top top",
    scrub: true,
    markers: false,
  };
  if (stMatch) {
    const parsed = parseScrollTriggerLiteral(stMatch[1]);
    scrollTrigger = parsed.scrollTrigger;
    warnings.push(...parsed.warnings);
  }

  const id = options.id || "imported";
  const playgroundText =
    options.id != null ? `[data-playground="${options.id}"]` : targetText;

  const config = withSchemaVersion({
    targets: {
      element: scrollTrigger.trigger || `[data-playground-trigger="${id}"]`,
      text: playgroundText,
    },
    splitText: {
      type: typeMatch ? typeMatch[2] : "lines",
      mask: maskMatch ? maskMatch[2] : "none",
      autoSplit: autoSplitMatch ? autoSplitMatch[1] === "true" : true,
      smartSplit: smartSplitMatch ? smartSplitMatch[1] === "true" : true,
    },
    animate,
    from,
    to: { ...to, duration, ease },
    stagger,
    scrollTrigger,
    typography: {
      fontVar: "--font-basier-circle",
      fontSize: 1.25,
      lineHeight: 1.5,
      letterSpacing: 0,
      textAlign: "left",
      textTransform: "none",
    },
  });

  if (options.id != null) {
    config.targets.text = `[data-playground="${options.id}"]`;
    if (!scrollTrigger.trigger.includes("data-playground")) {
      config.targets.element = `[data-playground-trigger="${options.id}"]`;
      config.scrollTrigger.trigger = config.targets.element;
    }
  }

  return { config, warnings };
}
