"use client";

import { toast } from "sonner";
import { planIdOf } from "@/lib/learn-plan";
import type { PlanStatus } from "@/lib/types";
import { useAppStore } from "@/stores/app-store";

/**
 * Marks a learning-plan event done (or back to planned). The store updates at once; the change is
 * then written to Learn_2026/plan/status.json and reverted here if that fails.
 */
export async function markPlanStatus(eventId: string, status: PlanStatus) {
  const { events, setEventStatus } = useAppStore.getState();
  const previous = events.find((e) => e.id === eventId)?.status ?? "planned";
  setEventStatus(eventId, status);

  try {
    const res = await fetch("/api/plan-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: planIdOf(eventId), status }),
    });
    if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? res.statusText);
  } catch (error) {
    setEventStatus(eventId, previous);
    toast.error("Could not save to the plan", { description: error instanceof Error ? error.message : String(error) });
  }
}
