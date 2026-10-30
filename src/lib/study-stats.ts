import { addDays, diffDays, startOfWeek } from "./dates";
import { PLAN_ID_PREFIX, type PlanEvent } from "./learn-plan";

export type StudySubject = "german" | "kubernetes";

export type Hours = { planned: number; done: number };

export type SubjectWeek = Hours & {
  /** First session of this subject on or after today; null when none is left. */
  nextDate: string | null;
};

export type Milestone = {
  /** Calendar event id (with the plan prefix), for focusing it. */
  eventId: string;
  title: string;
  date: string;
  inDays: number;
  tentative: boolean;
};

export type StudyStats = {
  german: SubjectWeek;
  kubernetes: SubjectWeek;
  b1: Milestone | null;
  cka: Milestone | null;
  /** Next Modelltest, killer.sh, gate or deadline. */
  next: Milestone | null;
  /** Study hours on days before today, from the first plan day. */
  toDate: Hours;
};

const STUDY_SUBJECTS: readonly StudySubject[] = ["german", "kubernetes"];
const CHECKPOINT_KINDS = new Set(["test", "gate", "deadline"]);

const hoursOf = (e: PlanEvent) => (e.allDay ? 0 : (e.end - e.start) / 60);

function sumHours(events: PlanEvent[]): Hours {
  return events.reduce(
    (acc, e) => ({ planned: acc.planned + hoursOf(e), done: acc.done + (e.status === "done" ? hoursOf(e) : 0) }),
    { planned: 0, done: 0 },
  );
}

function toMilestone(e: PlanEvent | undefined, today: string): Milestone | null {
  if (!e) return null;
  return {
    eventId: `${PLAN_ID_PREFIX}${e.id}`,
    title: e.title,
    date: e.date,
    inDays: diffDays(today, e.date),
    tentative: e.status === "tentative",
  };
}

export function computeStudyStats(items: PlanEvent[], today: string, weekStartsOn: 0 | 1 = 0): StudyStats {
  const weekStart = startOfWeek(today, weekStartsOn);
  const weekEnd = addDays(weekStart, 6);
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  const upcoming = sorted.filter((e) => e.date >= today);
  const study = sorted.filter((e) => STUDY_SUBJECTS.includes(e.subject as StudySubject));

  const subjectWeek = (subject: StudySubject): SubjectWeek => ({
    ...sumHours(study.filter((e) => e.subject === subject && e.date >= weekStart && e.date <= weekEnd)),
    nextDate: upcoming.find((e) => e.subject === subject)?.date ?? null,
  });

  return {
    german: subjectWeek("german"),
    kubernetes: subjectWeek("kubernetes"),
    b1: toMilestone(upcoming.find((e) => e.id === "b1-exam"), today),
    cka: toMilestone(upcoming.find((e) => e.id === "cka-exam"), today),
    next: toMilestone(upcoming.find((e) => CHECKPOINT_KINDS.has(e.kind)), today),
    toDate: sumHours(study.filter((e) => e.date < today)),
  };
}
