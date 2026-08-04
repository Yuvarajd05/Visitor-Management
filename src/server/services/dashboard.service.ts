import { prisma } from "@/server/prisma/client";
import type { DashboardData, DashboardRecentVisitor } from "@/types/dashboard";
import {
  addDays,
  eachDay,
  endOfDay,
  formatDayLabel,
  formatMonthLabel,
  resolveDashboardRange,
  startOfDay,
  toDateKey,
  toMonthKey,
} from "@/server/utils/dashboard-dates";
import type { DashboardQueryValues } from "@/server/validation/dashboard";

function mapRecent(visitor: {
  id: string;
  visitorCode: string;
  fullName: string;
  company: string | null;
  personToMeet: string;
  purpose: string;
  checkInTime: Date;
  status: "CHECKED_IN" | "CHECKED_OUT";
}): DashboardRecentVisitor {
  return {
    id: visitor.id,
    visitorCode: visitor.visitorCode,
    fullName: visitor.fullName,
    company: visitor.company,
    personToMeet: visitor.personToMeet,
    purpose: visitor.purpose,
    checkInTime: visitor.checkInTime,
    status: visitor.status,
  };
}

function buildVisitorsByDay(
  visitors: Array<{ checkInTime: Date }>,
  start: Date,
  end: Date,
) {
  const days = eachDay(start, end);
  const counts = new Map<string, number>();

  for (const visitor of visitors) {
    const key = toDateKey(new Date(visitor.checkInTime));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return days.map((day) => {
    const key = toDateKey(day);
    return {
      date: key,
      label: formatDayLabel(day),
      count: counts.get(key) ?? 0,
    };
  });
}

function buildMonthlyTrend(
  visitors: Array<{ checkInTime: Date }>,
  now: Date,
) {
  const months: Date[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }

  const counts = new Map<string, number>();
  for (const visitor of visitors) {
    const key = toMonthKey(new Date(visitor.checkInTime));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return months.map((month) => {
    const key = toMonthKey(month);
    return {
      month: key,
      label: formatMonthLabel(month),
      count: counts.get(key) ?? 0,
    };
  });
}

function buildPurposeDistribution(visitors: Array<{ purpose: string }>) {
  const counts = new Map<string, number>();
  for (const visitor of visitors) {
    const purpose = visitor.purpose.trim() || "Other";
    counts.set(purpose, (counts.get(purpose) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([purpose, count]) => ({ purpose, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function buildTopHosts(visitors: Array<{ personToMeet: string }>) {
  const counts = new Map<string, number>();
  for (const visitor of visitors) {
    const name = visitor.personToMeet.trim() || "Unknown";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export async function getDashboardData(
  query: DashboardQueryValues,
): Promise<DashboardData> {
  const now = new Date();
  const range = resolveDashboardRange(
    query.range,
    query.startDate,
    query.endDate,
    now,
  );

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfDay(addDays(todayStart, -6));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const chartStart =
    range.preset === "custom" || range.preset === "thismonth"
      ? range.start
      : weekStart;

  const [
    visitorsToday,
    visitorsInside,
    checkedOutToday,
    totalEmployees,
    activeUsers,
    visitorsThisWeek,
    visitorsThisMonth,
    chartVisitors,
    monthVisitors,
    recentCheckIns,
    currentlyInside,
    todayVisitors,
  ] = await Promise.all([
    prisma.visitor.count({
      where: { checkInTime: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.visitor.count({ where: { status: "CHECKED_IN" } }),
    prisma.visitor.count({
      where: {
        status: "CHECKED_OUT",
        checkOutTime: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.employee.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.visitor.count({
      where: { checkInTime: { gte: weekStart, lte: todayEnd } },
    }),
    prisma.visitor.count({
      where: { checkInTime: { gte: monthStart, lte: todayEnd } },
    }),
    prisma.visitor.findMany({
      where: { checkInTime: { gte: chartStart, lte: range.end } },
      select: { checkInTime: true, purpose: true, personToMeet: true },
    }),
    prisma.visitor.findMany({
      where: {
        checkInTime: {
          gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          lte: endOfDay(now),
        },
      },
      select: { checkInTime: true },
    }),
    prisma.visitor.findMany({
      where: { checkInTime: { gte: range.start, lte: range.end } },
      select: {
        id: true,
        visitorCode: true,
        fullName: true,
        company: true,
        personToMeet: true,
        purpose: true,
        checkInTime: true,
        status: true,
      },
      orderBy: { checkInTime: "desc" },
      take: 8,
    }),
    prisma.visitor.findMany({
      where: { status: "CHECKED_IN" },
      select: {
        id: true,
        visitorCode: true,
        fullName: true,
        company: true,
        personToMeet: true,
        purpose: true,
        checkInTime: true,
        status: true,
      },
      orderBy: { checkInTime: "desc" },
      take: 8,
    }),
    prisma.visitor.findMany({
      where: {
        OR: [
          { checkInTime: { gte: todayStart, lte: todayEnd } },
          { checkOutTime: { gte: todayStart, lte: todayEnd } },
        ],
      },
      select: {
        id: true,
        visitorCode: true,
        fullName: true,
        checkInTime: true,
        checkOutTime: true,
      },
      orderBy: { checkInTime: "desc" },
      take: 20,
    }),
  ]);

  const visitorsByDay = buildVisitorsByDay(chartVisitors, chartStart, range.end);
  const monthlyTrend = buildMonthlyTrend(monthVisitors, now);
  const purposeDistribution = buildPurposeDistribution(chartVisitors);
  const topHosts = buildTopHosts(chartVisitors);

  const todayTimeline = todayVisitors
    .flatMap((visitor) => {
      const items: Array<{
        id: string;
        visitorCode: string;
        fullName: string;
        type: "CHECK_IN" | "CHECK_OUT";
        at: Date;
      }> = [
        {
          id: `${visitor.id}-in`,
          visitorCode: visitor.visitorCode,
          fullName: visitor.fullName,
          type: "CHECK_IN",
          at: visitor.checkInTime,
        },
      ];
      if (visitor.checkOutTime) {
        items.push({
          id: `${visitor.id}-out`,
          visitorCode: visitor.visitorCode,
          fullName: visitor.fullName,
          type: "CHECK_OUT",
          at: visitor.checkOutTime,
        });
      }
      return items;
    })
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 12);

  return {
    range: {
      preset: range.preset,
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    },
    stats: {
      visitorsToday,
      visitorsInside,
      checkedOutToday,
      totalEmployees,
      activeUsers,
      visitorsThisWeek,
      visitorsThisMonth,
    },
    visitorsByDay,
    monthlyTrend,
    purposeDistribution,
    topHosts,
    recentCheckIns: recentCheckIns.map(mapRecent),
    currentlyInside: currentlyInside.map(mapRecent),
    todayTimeline,
  };
}
