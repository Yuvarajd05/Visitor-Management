import type { ApiErrorResponse, ApiSuccessResponse } from "@/server/api/response";
import type {
  EmployeeListItem,
  EmployeeListResult,
  EmployeeRecord,
} from "@/types/employee";
import type {
  CreateEmployeeFormValues,
  EmployeeListQueryValues,
  UpdateEmployeeFormValues,
} from "@/server/validation/employee";

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

function buildQueryString(query: Partial<EmployeeListQueryValues>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchEmployees(
  query: Partial<EmployeeListQueryValues>,
): Promise<EmployeeListResult> {
  const response = await fetch(`/api/employees${buildQueryString(query)}`);
  return parseResponse<EmployeeListResult>(response);
}

export async function fetchEmployee(id: string): Promise<EmployeeRecord> {
  const response = await fetch(`/api/employees/${id}`);
  return parseResponse<EmployeeRecord>(response);
}

export async function createEmployee(
  payload: CreateEmployeeFormValues,
): Promise<EmployeeRecord> {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<EmployeeRecord>(response);
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeeFormValues,
): Promise<EmployeeRecord> {
  const response = await fetch(`/api/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<EmployeeRecord>(response);
}

export async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch(`/api/employees/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseResponse<never>(response);
  }
}

export type { EmployeeListItem };
