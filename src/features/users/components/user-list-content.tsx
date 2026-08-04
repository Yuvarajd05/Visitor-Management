"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import type { UserListItem } from "@/types/user";
import { UserPagination } from "@/features/users/components/user-pagination";
import { UserResetPasswordDialog } from "@/features/users/components/user-reset-password-dialog";
import { UserTable } from "@/features/users/components/user-table";
import { fetchUsers } from "@/features/users/lib/user-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/server/utils/errors";

type RoleFilter = "ALL" | "ADMIN" | "SECURITY";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type SortableColumn = "name" | "email" | "role" | "createdAt";

export function UserListContent() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortableColumn>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<UserListItem | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchUsers({
        search: debouncedSearch || undefined,
        role,
        status,
        page,
        pageSize,
        sortBy,
        sortOrder,
      });
      setUsers(result.users);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize, role, sortBy, sortOrder, status]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function handleSortChange(column: SortableColumn) {
    if (sortBy === column) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  }

  const hasFilters =
    Boolean(debouncedSearch) || role !== "ALL" || status !== "ALL";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Users
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create staff accounts and reset passwords without email.
          </p>
        </div>
        <Link href="/users/new">
          <Button className="w-full bg-secondary hover:bg-secondary/90 md:w-auto">
            <UserPlus className="size-4" />
            Add User
          </Button>
        </Link>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email..."
              className="pl-9"
            />
          </div>
          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value as RoleFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SECURITY">Security</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : users.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <CardTitle>
              {hasFilters ? "No users match your search" : "No users yet"}
            </CardTitle>
            <CardDescription>
              {hasFilters
                ? "Try adjusting your filters."
                : "Add the first staff account to get started."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <UserTable
            users={users}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onResetPassword={setResetTarget}
          />
          <UserPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      <UserResetPasswordDialog
        open={Boolean(resetTarget)}
        userId={resetTarget?.id}
        userName={resetTarget?.name}
        onOpenChange={(open) => {
          if (!open) {
            setResetTarget(null);
            void loadUsers();
          }
        }}
      />
    </div>
  );
}
