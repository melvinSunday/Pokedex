import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const outputFile = new URL("../dist/index.html", import.meta.url);
const gzipBudget = 120 * 1024;

let html;
try {
  html = readFileSync(outputFile);
} catch {
  console.error("Production bundle not found. Run `npm run build` first.");
  process.exit(1);
}

const gzipBytes = gzipSync(html).byteLength;
const gzipKilobytes = (gzipBytes / 1024).toFixed(2);
console.log(`Production page: ${gzipKilobytes} KB gzipped (budget: 120 KB)`);

if (gzipBytes > gzipBudget) {
  console.error("Bundle size exceeds the loading budget.");
  process.exit(1);
}
