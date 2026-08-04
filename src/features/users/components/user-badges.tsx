import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function UserRoleBadge({
  role,
  className,
}: {
  role: "ADMIN" | "SECURITY";
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        role === "ADMIN"
          ? "border-sky-200 bg-sky-100 text-sky-800"
          : "border-slate-200 bg-slate-100 text-slate-700",
        className,
      )}
    >
      {role === "ADMIN" ? "Admin" : "Security"}
    </Badge>
  );
}

export function UserStatusBadge({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
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
