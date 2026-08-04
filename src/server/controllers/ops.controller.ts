import {
  apiMessage,
  apiSuccess,
  parseSearchParams,
  requireApiAdmin,
  requireApiUser,
} from "@/server/api";
import { listAuditLogs } from "@/server/services/audit.service";
import { createBackup, restoreBackup } from "@/server/services/backup.service";
import { getDashboardData } from "@/server/services/dashboard.service";
import { listErrorLogs } from "@/server/services/error-log.service";
import { getVisitorReport } from "@/server/services/report.service";
import { dashboardQuerySchema } from "@/server/validation/dashboard";
import { reportQuerySchema } from "@/server/validation/report";
import {
  auditListQuerySchema,
  errorListQuerySchema,
} from "@/server/validation/system";

export async function getDashboardController(request: Request) {
  await requireApiUser();
  const query = parseSearchParams(
    dashboardQuerySchema,
    new URL(request.url).searchParams,
  );
  return apiSuccess(await getDashboardData(query));
}

export async function getReportController(request: Request) {
  await requireApiUser();
  const query = parseSearchParams(
    reportQuerySchema,
    new URL(request.url).searchParams,
  );
  return apiSuccess(await getVisitorReport(query));
}

export async function listAuditLogsController(request: Request) {
  await requireApiAdmin();
  const query = parseSearchParams(
    auditListQuerySchema,
    new URL(request.url).searchParams,
  );
  return apiSuccess(await listAuditLogs(query));
}

export async function listErrorLogsController(request: Request) {
  await requireApiAdmin();
  const query = parseSearchParams(
    errorListQuerySchema,
    new URL(request.url).searchParams,
  );
  return apiSuccess(await listErrorLogs(query));
}

export async function createBackupController() {
  const user = await requireApiAdmin();
  const backup = await createBackup({ id: user.id, email: user.email });
  return apiSuccess(backup);
}

export async function restoreBackupController(request: Request) {
  const user = await requireApiAdmin();
  const payload = await request.json();
  await restoreBackup(payload, {
    id: user.id,
    email: user.email,
  });
  return apiMessage("Backup restored successfully.");
}
