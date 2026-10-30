import type { Metadata } from "next";
import { TimeOffView } from "@/components/time-off/time-off-view";

export const metadata: Metadata = { title: "Study plan" };

export default function StudyPlanPage() {
  return <TimeOffView />;
}
