import { Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EmployeeEmptyStateProps {
  hasFilters?: boolean;
}

export function EmployeeEmptyState({
  hasFilters = false,
}: EmployeeEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <CardTitle>
          {hasFilters ? "No employees match your search" : "No employees yet"}
        </CardTitle>
        <CardDescription>
          {hasFilters
            ? "Try adjusting your search or filter criteria."
            : "Add the first employee to build your host directory."}
        </CardDescription>
      </CardHeader>
      {!hasFilters ? (
        <CardContent className="flex justify-center pb-6">
          <Link href="/employees/new">
            <Button className="bg-secondary hover:bg-secondary/90">
              Add Employee
            </Button>
          </Link>
        </CardContent>
      ) : null}
    </Card>
  );
}
