"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { AuditLogRecord, ErrorLogRecord } from "@/types/system";
import {
  fetchAuditLogs,
  fetchErrorLogs,
} from "@/features/settings/lib/system-api";
import { formatDateTime } from "@/lib/date";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/server/utils/errors";

type Tab = "activity" | "errors";

export function AuditContent() {
  const [tab, setTab] = useState<Tab>("activity");
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLogRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      if (tab === "activity") {
        const result = await fetchAuditLogs({
          search: search.trim() || undefined,
          entityType: entityType === "ALL" ? undefined : entityType,
          page,
          pageSize: 20,
        });
        setAuditLogs(result.logs);
        setTotalPages(result.totalPages);
      } else {
        const result = await fetchErrorLogs({
          search: search.trim() || undefined,
          page,
          pageSize: 20,
        });
        setErrorLogs(result.logs);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [entityType, page, search, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">
          Admin
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Audit & Errors
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Activity history and system error logging for production monitoring.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === "activity" ? "default" : "outline"}
          onClick={() => {
            setTab("activity");
            setPage(1);
          }}
        >
          Activity History
        </Button>
        <Button
          type="button"
          variant={tab === "errors" ? "default" : "outline"}
          onClick={() => {
            setTab("errors");
            setPage(1);
          }}
        >
          Error Logs
        </Button>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>
            {tab === "activity" ? "Activity History" : "Error Logs"}
          </CardTitle>
          <CardDescription>
            {tab === "activity"
              ? "Track logins, visitor changes, settings, and backups."
              : "Unhandled API failures captured for troubleshooting."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              placeholder="Search…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            {tab === "activity" ? (
              <Select
                value={entityType}
                onValueChange={(value) => {
                  if (value) {
                    setEntityType(value);
                    setPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All entities</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="VISITOR">Visitor</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : tab === "activity" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length ? (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.summary}</TableCell>
                      <TableCell>{log.actorEmail || "—"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No activity yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorLogs.length ? (
                  errorLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>{log.statusCode ?? "—"}</TableCell>
                      <TableCell>{log.path || "—"}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No errors logged.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
