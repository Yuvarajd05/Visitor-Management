import type { ApiErrorResponse, ApiSuccessResponse } from "@/server/api/response";
import type {
  AdminResetPasswordResult,
  UserListItem,
  UserListResult,
  UserRecord,
} from "@/types/user";
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
  UserListQueryValues,
} from "@/server/validation/user";

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

function buildQueryString(query: Partial<UserListQueryValues>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchUsers(
  query: Partial<UserListQueryValues>,
): Promise<UserListResult> {
  const response = await fetch(`/api/users${buildQueryString(query)}`);
  return parseResponse<UserListResult>(response);
}

export async function fetchUser(id: string): Promise<UserRecord> {
  const response = await fetch(`/api/users/${id}`);
  return parseResponse<UserRecord>(response);
}

export async function createUser(
  payload: CreateUserFormValues,
): Promise<UserRecord> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<UserRecord>(response);
}

export async function updateUser(
  id: string,
  payload: UpdateUserFormValues,
): Promise<UserRecord> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<UserRecord>(response);
}

export async function adminResetUserPassword(
  id: string,
): Promise<AdminResetPasswordResult> {
  const response = await fetch(`/api/users/${id}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ generatePassword: true }),
  });

  return parseResponse<AdminResetPasswordResult>(response);
}

export type { UserListItem };
