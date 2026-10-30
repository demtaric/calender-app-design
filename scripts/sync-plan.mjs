// Copies the generated learning-plan events into the app bundle.
// Source defaults to the sibling Learn_2026 repo; override with LEARN_PLAN=/path/to/events.json.
//
// Usage: npm run sync-plan

import { copyFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(process.env.LEARN_PLAN ?? join(ROOT, "..", "Learn_2026", "plan", "events.json"));
const target = join(ROOT, "src", "data", "learn-plan-events.json");

if (!existsSync(source)) {
  console.error(`Plan events not found at ${source}. Run "node plan/build-events.mjs" in Learn_2026 first.`);
  process.exit(1);
}

copyFileSync(source, target);
console.log(`Synced ${source} -> src/data/learn-plan-events.json`);
