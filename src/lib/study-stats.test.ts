import { describe, expect, it } from "vitest";
import type { PlanEvent } from "./learn-plan";
import { computeStudyStats } from "./study-stats";

const ev = (patch: Partial<PlanEvent> & Pick<PlanEvent, "id" | "date">): PlanEvent => ({
  title: patch.id,
  start: 1200,
  end: 1350,
  allDay: false,
  color: "blue",
  subject: "german",
  kind: "session",
  status: "planned",
  ...patch,
});

const PLAN: PlanEvent[] = [
  ev({ id: "ger-tue@2026-11-03", date: "2026-11-03", status: "done" }),
  ev({ id: "ger-thu@2026-11-05", date: "2026-11-05" }),
  ev({ id: "ger-tue@2026-10-27", date: "2026-10-27", status: "done" }),
  ev({ id: "kita@2026-11-04", date: "2026-11-04", subject: "family", start: 480, end: 540 }),
  ev({ id: "mt-1", date: "2026-11-14", kind: "test", start: 510, end: 690 }),
  ev({ id: "b1-exam", date: "2026-12-12", subject: "exam", kind: "exam", allDay: true, status: "tentative" }),
  ev({ id: "k8s-sat-am@2027-01-09", date: "2027-01-09", subject: "kubernetes", start: 510, end: 720 }),
  ev({ id: "cka-exam", date: "2027-02-20", subject: "exam", kind: "exam", allDay: true }),
];

describe("study stats", () => {
  it("sums this week's planned and done hours per subject, ignoring family slots", () => {
    // Wed Nov 4, week starting Monday Nov 2
    const stats = computeStudyStats(PLAN, "2026-11-04", 1);
    expect(stats.german).toEqual({ planned: 5, done: 2.5, nextDate: "2026-11-05" });
    expect(stats.kubernetes).toEqual({ planned: 0, done: 0, nextDate: "2027-01-09" });
  });

  it("counts down to the exams and flags tentative dates", () => {
    const stats = computeStudyStats(PLAN, "2026-11-04", 1);
    expect(stats.b1).toMatchObject({ eventId: "plan:b1-exam", inDays: 38, tentative: true });
    expect(stats.cka).toMatchObject({ date: "2027-02-20", inDays: 108, tentative: false });
  });

  it("finds the next checkpoint and totals study hours before today", () => {
    const stats = computeStudyStats(PLAN, "2026-11-04", 1);
    expect(stats.next).toMatchObject({ title: "mt-1", inDays: 10 });
    expect(stats.toDate).toEqual({ planned: 5, done: 5 });
  });

  it("drops milestones that are already past", () => {
    const stats = computeStudyStats(PLAN, "2027-03-01", 1);
    expect(stats.b1).toBeNull();
    expect(stats.cka).toBeNull();
    expect(stats.kubernetes.nextDate).toBeNull();
  });
});
