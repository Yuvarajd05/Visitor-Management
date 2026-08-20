import { parseApiResponse } from "@/lib/parse-api-response";
import type {
  VisitorListItem,
  VisitorListResult,
  VisitorPhoneLookupResult,
  VisitorWithCreator,
} from "@/types/visitor";
import type {
  CreateVisitorFormValues,
  UpdateVisitorFormValues,
  VisitorListQueryValues,
} from "@/server/validation/visitor";

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
  return parseApiResponse<VisitorListResult>(response);
}

/** Lookup returning visitors by partial or full phone digits. */
export async function lookupVisitorsByPhone(
  phone: string,
): Promise<VisitorPhoneLookupResult> {
  const params = new URLSearchParams({ phone });
  const response = await fetch(`/api/visitors/lookup?${params.toString()}`);
  return parseApiResponse<VisitorPhoneLookupResult>(response);
}

export async function fetchVisitor(id: string): Promise<VisitorWithCreator> {
  const response = await fetch(`/api/visitors/${id}`);
  return parseApiResponse<VisitorWithCreator>(response);
}

export async function createVisitor(
  payload: CreateVisitorFormValues,
): Promise<VisitorWithCreator> {
  const response = await fetch("/api/visitors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<VisitorWithCreator>(response);
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

  return parseApiResponse<VisitorWithCreator>(response);
}

export async function deleteVisitor(id: string): Promise<void> {
  const response = await fetch(`/api/visitors/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseApiResponse<never>(response);
  }
}

export async function checkoutVisitor(
  id: string,
): Promise<VisitorWithCreator> {
  const response = await fetch(`/api/visitors/${id}/checkout`, {
    method: "PATCH",
  });

  return parseApiResponse<VisitorWithCreator>(response);
}

export type { VisitorListItem };
