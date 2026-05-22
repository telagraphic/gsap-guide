import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_PATH = join(__dirname, "..", ".cursor", "debug-1bb1f6.log");
const BASE = process.env.DEBUG_BASE_URL ?? "http://127.0.0.1:8765";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`${BASE}/controls.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const before = await page.evaluate(() => ({
  st: ScrollTrigger.getAll().length,
  hasSplit: !!document.querySelector(
    ".frame__headline .word, .frame__headline .char, .frame__headline .line"
  ),
}));

await page.keyboard.press("Shift+KeyC");
await page.waitForTimeout(400);
await page.selectOption("#controls-font", "--font-editorial-new");
await page.waitForTimeout(600);

const after = await page.evaluate(() => ({
  st: ScrollTrigger.getAll().length,
  triggers: ScrollTrigger.getAll().map((st) => ({
    progress: Number(st.progress.toFixed(3)),
    isActive: st.isActive,
  })),
  hasSplit: !!document.querySelector(
    ".frame__headline .word, .frame__headline .char, .frame__headline .line"
  ),
  agentLogs: window.__agentDebugLogs ?? [],
  sessionLogs: (() => {
    try {
      return JSON.parse(sessionStorage.getItem("agentDebugLogs") ?? "[]");
    } catch {
      return [];
    }
  })(),
}));

await browser.close();

const lines = [
  {
    sessionId: "1bb1f6",
    runId: process.env.DEBUG_RUN_ID ?? "post-fix",
    hypothesisId: "AUTO",
    location: "repro-font-change.mjs",
    message: "playwright snapshot",
    data: { before, after },
    timestamp: Date.now(),
  },
  ...(after.agentLogs.length ? after.agentLogs : after.sessionLogs),
];

writeFileSync(LOG_PATH, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
console.log(JSON.stringify({ before, afterSt: after.st, logCount: lines.length }, null, 2));
