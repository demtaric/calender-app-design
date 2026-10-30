"use client";

import Image from "next/image";
import { useMemo } from "react";
import { formatShort } from "@/lib/dates";
import { learnPlanItems } from "@/lib/learn-plan";
import { computeStudyStats, type Hours, type Milestone } from "@/lib/study-stats";
import { useToday } from "@/hooks/use-today";
import { useAppStore } from "@/stores/app-store";
import { useCalendarStore } from "@/stores/calendar-store";

type Stat = {
  id: string;
  icon: string;
  tint: string;
  value: string;
  caption: React.ReactNode;
  label: string;
  onSelect: () => void;
};

const hours = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}h`;
const doneOf = (h: Hours) => `${hours(h.done)} of ${hours(h.planned)}`;

function inDays(n: number): string {
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  return `in ${n} days`;
}

export function StatsPanel() {
  const weekStartsOn = useAppStore((s) => s.settings.weekStartsOn);
  const today = useToday();
  const s = useMemo(() => computeStudyStats(learnPlanItems, today, weekStartsOn), [today, weekStartsOn]);
  const { setDate, focusEvent } = useCalendarStore.getState();

  const milestone = (id: string, icon: string, tint: string, name: string, m: Milestone | null): Stat[] =>
    m
      ? [
          {
            id,
            icon,
            tint,
            value: `${name} ${inDays(m.inDays)}`,
            caption: m.tentative ? `${formatShort(m.date)} · date not booked yet` : formatShort(m.date),
            label: `Show ${m.title} in the calendar`,
            onSelect: () => focusEvent(m.eventId, m.date),
          },
        ]
      : [];

  const stats: Stat[] = [
    {
      id: "german",
      icon: "stat-available",
      tint: "var(--category-blue-tint)",
      value: s.german.planned ? `${doneOf(s.german)} German` : "No German this week",
      caption: s.german.planned
        ? "Done this week"
        : s.german.nextDate
          ? `Next session ${formatShort(s.german.nextDate)}`
          : "No sessions left",
      label: "Show the next German session",
      onSelect: () => setDate(s.german.planned || !s.german.nextDate ? today : s.german.nextDate),
    },
    {
      id: "kubernetes",
      icon: "stat-per-year",
      tint: "var(--category-purple-tint)",
      value: s.kubernetes.planned ? `${doneOf(s.kubernetes)} Kubernetes` : "Kubernetes paused",
      caption: s.kubernetes.planned
        ? "Done this week"
        : s.kubernetes.nextDate
          ? `Sprint starts ${formatShort(s.kubernetes.nextDate)}`
          : "No sessions left",
      label: "Show the next Kubernetes session",
      onSelect: () => setDate(s.kubernetes.planned || !s.kubernetes.nextDate ? today : s.kubernetes.nextDate),
    },
    ...milestone("b1", "stat-upcoming", "var(--category-orange-tint)", "B1", s.b1),
    ...milestone("cka", "stat-upcoming", "var(--category-pink-tint)", "CKA", s.cka),
    ...(s.next
      ? [
          {
            id: "next",
            icon: "stat-pending",
            tint: "var(--category-cyan-tint)",
            value: `Next check ${inDays(s.next.inDays)}`,
            caption: s.next.title,
            label: `Show ${s.next.title} in the calendar`,
            onSelect: () => focusEvent(s.next!.eventId, s.next!.date),
          },
        ]
      : []),
    {
      id: "to-date",
      icon: "stat-extra",
      tint: "var(--category-green-tint)",
      value: s.toDate.planned ? `${doneOf(s.toDate)} done` : "0h done so far",
      caption: s.toDate.planned ? "All study hours so far" : "Mark sessions done in plan.json",
      label: "Show this week",
      onSelect: () => setDate(today),
    },
  ];

  return (
    <aside
      aria-label="Study stats"
      className="flex w-full shrink-0 flex-col overflow-hidden border-t border-hairline bg-app xl:h-full xl:w-[304px] xl:border-t-0 xl:border-l"
    >
      <div className="flex h-[68px] w-full shrink-0 items-center gap-4 overflow-hidden border-b border-hairline px-4">
        <h2 className="t-16 min-w-0 flex-1 text-fg">Study stats</h2>
      </div>
      <div className="scroll-thin grid min-h-0 flex-1 grid-cols-1 gap-x-6 overflow-y-auto px-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-col xl:gap-x-0">
        {stats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            onClick={stat.onSelect}
            aria-label={`${stat.value}. ${stat.label}`}
            className="group relative flex w-full shrink-0 items-center gap-3 py-4 pr-2 text-left outline-none before:absolute before:-inset-x-2 before:inset-y-1.5 before:rounded-lg before:transition-colors before:duration-150 hover-fine:before:bg-hover focus-visible:before:ring-2 focus-visible:before:ring-brand/40"
          >
            <span
              className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px]"
              style={{ background: stat.tint }}
            >
              <Image src={`/icons/${stat.icon}.svg`} alt="" width={20} height={20} unoptimized />
            </span>
            <span className="relative flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
              <span className="t-16 w-full text-fg">{stat.value}</span>
              <span className="t-14 salt w-full text-fg-2">{stat.caption}</span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
