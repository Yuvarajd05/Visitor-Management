import * as XLSX from "xlsx";

import type { ReportResult } from "@/types/report";
import { formatDateTime } from "@/lib/date";

function statusLabel(status: "CHECKED_IN" | "CHECKED_OUT"): string {
  return status === "CHECKED_IN" ? "Checked In" : "Checked Out";
}

export function exportReportToExcel(result: ReportResult, filename: string) {
  const workbook = XLSX.utils.book_new();

  const visitorRows = result.rows.map((row) => ({
    Code: row.visitorCode,
    Name: row.fullName,
    Phone: row.phone,
    Company: row.company ?? "",
    Purpose: row.purpose,
    "Person to Meet": row.personToMeet,
    "Check In": formatDateTime(row.checkInTime),
    "Check Out": formatDateTime(row.checkOutTime),
    Status: statusLabel(row.status),
  }));

  const visitorsSheet = XLSX.utils.json_to_sheet(
    visitorRows.length
      ? visitorRows
      : [
          {
            Code: "",
            Name: "No records",
            Phone: "",
            Company: "",
            Purpose: "",
            "Person to Meet": "",
            "Check In": "",
            "Check Out": "",
            Status: "",
          },
        ],
  );
  XLSX.utils.book_append_sheet(workbook, visitorsSheet, "Visitors");

  if (result.purposeSummary.length > 0) {
    const purposeSheet = XLSX.utils.json_to_sheet(
      result.purposeSummary.map((item) => ({
        Purpose: item.purpose,
        Count: item.count,
      })),
    );
    XLSX.utils.book_append_sheet(workbook, purposeSheet, "By Purpose");
  }

  XLSX.writeFile(workbook, filename);
}

export function buildReportFilename(result: ReportResult): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `visitor-report-${result.type}-${stamp}.xlsx`;
}
