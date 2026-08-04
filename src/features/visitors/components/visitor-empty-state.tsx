import { UserPlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VisitorEmptyStateProps {
  hasFilters?: boolean;
}

export function VisitorEmptyState({ hasFilters = false }: VisitorEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
          <UserPlus className="size-6 text-muted-foreground" />
        </div>
        <CardTitle>
          {hasFilters ? "No visitors match your search" : "No visitors yet"}
        </CardTitle>
        <CardDescription>
          {hasFilters
            ? "Try adjusting your search or filter criteria."
            : "Register the first visitor to start tracking check-ins."}
        </CardDescription>
      </CardHeader>
      {!hasFilters ? (
        <CardContent className="flex justify-center pb-6">
          <Link href="/visitors/new">
            <Button className="bg-secondary hover:bg-secondary/90">
              Register Visitor
            </Button>
          </Link>
        </CardContent>
      ) : null}
    </Card>
  );
}
