import { parseApiResponse } from "@/lib/parse-api-response";
import type {
  AuditLogRecord,
  ErrorLogRecord,
  PublicSystemSettings,
  SystemSettingsRecord,
} from "@/types/system";
import type { UpdateSystemSettingsValues } from "@/server/validation/system";

export async function fetchPublicSettings(): Promise<PublicSystemSettings> {
  const response = await fetch("/api/settings/public");
  return parseApiResponse<PublicSystemSettings>(response);
}

export async function fetchSettings(): Promise<SystemSettingsRecord> {
  const response = await fetch("/api/settings");
  return parseApiResponse<SystemSettingsRecord>(response);
}

export async function updateSettings(
  payload: UpdateSystemSettingsValues,
): Promise<SystemSettingsRecord> {
  const response = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseApiResponse<SystemSettingsRecord>(response);
}

export async function fetchAuditLogs(query: {
  search?: string;
  entityType?: string;
  page?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  const response = await fetch(`/api/audit?${params.toString()}`);
  return parseApiResponse<{
    logs: AuditLogRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(response);
}

export async function fetchErrorLogs(query: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  const response = await fetch(`/api/errors?${params.toString()}`);
  return parseApiResponse<{
    logs: ErrorLogRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(response);
}

export async function downloadBackup() {
  const response = await fetch("/api/backup");
  const data = await parseApiResponse<unknown>(response);
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `invenger-vms-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function restoreBackupFile(file: File) {
  const text = await file.text();
  const payload = JSON.parse(text) as unknown;
  const response = await fetch("/api/backup/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseApiResponse<never>(response);
  }
}

export async function sendTestEmail(to: string) {
  const response = await fetch("/api/settings/test-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to }),
  });
  return parseApiResponse<{ mode: string; previewUrl?: string }>(response);
}
