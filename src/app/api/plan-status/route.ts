import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import type { PlanStatus } from "@/lib/types";

/**
 * Records a learning-plan status in Learn_2026/plan/status.json, rebuilds the plan and syncs it into
 * the app. Local only: it writes to a sibling repo, so it is disabled outside `next dev`.
 */

const run = promisify(execFile);
const PLAN_DIR = resolve(process.env.LEARN_PLAN_DIR ?? join(process.cwd(), "..", "Learn_2026", "plan"));
const STATUS_FILE = join(PLAN_DIR, "status.json");
const ID_PATTERN = /^[a-z0-9-]+(@\d{4}-\d{2}-\d{2})?$/;
const WRITABLE: readonly PlanStatus[] = ["planned", "done", "missed"];

type Body = { id?: unknown; status?: unknown };

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Plan status can only be changed when running locally" }, { status: 404 });
  }

  const { id, status } = (await request.json().catch(() => ({}))) as Body;
  if (typeof id !== "string" || !ID_PATTERN.test(id) || !WRITABLE.includes(status as PlanStatus)) {
    return Response.json({ error: "Expected { id, status: planned | done | missed }" }, { status: 400 });
  }

  const previous = await readFile(STATUS_FILE, "utf8").catch(() => "{}\n");
  const statuses = JSON.parse(previous) as Record<string, PlanStatus>;
  // "planned" is the default, so it is recorded by removing the entry.
  if (status === "planned") delete statuses[id];
  else statuses[id] = status as PlanStatus;

  const sorted = Object.fromEntries(Object.entries(statuses).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(STATUS_FILE, `${JSON.stringify(sorted, null, 2)}\n`);

  try {
    await run(process.execPath, [join(PLAN_DIR, "build-events.mjs")]);
    await run(process.execPath, [join(process.cwd(), "scripts", "sync-plan.mjs")], {
      env: { ...process.env, LEARN_PLAN_DIR: PLAN_DIR },
    });
  } catch (error) {
    await writeFile(STATUS_FILE, previous);
    const message = error instanceof Error && "stderr" in error ? String(error.stderr).trim() : String(error);
    console.error(`[plan-status] rebuild failed for ${id}=${String(status)}:`, message);
    const reason = message.split("\n").find((line) => line.startsWith("Error:")) ?? "see the dev server log";
    return Response.json({ error: `Plan rebuild failed. ${reason}` }, { status: 500 });
  }

  return Response.json({ id, status });
}
