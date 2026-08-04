"use client";

import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

import type { VisitorListItem } from "@/types/visitor";
import { formatDateTime } from "@/lib/date";
import { VisitorRowActions } from "@/features/visitors/components/visitor-row-actions";
import { VisitorStatusBadge } from "@/features/visitors/components/visitor-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortableColumn = "checkInTime" | "fullName" | "visitorCode";

interface VisitorTableProps {
  visitors: VisitorListItem[];
  sortBy: SortableColumn;
  sortOrder: "asc" | "desc";
  onSortChange: (column: SortableColumn) => void;
  onCheckout: (visitor: VisitorListItem) => void;
  onDelete: (visitor: VisitorListItem) => void;
  checkingOutId?: string | null;
}

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSortChange,
  className,
}: {
  label: string;
  column: SortableColumn;
  sortBy: SortableColumn;
  sortOrder: "asc" | "desc";
  onSortChange: (column: SortableColumn) => void;
  className?: string;
}) {
  const isActive = sortBy === column;

  return (
    <TableHead className={className}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "-ml-2 h-8 font-medium",
          isActive && "text-secondary",
        )}
        onClick={() => onSortChange(column)}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "size-3.5",
            isActive ? "opacity-100" : "opacity-40",
            isActive && sortOrder === "asc" && "rotate-180",
          )}
        />
      </Button>
    </TableHead>
  );
}

export function VisitorTable({
  visitors,
  sortBy,
  sortOrder,
  onSortChange,
  onCheckout,
  onDelete,
  checkingOutId,
}: VisitorTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              label="Code"
              column="visitorCode"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <SortableHeader
              label="Name"
              column="fullName"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="hidden lg:table-cell">Company</TableHead>
            <TableHead className="hidden xl:table-cell">Person To Meet</TableHead>
            <TableHead className="hidden xl:table-cell">Purpose</TableHead>
            <SortableHeader
              label="Check-In"
              column="checkInTime"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
              className="hidden lg:table-cell"
            />
            <TableHead className="hidden lg:table-cell">Check-Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.map((visitor) => (
            <TableRow key={visitor.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/visitors/${visitor.id}`}
                  className="text-secondary hover:underline"
                >
                  {visitor.visitorCode}
                </Link>
              </TableCell>
              <TableCell>{visitor.fullName}</TableCell>
              <TableCell className="hidden md:table-cell">{visitor.phone}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {visitor.company || "—"}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {visitor.personToMeet}
              </TableCell>
              <TableCell className="hidden max-w-48 truncate xl:table-cell">
                {visitor.purpose}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {formatDateTime(visitor.checkInTime)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {formatDateTime(visitor.checkOutTime)}
              </TableCell>
              <TableCell>
                <VisitorStatusBadge status={visitor.status} />
              </TableCell>
              <TableCell className="text-right">
                <VisitorRowActions
                  visitor={visitor}
                  onCheckout={onCheckout}
                  onDelete={onDelete}
                  isCheckingOut={checkingOutId === visitor.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
