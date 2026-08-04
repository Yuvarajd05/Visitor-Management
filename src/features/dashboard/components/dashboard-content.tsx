"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  LogOut,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

const RANGE_OPTIONS: Array<{ value: DashboardRangePreset; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "thismonth", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#94a3b8",
];

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
        {
          title: "Employees",
          value: data.stats.totalEmployees,
          description: "Total employee records",
          icon: UsersRound,
        },
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Overview
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
            <SelectTrigger className="w-full sm:w-[180px]">
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
                className="w-full sm:w-[150px]"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full sm:w-[150px]"
              />
            </>
          ) : null}

          <Link href="/visitors/new">
            <Button className="w-full bg-secondary hover:bg-secondary/90 sm:w-auto">
              <UserPlus className="size-4" />
              Register Visitor
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Card key={index} className="border-border/80 shadow-sm">
              <CardHeader>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-3 h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.title} className="border-border/80 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardDescription>{stat.title}</CardDescription>
                    <CardTitle className="mt-2 text-3xl font-semibold">
                      {stat.value}
                    </CardTitle>
                  </div>
                  <div className="rounded-lg bg-accent/15 p-2 text-accent-foreground">
                    <Icon className="size-5 text-secondary" />
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

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Visitors by Day</CardTitle>
            <CardDescription>Check-ins across the selected period</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {data?.visitorsByDay.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.visitorsByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No visitor check-ins in this range." />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Last 6 months of visitor check-ins</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {data?.monthlyTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No monthly trend data yet." />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Purpose Distribution</CardTitle>
            <CardDescription>Why visitors are coming in</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {data?.purposeDistribution.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.purposeDistribution}
                    dataKey="count"
                    nameKey="purpose"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(props) => String(props.name ?? "")}
                  >
                    {data.purposeDistribution.map((entry, index) => (
                      <Cell
                        key={entry.purpose}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No purpose data for this range." />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Top Hosts</CardTitle>
            <CardDescription>People visitors meet most often</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {data?.topHosts.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topHosts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No host data for this range." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/80 shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/visitors/new">
              <Button variant="outline" className="w-full justify-start">
                Register visitor
              </Button>
            </Link>
            <Link href="/visitors">
              <Button variant="outline" className="w-full justify-start">
                View all visitors
              </Button>
            </Link>
            <Link href="/employees">
              <Button variant="outline" className="w-full justify-start">
                Manage employees
              </Button>
            </Link>
            <Link href="/users">
              <Button variant="outline" className="w-full justify-start">
                Manage users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm xl:col-span-1">
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
                  className="block rounded-lg border border-border/70 p-3 transition-colors hover:bg-muted/40"
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

        <Card className="border-border/80 shadow-sm xl:col-span-1">
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
                  className="block rounded-lg border border-border/70 p-3 transition-colors hover:bg-muted/40"
                >
                  <p className="font-medium">{visitor.fullName}</p>
                  <p className="text-xs text-muted-foreground">
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

      <Card className="border-border/80 shadow-sm">
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
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{item.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.visitorCode}
                    </p>
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

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
