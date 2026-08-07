import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/80 p-6 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border/70 bg-white/90 shadow-sm">
            <CardHeader>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-36" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
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
    </div>
  );
}
