import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, "temporary screenshots");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function findChrome() {
  const base = path.join(process.env.USERPROFILE || "", ".cache", "puppeteer", "chrome");
  if (!fs.existsSync(base)) throw new Error("No cached chrome found at " + base);
  const versions = fs.readdirSync(base).sort();
  const latest = versions[versions.length - 1];
  return path.join(base, latest, "chrome-win64", "chrome.exe");
}

function nextIndex() {
  const files = fs.readdirSync(outDir).filter((f) => /^screenshot-\d+/.test(f));
  const nums = files.map((f) => parseInt(f.match(/^screenshot-(\d+)/)[1], 10));
  return nums.length ? Math.max(...nums) + 1 : 1;
}

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3];
const idx = nextIndex();
const fileName = `screenshot-${idx}${label ? "-" + label : ""}.png`;
const outPath = path.join(outDir, fileName);

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  defaultViewport: { width: 1600, height: 900 },
});
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: outPath });
await browser.close();
console.log("Saved " + path.join("temporary screenshots", fileName));
