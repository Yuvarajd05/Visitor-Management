"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import type { VisitorListItem } from "@/types/visitor";
import { VisitorDeleteDialog } from "@/features/visitors/components/visitor-delete-dialog";
import { VisitorEmptyState } from "@/features/visitors/components/visitor-empty-state";
import { VisitorPagination } from "@/features/visitors/components/visitor-pagination";
import { VisitorTable } from "@/features/visitors/components/visitor-table";
import { VisitorTableSkeleton } from "@/features/visitors/components/visitor-table-skeleton";
import {
  checkoutVisitor,
  deleteVisitor,
  fetchVisitors,
} from "@/features/visitors/lib/visitor-api";
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

type StatusFilter = "ALL" | "CHECKED_IN" | "CHECKED_OUT";
type SortableColumn = "checkInTime" | "fullName" | "visitorCode";

interface VisitorListContentProps {
  initialStatus?: StatusFilter;
}

export function VisitorListContent({
  initialStatus = "ALL",
}: VisitorListContentProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortableColumn>("checkInTime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [visitors, setVisitors] = useState<VisitorListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VisitorListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setStatus(initialStatus);
    setPage(1);
  }, [initialStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const loadVisitors = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchVisitors({
        search: debouncedSearch || undefined,
        status,
        page,
        pageSize,
        sortBy,
        sortOrder,
      });

      setVisitors(result.visitors);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize, sortBy, sortOrder, status]);

  useEffect(() => {
    void loadVisitors();
  }, [loadVisitors]);

  function handleSortChange(column: SortableColumn) {
    if (sortBy === column) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  }

  async function handleCheckout(visitor: VisitorListItem) {
    try {
      setCheckingOutId(visitor.id);
      await checkoutVisitor(visitor.id);
      toast.success(`${visitor.fullName} checked out successfully.`);
      await loadVisitors();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCheckingOutId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteVisitor(deleteTarget.id);
      toast.success("Visitor deleted successfully.");
      setDeleteTarget(null);
      await loadVisitors();
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
            Visitors
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Visitor Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register, search, and manage visitor records.
          </p>
        </div>
        <Link href="/visitors/new">
          <Button className="w-full bg-secondary hover:bg-secondary/90 md:w-auto">
            <UserPlus className="size-4" />
            Register Visitor
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
              placeholder="Search by code, name, or phone..."
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
              <SelectItem value="CHECKED_IN">Checked In</SelectItem>
              <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <VisitorTableSkeleton />
      ) : visitors.length === 0 ? (
        <VisitorEmptyState hasFilters={hasFilters} />
      ) : (
        <>
          <VisitorTable
            visitors={visitors}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onCheckout={handleCheckout}
            onDelete={setDeleteTarget}
            checkingOutId={checkingOutId}
          />
          <VisitorPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      <VisitorDeleteDialog
        open={Boolean(deleteTarget)}
        visitorName={deleteTarget?.fullName}
        visitorCode={deleteTarget?.visitorCode}
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
