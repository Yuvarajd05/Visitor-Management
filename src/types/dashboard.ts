export type DashboardRangePreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "thismonth"
  | "custom";

export interface DashboardStats {
  visitorsToday: number;
  visitorsInside: number;
  checkedOutToday: number;
  totalEmployees: number;
  activeUsers: number;
  visitorsThisWeek: number;
  visitorsThisMonth: number;
}

export interface DayCountPoint {
  date: string;
  label: string;
  count: number;
}

export interface MonthCountPoint {
  month: string;
  label: string;
  count: number;
}

export interface PurposeCountPoint {
  purpose: string;
  count: number;
}

export interface HostCountPoint {
  name: string;
  count: number;
}

export interface DashboardRecentVisitor {
  id: string;
  visitorCode: string;
  fullName: string;
  company: string | null;
  personToMeet: string;
  purpose: string;
  checkInTime: Date;
  status: "CHECKED_IN" | "CHECKED_OUT";
}

export interface DashboardActivityItem {
  id: string;
  visitorCode: string;
  fullName: string;
  type: "CHECK_IN" | "CHECK_OUT";
  at: Date;
}

export interface DashboardData {
  range: {
    preset: DashboardRangePreset;
    start: string;
    end: string;
  };
  stats: DashboardStats;
  visitorsByDay: DayCountPoint[];
  monthlyTrend: MonthCountPoint[];
  purposeDistribution: PurposeCountPoint[];
  topHosts: HostCountPoint[];
  recentCheckIns: DashboardRecentVisitor[];
  currentlyInside: DashboardRecentVisitor[];
  todayTimeline: DashboardActivityItem[];
}
