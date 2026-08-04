import type { VisitorStatus } from "@/server/prisma/generated/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VisitorStatusBadgeProps {
  status: VisitorStatus;
  className?: string;
}

const statusConfig: Record<
  VisitorStatus,
  { label: string; className: string }
> = {
  CHECKED_IN: {
    label: "Checked In",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  CHECKED_OUT: {
    label: "Checked Out",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export function VisitorStatusBadge({
  status,
  className,
}: VisitorStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
