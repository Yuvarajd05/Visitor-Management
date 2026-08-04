import type { ApiErrorResponse, ApiSuccessResponse } from "@/server/api/response";
import type { DashboardData, DashboardRangePreset } from "@/types/dashboard";

export type DashboardQuery = {
  range?: DashboardRangePreset;
  startDate?: string;
  endDate?: string;
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

function buildQueryString(query: DashboardQuery): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchDashboard(
  query: DashboardQuery = {},
): Promise<DashboardData> {
  const response = await fetch(`/api/dashboard${buildQueryString(query)}`);
  return parseResponse<DashboardData>(response);
}
