import { describe, expect, it } from "vitest";
import { learnPlanEvents, learnPlanItems, planIdOf, withLiveStatuses } from "./learn-plan";

describe("learn plan", () => {
  it("maps every plan item to a prefixed calendar event", () => {
    expect(learnPlanEvents).toHaveLength(learnPlanItems.length);
    expect(planIdOf(learnPlanEvents[0].id)).toBe(learnPlanItems[0].id);
  });

  it("takes statuses from the store over the bundled plan", () => {
    const [first, second] = learnPlanEvents;
    const live = withLiveStatuses(learnPlanItems, [{ ...first, status: "done" }, second]);
    expect(live[0].status).toBe("done");
    expect(live[1].status).toBe(learnPlanItems[1].status);
  });
});
