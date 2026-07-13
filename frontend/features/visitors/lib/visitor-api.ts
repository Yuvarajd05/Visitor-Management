import type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/api/response";
import type {
  VisitorListItem,
  VisitorListResult,
  VisitorWithCreator,
} from "@/types/visitor";
import type {
  CreateVisitorFormValues,
  UpdateVisitorFormValues,
  VisitorListQueryValues,
} from "@/utils/validation/visitor";

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

function buildQueryString(query: Partial<VisitorListQueryValues>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchVisitors(
  query: Partial<VisitorListQueryValues>,
): Promise<VisitorListResult> {
  const response = await fetch(`/api/visitors${buildQueryString(query)}`);
  return parseResponse<VisitorListResult>(response);
}

export async function fetchVisitor(id: string): Promise<VisitorWithCreator> {
  const response = await fetch(`/api/visitors/${id}`);
  return parseResponse<VisitorWithCreator>(response);
}

export async function createVisitor(
  payload: CreateVisitorFormValues,
): Promise<VisitorWithCreator> {
  const response = await fetch("/api/visitors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<VisitorWithCreator>(response);
}

export async function updateVisitor(
  id: string,
  payload: UpdateVisitorFormValues,
): Promise<VisitorWithCreator> {
  const response = await fetch(`/api/visitors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<VisitorWithCreator>(response);
}

export async function deleteVisitor(id: string): Promise<void> {
  const response = await fetch(`/api/visitors/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseResponse<never>(response);
  }
}

export async function checkoutVisitor(
  id: string,
): Promise<VisitorWithCreator> {
  const response = await fetch(`/api/visitors/${id}/checkout`, {
    method: "PATCH",
  });

  return parseResponse<VisitorWithCreator>(response);
}

export type { VisitorListItem };
