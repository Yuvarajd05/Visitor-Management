import type { ApiErrorResponse, ApiSuccessResponse } from "@/server/api/response";
import type { ReportResult, ReportType } from "@/types/report";

export type ReportQuery = {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  purpose?: string;
  status?: "ALL" | "CHECKED_IN" | "CHECKED_OUT";
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!response.ok || !data.success) {
    const error = data as ApiErrorResponse;
    const detailMessage = error.details
      ? Object.values(error.details).flat().join(" ")
      : "";
    throw new Error(
      [error.error, detailMessage].filter(Boolean).join(" ") ||
        "Request failed. Please try again.",
    );
  }

  return (data as ApiSuccessResponse<T>).data;
}

function buildQueryString(query: ReportQuery): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return `?${params.toString()}`;
}

export async function fetchReport(query: ReportQuery): Promise<ReportResult> {
  const response = await fetch(`/api/reports${buildQueryString(query)}`);
  return parseResponse<ReportResult>(response);
}
