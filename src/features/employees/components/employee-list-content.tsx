"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import type { EmployeeListItem } from "@/types/employee";
import { EmployeeDeleteDialog } from "@/features/employees/components/employee-delete-dialog";
import { EmployeeEmptyState } from "@/features/employees/components/employee-empty-state";
import { EmployeePagination } from "@/features/employees/components/employee-pagination";
import { EmployeeTable } from "@/features/employees/components/employee-table";
import { EmployeeTableSkeleton } from "@/features/employees/components/employee-table-skeleton";
import {
  deleteEmployee,
  fetchEmployees,
} from "@/features/employees/lib/employee-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/server/utils/errors";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type SortableColumn = "fullName" | "employeeCode" | "department" | "createdAt";

export function EmployeeListContent() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortableColumn>("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeListItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchEmployees({
        search: debouncedSearch || undefined,
        status,
        page,
        pageSize,
        sortBy,
        sortOrder,
      });

      setEmployees(result.employees);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize, sortBy, sortOrder, status]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  function handleSortChange(column: SortableColumn) {
    if (sortBy === column) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteEmployee(deleteTarget.id);
      toast.success("Employee deleted successfully.");
      setDeleteTarget(null);
      await loadEmployees();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  const hasFilters = Boolean(debouncedSearch) || status !== "ALL";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Employees
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Employee Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Maintain the employee directory used as visitor hosts.
          </p>
        </div>
        <Link href="/employees/new">
          <Button className="w-full bg-secondary hover:bg-secondary/90 md:w-auto">
            <UserPlus className="size-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by code, name, phone, or department..."
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <EmployeeTableSkeleton />
      ) : employees.length === 0 ? (
        <EmployeeEmptyState hasFilters={hasFilters} />
      ) : (
        <>
          <EmployeeTable
            employees={employees}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onDelete={setDeleteTarget}
          />
          <EmployeePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      <EmployeeDeleteDialog
        open={Boolean(deleteTarget)}
        employeeName={deleteTarget?.fullName}
        employeeCode={deleteTarget?.employeeCode}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
