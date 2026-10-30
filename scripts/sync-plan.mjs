// Copies the generated learning-plan files (events + public holidays) into the app bundle.
// Source defaults to the sibling Learn_2026 repo; override with LEARN_PLAN_DIR=/path/to/plan.
//
// Usage: npm run sync-plan

import { copyFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(process.env.LEARN_PLAN_DIR ?? join(ROOT, "..", "Learn_2026", "plan"));
const FILES = { "events.json": "learn-plan-events.json", "holidays.json": "learn-plan-holidays.json" };

for (const [from, to] of Object.entries(FILES)) {
  const source = join(sourceDir, from);
  if (!existsSync(source)) {
    console.error(`${source} not found. Run "node plan/build-events.mjs" in Learn_2026 first.`);
    process.exit(1);
  }
  copyFileSync(source, join(ROOT, "src", "data", to));
  console.log(`Synced ${source} -> src/data/${to}`);
}
