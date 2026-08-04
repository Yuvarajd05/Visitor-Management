"use client";

import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

import type { EmployeeListItem } from "@/types/employee";
import { EmployeeRowActions } from "@/features/employees/components/employee-row-actions";
import { EmployeeStatusBadge } from "@/features/employees/components/employee-status-badge";
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

type SortableColumn = "fullName" | "employeeCode" | "department" | "createdAt";

interface EmployeeTableProps {
  employees: EmployeeListItem[];
  sortBy: SortableColumn;
  sortOrder: "asc" | "desc";
  onSortChange: (column: SortableColumn) => void;
  onDelete: (employee: EmployeeListItem) => void;
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
        className={cn("-ml-2 h-8 font-medium", isActive && "text-secondary")}
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

export function EmployeeTable({
  employees,
  sortBy,
  sortOrder,
  onSortChange,
  onDelete,
}: EmployeeTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              label="Code"
              column="employeeCode"
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
            <SortableHeader
              label="Department"
              column="department"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
              className="hidden lg:table-cell"
            />
            <TableHead className="hidden xl:table-cell">Designation</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/employees/${employee.id}`}
                  className="text-secondary hover:underline"
                >
                  {employee.employeeCode}
                </Link>
              </TableCell>
              <TableCell>{employee.fullName}</TableCell>
              <TableCell className="hidden md:table-cell">
                {employee.phone}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {employee.department}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {employee.designation}
              </TableCell>
              <TableCell>
                <EmployeeStatusBadge isActive={employee.isActive} />
              </TableCell>
              <TableCell className="text-right">
                <EmployeeRowActions employee={employee} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
