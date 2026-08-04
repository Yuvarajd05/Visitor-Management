import type { DashboardRangePreset } from "@/types/dashboard";

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function resolveDashboardRange(
  preset: DashboardRangePreset,
  customStart?: string,
  customEnd?: string,
  now: Date = new Date(),
): { start: Date; end: Date; preset: DashboardRangePreset } {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "yesterday": {
      const yesterday = addDays(todayStart, -1);
      return {
        preset,
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      };
    }
    case "last7days":
      return {
        preset,
        start: startOfDay(addDays(todayStart, -6)),
        end: todayEnd,
      };
    case "thismonth":
      return {
        preset,
        start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
        end: todayEnd,
      };
    case "custom": {
      const start = customStart ? startOfDay(new Date(customStart)) : todayStart;
      const end = customEnd ? endOfDay(new Date(customEnd)) : todayEnd;
      return { preset, start, end };
    }
    case "today":
    default:
      return { preset: "today", start: todayStart, end: todayEnd };
  }
}

export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
