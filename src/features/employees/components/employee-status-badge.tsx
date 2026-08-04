import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EmployeeStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function EmployeeStatusBadge({
  isActive,
  className,
}: EmployeeStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        isActive
          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
          : "border-slate-200 bg-slate-100 text-slate-700",
        className,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
