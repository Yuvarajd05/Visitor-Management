"use client";

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

import type { DashboardData } from "@/types/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#94a3b8",
];

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/80 bg-slate-50/50 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

interface DashboardChartsProps {
  data: DashboardData | null;
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-border/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Visitors by Day</CardTitle>
          <CardDescription>Check-ins across the selected period</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {data?.visitorsByDay.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.visitorsByDay}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No visitor check-ins in this range." />
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Last 6 months of visitor check-ins</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {data?.monthlyTrend.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--chart-1)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No monthly trend data yet." />
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-white/90 shadow-sm">
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
                  innerRadius={48}
                  outerRadius={90}
                  paddingAngle={2}
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

      <Card className="border-border/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Top Hosts</CardTitle>
          <CardDescription>People visitors meet most often</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {data?.topHosts.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topHosts} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />
                <XAxis type="number" allowDecimals={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="var(--chart-2)"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No host data for this range." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
