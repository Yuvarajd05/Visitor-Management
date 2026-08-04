"use client";

import { KeyRound, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";

import type { UserListItem } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserRowActionsProps {
  user: UserListItem;
  onResetPassword: (user: UserListItem) => void;
}

export function UserRowActions({
  user,
  onResetPassword,
}: UserRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Open actions" />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem render={<Link href={`/users/${user.id}/edit`} />}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!user.isActive}
          onClick={() => onResetPassword(user)}
        >
          <KeyRound className="size-4" />
          Reset password
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
