import Link from "next/link";
import { Building2, LogOut, UserPlus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    title: "Today's Visitors",
    value: "0",
    description: "Visitors registered today",
    icon: Users,
  },
  {
    title: "Visitors Inside",
    value: "0",
    description: "Currently on premises",
    icon: Building2,
  },
  {
    title: "Checked Out",
    value: "0",
    description: "Completed visits today",
    icon: LogOut,
  },
] as const;

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
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
        <Link href="/visitors/new">
          <Button className="bg-secondary hover:bg-secondary/90">
            <UserPlus className="size-4" />
            Register Visitor
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
