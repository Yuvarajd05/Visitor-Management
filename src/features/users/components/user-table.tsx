"use client";

import { ArrowUpDown } from "lucide-react";

import type { UserListItem } from "@/types/user";
import {
  UserRoleBadge,
  UserStatusBadge,
} from "@/features/users/components/user-badges";
import { UserRowActions } from "@/features/users/components/user-row-actions";
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

type SortableColumn = "name" | "email" | "role" | "createdAt";

interface UserTableProps {
  users: UserListItem[];
  sortBy: SortableColumn;
  sortOrder: "asc" | "desc";
  onSortChange: (column: SortableColumn) => void;
  onResetPassword: (user: UserListItem) => void;
}

export function UserTable({
  users,
  sortBy,
  sortOrder,
  onSortChange,
  onResetPassword,
}: UserTableProps) {
  function SortableHeader({
    label,
    column,
    className,
  }: {
    label: string;
    column: SortableColumn;
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

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader label="Name" column="name" />
            <SortableHeader label="Email" column="email" className="hidden md:table-cell" />
            <SortableHeader label="Role" column="role" />
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Must change password</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="hidden md:table-cell">{user.email}</TableCell>
              <TableCell>
                <UserRoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <UserStatusBadge isActive={user.isActive} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {user.mustChangePassword ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-right">
                <UserRowActions user={user} onResetPassword={onResetPassword} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
