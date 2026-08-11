"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  LogOut,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import type { DashboardData, DashboardRangePreset } from "@/types/dashboard";
import { fetchDashboard } from "@/features/dashboard/lib/dashboard-api";
import { formatDateTime } from "@/lib/date";
import { VisitorStatusBadge } from "@/features/visitors/components/visitor-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

const DashboardCharts = dynamic(
  () =>
    import("@/features/dashboard/components/dashboard-charts").then(
      (mod) => mod.DashboardCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border/70 bg-white/90 shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-3 w-56" />
            </CardHeader>
            <div className="px-6 pb-6">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    ),
  },
);

const RANGE_OPTIONS: Array<{ value: DashboardRangePreset; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "thismonth", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

const STAT_TONES = [
  "bg-blue-50 text-blue-700 ring-blue-100",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-slate-100 text-slate-700 ring-slate-200",
  "bg-sky-50 text-sky-700 ring-sky-100",
  "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "bg-cyan-50 text-cyan-700 ring-cyan-100",
  "bg-blue-50 text-blue-700 ring-blue-100",
] as const;

function formatTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function DashboardContent() {
  const [range, setRange] = useState<DashboardRangePreset>("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (range === "custom" && (!startDate || !endDate)) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await fetchDashboard({
        range,
        startDate: range === "custom" ? startDate : undefined,
        endDate: range === "custom" ? endDate : undefined,
      });
      setData(result);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [endDate, range, startDate]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = data
    ? [
        {
          title: "Today's Visitors",
          value: data.stats.visitorsToday,
          description: "Registered today",
          icon: Users,
        },
        {
          title: "Inside Now",
          value: data.stats.visitorsInside,
          description: "Currently on premises",
          icon: Building2,
        },
        {
          title: "Checked Out Today",
          value: data.stats.checkedOutToday,
          description: "Completed visits today",
          icon: LogOut,
        },
        // Employees module hidden — Person to Meet is a hardcoded list for the pass.
        // {
        //   title: "Employees",
        //   value: data.stats.totalEmployees,
        //   description: "Total employee records",
        //   icon: UsersRound,
        // },
        {
          title: "Active Users",
          value: data.stats.activeUsers,
          description: "System accounts active",
          icon: UserCheck,
        },
        {
          title: "This Week",
          value: data.stats.visitorsThisWeek,
          description: "Check-ins last 7 days",
          icon: CalendarDays,
        },
        {
          title: "This Month",
          value: data.stats.visitorsThisMonth,
          description: "Check-ins this month",
          icon: CalendarDays,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="relative px-5 py-6 md:px-7 md:py-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_40%),linear-gradient(135deg,#0f172a_0%,#1e3a8a_52%,#2563eb_100%)]"
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="text-white">
              <p className="text-xs font-medium tracking-[0.14em] text-blue-100 uppercase">
                Overview
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1.5 max-w-xl text-sm text-blue-100/90">
                Monitor visitor activity and launch quick actions from one place.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={range}
                onValueChange={(value) => {
                  if (value) {
                    setRange(value as DashboardRangePreset);
                  }
                }}
              >
                <SelectTrigger className="w-full border-white/20 bg-white/95 sm:w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {range === "custom" ? (
                <>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full border-white/20 bg-white/95 sm:w-[150px]"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full border-white/20 bg-white/95 sm:w-[150px]"
                  />
                </>
              ) : null}

              <Link href="/visitors/new">
                <Button className="w-full bg-white text-slate-900 hover:bg-blue-50 sm:w-auto">
                  <UserPlus className="size-4" />
                  Register Visitor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Card
              key={index}
              className="border-border/70 bg-white/90 shadow-sm"
            >
              <CardHeader>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-3 h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.title}
                className="border-border/70 bg-white/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardDescription className="font-medium">
                      {stat.title}
                    </CardDescription>
                    <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">
                      {stat.value}
                    </CardTitle>
                  </div>
                  <div
                    className={cn(
                      "rounded-xl p-2.5 ring-1",
                      STAT_TONES[index % STAT_TONES.length],
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DashboardCharts data={data} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 bg-white/90 shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/visitors/new">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-blue-100 bg-blue-50/50 text-blue-900 hover:bg-blue-50"
              >
                <UserPlus className="size-4 text-secondary" />
                Register visitor
              </Button>
            </Link>
            <Link href="/visitors">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ClipboardList className="size-4 text-secondary" />
                View all visitors
              </Button>
            </Link>
            {/* Employees module hidden — Person to Meet is hardcoded for the print pass.
            <Link href="/employees">
              <Button variant="outline" className="w-full justify-start gap-2">
                <UsersRound className="size-4 text-secondary" />
                Manage employees
              </Button>
            </Link>
            */}
            <Link href="/users">
              <Button variant="outline" className="w-full justify-start gap-2">
                <UserCheck className="size-4 text-secondary" />
                Manage users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/90 shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
            <CardDescription>Latest arrivals in this range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.recentCheckIns.length ? (
              data.recentCheckIns.map((visitor) => (
                <Link
                  key={visitor.id}
                  href={`/visitors/${visitor.id}`}
                  className="block rounded-xl border border-border/70 bg-slate-50/50 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{visitor.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {visitor.visitorCode} · {visitor.personToMeet}
                      </p>
                    </div>
                    <VisitorStatusBadge status={visitor.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(visitor.checkInTime)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent check-ins.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-white/90 shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle>Currently Inside</CardTitle>
            <CardDescription>Visitors still on premises</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.currentlyInside.length ? (
              data.currentlyInside.map((visitor) => (
                <Link
                  key={visitor.id}
                  href={`/visitors/${visitor.id}`}
                  className="block rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <p className="font-medium">{visitor.fullName}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Meeting {visitor.personToMeet}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    In since {formatDateTime(visitor.checkInTime)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nobody is checked in right now.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Today&apos;s Timeline</CardTitle>
          <CardDescription>Check-ins and check-outs from today</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.todayTimeline.length ? (
            <div className="space-y-3">
              {data.todayTimeline.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-slate-50/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        item.type === "CHECK_IN"
                          ? "bg-emerald-500"
                          : "bg-slate-400",
                      )}
                    />
                    <div>
                      <p className="font-medium">{item.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.visitorCode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        item.type === "CHECK_IN"
                          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }
                    >
                      {item.type === "CHECK_IN" ? "Check-in" : "Check-out"}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTime(item.at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No activity recorded today yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
