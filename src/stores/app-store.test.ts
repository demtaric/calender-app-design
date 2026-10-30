import { describe, expect, it } from "vitest";
import { redo, undo, useAppStore } from "./app-store";

const ev = () => useAppStore.getState().events.find((e) => e.id === "plan:mt-0")!;

describe("undo / redo", () => {
  it("steps back and forward through data changes", () => {
    const before = ev().start;
    useAppStore.getState().moveEvent("plan:mt-0", { date: "2026-11-09", start: 780, end: 840 });
    expect(ev().start).toBe(780);

    expect(undo()).toBe("Calendar");
    expect(ev().start).toBe(before);
    expect(ev().date).toBe("2026-11-01");

    expect(redo()).toBe("Calendar");
    expect(ev().start).toBe(780);
  });

  it("restores a deleted event and labels leave changes", () => {
    useAppStore.getState().deleteEvent("plan:b1-exam");
    expect(useAppStore.getState().events.some((e) => e.id === "plan:b1-exam")).toBe(false);
    undo();
    expect(useAppStore.getState().events.some((e) => e.id === "plan:b1-exam")).toBe(true);

    useAppStore.getState().setRequestStatus("rq-6", "approved");
    expect(undo()).toBe("Leave request");
    expect(useAppStore.getState().requests.find((r) => r.id === "rq-6")!.status).toBe("pending");
  });

  it("does not record notifications", () => {
    while (undo()) {
      /* drain history */
    }
    useAppStore.getState().notify({ title: "t", body: "b" });
    expect(undo()).toBeNull();
  });
});
