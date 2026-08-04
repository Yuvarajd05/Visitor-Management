import type { ApiErrorResponse, ApiSuccessResponse } from "@/server/api/response";

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const raw = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      raw.trim().slice(0, 180) ||
        `Request failed with status ${response.status}. Please restart the app and try again.`,
    );
  }

  let data: ApiSuccessResponse<T> | ApiErrorResponse;

  try {
    data = JSON.parse(raw) as ApiSuccessResponse<T> | ApiErrorResponse;
  } catch {
    throw new Error(
      raw.trim().slice(0, 180) ||
        "Server returned an invalid response. Please try again.",
    );
  }

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
