"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileBarChart, Printer } from "lucide-react";
import { toast } from "sonner";

import type { ReportResult, ReportType } from "@/types/report";
import {
  buildReportFilename,
  exportReportToExcel,
} from "@/features/reports/lib/export-excel";
import { fetchReport } from "@/features/reports/lib/report-api";
import { formatDateTime } from "@/lib/date";
import { VisitorStatusBadge } from "@/features/visitors/components/visitor-status-badge";
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

const REPORT_OPTIONS: Array<{ value: ReportType; label: string; hint: string }> = [
  {
    value: "daterange",
    label: "Date Range",
    hint: "Visitors who checked in within a selected period",
  },
  {
    value: "inside",
    label: "Currently Inside",
    hint: "Visitors still on premises right now",
  },
  {
    value: "purpose",
    label: "Purpose-wise",
    hint: "Grouped summary by visit purpose for a date range",
  },
];

function todayInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ReportsContent() {
  const [type, setType] = useState<ReportType>("daterange");
  const [startDate, setStartDate] = useState(todayInputValue);
  const [endDate, setEndDate] = useState(todayInputValue);
  const [status, setStatus] = useState<"ALL" | "CHECKED_IN" | "CHECKED_OUT">(
    "ALL",
  );
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState<ReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const needsDates = type !== "inside";
  const activeHint = useMemo(
    () => REPORT_OPTIONS.find((option) => option.value === type)?.hint ?? "",
    [type],
  );

  const loadReport = useCallback(async () => {
    if (needsDates && (!startDate || !endDate)) {
      toast.error("Choose a start and end date.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchReport({
        type,
        startDate: needsDates ? startDate : undefined,
        endDate: needsDates ? endDate : undefined,
        status: type === "inside" ? undefined : status,
        purpose:
          type !== "inside" && purpose.trim() ? purpose.trim() : undefined,
      });
      setResult(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [endDate, needsDates, purpose, startDate, status, type]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  useEffect(() => {
    const afterPrint = () => {
      document.body.classList.remove("printing-report");
    };

    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("afterprint", afterPrint);
      document.body.classList.remove("printing-report");
    };
  }, []);

  function handleExport() {
    if (!result) {
      return;
    }

    exportReportToExcel(result, buildReportFilename(result));
    toast.success("Excel file downloaded.");
  }

  function handlePrint() {
    document.body.classList.add("printing-report");
    try {
      window.print();
    } finally {
      window.setTimeout(() => {
        document.body.classList.remove("printing-report");
      }, 0);
    }
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-4 print:hidden lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Reports
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Visitor Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{activeHint}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={!result || isLoading}
          >
            <Download className="size-4" />
            Export Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            disabled={!result || isLoading}
          >
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileBarChart className="size-4 text-secondary" />
            Filters
          </CardTitle>
          <CardDescription>
            Choose a report type and optional filters, then review the results below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Report type</p>
            <Select
              value={type}
              onValueChange={(value) => {
                if (value) {
                  setType(value as ReportType);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select report" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsDates ? (
            <>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Start date</p>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">End date</p>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    if (value) {
                      setStatus(value as "ALL" | "CHECKED_IN" | "CHECKED_OUT");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                    <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Purpose contains
                </p>
                <Input
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  placeholder="Optional"
                />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="hidden print:block">
        <h1 className="text-xl font-semibold">Invenger VMS — Visitor Report</h1>
        <p className="text-sm text-muted-foreground">
          {REPORT_OPTIONS.find((option) => option.value === type)?.label}
          {result?.range.start
            ? ` · ${new Date(result.range.start).toLocaleDateString("en-IN")} to ${new Date(result.range.end!).toLocaleDateString("en-IN")}`
            : " · Currently inside"}
          {result ? ` · Generated ${formatDateTime(result.generatedAt)}` : null}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="border-border/80 shadow-sm xl:col-span-1">
          <CardHeader>
            <CardDescription>Total records</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading && !result ? <Skeleton className="h-9 w-16" /> : result?.total ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        {(type === "purpose" || (result?.purposeSummary.length ?? 0) > 0) && (
          <Card className="border-border/80 shadow-sm xl:col-span-3">
            <CardHeader>
              <CardTitle>Purpose summary</CardTitle>
              <CardDescription>
                Visit counts grouped by purpose for this report
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && !result ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : result?.purposeSummary.length ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {result.purposeSummary.map((item) => (
                    <div
                      key={item.purpose}
                      className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
                    >
                      <span className="truncate text-sm font-medium">
                        {item.purpose}
                      </span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No purpose data.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="print:pb-2">
          <CardTitle>Report results</CardTitle>
          <CardDescription className="print:hidden">
            Up to 2,000 matching visitor records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !result ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : result?.rows.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.visitorCode}</TableCell>
                    <TableCell>
                      <div>
                        <p>{row.fullName}</p>
                        <p className="text-xs text-muted-foreground">{row.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{row.company || "—"}</TableCell>
                    <TableCell>{row.purpose}</TableCell>
                    <TableCell>{row.personToMeet}</TableCell>
                    <TableCell>{formatDateTime(row.checkInTime)}</TableCell>
                    <TableCell>{formatDateTime(row.checkOutTime)}</TableCell>
                    <TableCell>
                      <VisitorStatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No visitors match this report.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
