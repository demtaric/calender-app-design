import planEvents from "@/data/learn-plan-events.json";
import planHolidays from "@/data/learn-plan-holidays.json";
import type { CalEvent, EventColor, Holiday } from "./types";

/** Plan events are owned by Learn_2026/plan/plan.json; this prefix marks them in the store. */
export const PLAN_ID_PREFIX = "plan:";

const COLORS: readonly EventColor[] = ["green", "purple", "cyan", "orange", "pink", "blue"];

/** One generated plan entry, as written by Learn_2026/plan/build-events.mjs. */
export type PlanEvent = {
  id: string;
  title: string;
  date: string;
  start: number;
  end: number;
  allDay: boolean;
  color: string;
  subject: string;
  kind: string;
  status: string;
  note?: string;
};

function toCalEvent(e: PlanEvent): CalEvent {
  if (!COLORS.includes(e.color as EventColor)) throw new Error(`Unknown color "${e.color}" on plan event ${e.id}`);
  // "planned" is the default and stays silent; done, missed and tentative show in the popover.
  const note = [e.status !== "planned" && e.status, e.note].filter(Boolean).join(" · ") || undefined;
  return {
    id: `${PLAN_ID_PREFIX}${e.id}`,
    title: e.title,
    date: e.date,
    start: e.start,
    end: e.end,
    allDay: e.allDay,
    color: e.color as EventColor,
    note,
  };
}

export const learnPlanItems = planEvents as PlanEvent[];

export const learnPlanEvents: CalEvent[] = learnPlanItems.map(toCalEvent);

export const isPlanEvent = (event: CalEvent) => event.id.startsWith(PLAN_ID_PREFIX);

/** Public holidays (Baden-Württemberg), maintained in Learn_2026/plan/plan.json. */
export const learnPlanHolidays: Holiday[] = planHolidays;
