"use client";

import Link from "next/link";
import {
  Eye,
  LogOut,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { VisitorListItem } from "@/types/visitor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VisitorRowActionsProps {
  visitor: VisitorListItem;
  onCheckout: (visitor: VisitorListItem) => void;
  onDelete: (visitor: VisitorListItem) => void;
  isCheckingOut?: boolean;
}

export function VisitorRowActions({
  visitor,
  onCheckout,
  onDelete,
  isCheckingOut = false,
}: VisitorRowActionsProps) {
  const isCheckedOut = visitor.status === "CHECKED_OUT";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Open actions" />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem render={<Link href={`/visitors/${visitor.id}`} />}>
          <Eye className="size-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/visitors/${visitor.id}/edit`} />}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isCheckedOut || isCheckingOut}
          onClick={() => onCheckout(visitor)}
        >
          <LogOut className="size-4" />
          {isCheckingOut ? "Checking out..." : "Check Out"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(visitor)}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
