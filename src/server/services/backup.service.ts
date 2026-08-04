import { prisma } from "@/server/prisma/client";
import { ValidationError } from "@/server/api/errors";
import { writeAuditLog } from "@/server/services/audit.service";

export async function createBackup(actor: {
  id: string;
  email: string;
}) {
  const [users, employees, visitors, settings] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        mustChangePassword: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.employee.findMany(),
    prisma.visitor.findMany(),
    prisma.systemSettings.findUnique({ where: { id: "default" } }),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    users,
    employees,
    visitors,
    settings,
  };

  await writeAuditLog({
    action: "BACKUP_CREATED",
    entityType: "SYSTEM",
    summary: "System backup exported",
    actorId: actor.id,
    actorEmail: actor.email,
    metadata: {
      users: users.length,
      employees: employees.length,
      visitors: visitors.length,
    },
  });

  return payload;
}

export async function restoreBackup(
  payload: unknown,
  actor: { id: string; email: string },
) {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError("Invalid backup file.");
  }

  const data = payload as {
    version?: number;
    users?: Array<Record<string, unknown>>;
    employees?: Array<Record<string, unknown>>;
    visitors?: Array<Record<string, unknown>>;
    settings?: Record<string, unknown> | null;
  };

  if (data.version !== 1) {
    throw new ValidationError("Unsupported backup version.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.visitor.deleteMany();
    await tx.employee.deleteMany();
    await tx.passwordResetToken.deleteMany();
    await tx.auditLog.deleteMany();
    await tx.errorLog.deleteMany();
    await tx.user.deleteMany();

    if (data.users?.length) {
      for (const user of data.users) {
        await tx.user.create({
          data: {
            id: String(user.id),
            name: String(user.name),
            email: String(user.email),
            password: String(user.password),
            role: user.role === "ADMIN" ? "ADMIN" : "SECURITY",
            mustChangePassword: Boolean(user.mustChangePassword),
            isActive: user.isActive !== false,
            createdAt: user.createdAt
              ? new Date(String(user.createdAt))
              : undefined,
            updatedAt: user.updatedAt
              ? new Date(String(user.updatedAt))
              : undefined,
          },
        });
      }
    }

    if (data.employees?.length) {
      for (const employee of data.employees) {
        await tx.employee.create({
          data: {
            id: String(employee.id),
            employeeCode: String(employee.employeeCode),
            fullName: String(employee.fullName),
            email: employee.email ? String(employee.email) : null,
            phone: String(employee.phone),
            department: String(employee.department),
            designation: String(employee.designation),
            isActive: employee.isActive !== false,
            createdAt: employee.createdAt
              ? new Date(String(employee.createdAt))
              : undefined,
            updatedAt: employee.updatedAt
              ? new Date(String(employee.updatedAt))
              : undefined,
          },
        });
      }
    }

    if (data.visitors?.length) {
      for (const visitor of data.visitors) {
        await tx.visitor.create({
          data: {
            id: String(visitor.id),
            visitorCode: String(visitor.visitorCode),
            fullName: String(visitor.fullName),
            phone: String(visitor.phone),
            company: visitor.company ? String(visitor.company) : null,
            purpose: String(visitor.purpose),
            personToMeet: String(visitor.personToMeet),
            idProofType: visitor.idProofType
              ? String(visitor.idProofType)
              : null,
            idProofNumber: visitor.idProofNumber
              ? String(visitor.idProofNumber)
              : null,
            vehicleNumber: visitor.vehicleNumber
              ? String(visitor.vehicleNumber)
              : null,
            photoUrl: visitor.photoUrl ? String(visitor.photoUrl) : null,
            checkInTime: visitor.checkInTime
              ? new Date(String(visitor.checkInTime))
              : new Date(),
            checkOutTime: visitor.checkOutTime
              ? new Date(String(visitor.checkOutTime))
              : null,
            status:
              visitor.status === "CHECKED_OUT" ? "CHECKED_OUT" : "CHECKED_IN",
            createdBy: String(visitor.createdBy),
            createdAt: visitor.createdAt
              ? new Date(String(visitor.createdAt))
              : undefined,
            updatedAt: visitor.updatedAt
              ? new Date(String(visitor.updatedAt))
              : undefined,
          },
        });
      }
    }

    if (data.settings) {
      await tx.systemSettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          companyName: String(data.settings.companyName ?? "Invenger"),
          sessionTimeoutMinutes: Number(
            data.settings.sessionTimeoutMinutes ?? 10080,
          ),
          passwordMinLength: Number(data.settings.passwordMinLength ?? 8),
          passwordRequireUpper: Boolean(
            data.settings.passwordRequireUpper ?? true,
          ),
          passwordRequireLower: Boolean(
            data.settings.passwordRequireLower ?? true,
          ),
          passwordRequireNumber: Boolean(
            data.settings.passwordRequireNumber ?? true,
          ),
          passwordRequireSpecial: Boolean(
            data.settings.passwordRequireSpecial ?? false,
          ),
          maxFailedLogins: Number(data.settings.maxFailedLogins ?? 5),
          lockoutMinutes: Number(data.settings.lockoutMinutes ?? 15),
          rateLimitWindowMinutes: Number(
            data.settings.rateLimitWindowMinutes ?? 15,
          ),
          rateLimitMaxAttempts: Number(
            data.settings.rateLimitMaxAttempts ?? 20,
          ),
          smtpHost: data.settings.smtpHost
            ? String(data.settings.smtpHost)
            : null,
          smtpPort: Number(data.settings.smtpPort ?? 587),
          smtpSecure: Boolean(data.settings.smtpSecure ?? false),
          smtpUser: data.settings.smtpUser
            ? String(data.settings.smtpUser)
            : null,
          smtpPass: data.settings.smtpPass
            ? String(data.settings.smtpPass)
            : null,
          smtpFrom: data.settings.smtpFrom
            ? String(data.settings.smtpFrom)
            : null,
          adminNotificationEmail: data.settings.adminNotificationEmail
            ? String(data.settings.adminNotificationEmail)
            : null,
          notifyHostOnCheckIn: Boolean(
            data.settings.notifyHostOnCheckIn ?? true,
          ),
          notifyHostOnCheckOut: Boolean(
            data.settings.notifyHostOnCheckOut ?? false,
          ),
          notifyAdminOnCheckIn: Boolean(
            data.settings.notifyAdminOnCheckIn ?? true,
          ),
          notifyAdminOnCheckOut: Boolean(
            data.settings.notifyAdminOnCheckOut ?? true,
          ),
        },
        update: {
          companyName: String(data.settings.companyName ?? "Invenger"),
          sessionTimeoutMinutes: Number(
            data.settings.sessionTimeoutMinutes ?? 10080,
          ),
          passwordMinLength: Number(data.settings.passwordMinLength ?? 8),
          passwordRequireUpper: Boolean(
            data.settings.passwordRequireUpper ?? true,
          ),
          passwordRequireLower: Boolean(
            data.settings.passwordRequireLower ?? true,
          ),
          passwordRequireNumber: Boolean(
            data.settings.passwordRequireNumber ?? true,
          ),
          passwordRequireSpecial: Boolean(
            data.settings.passwordRequireSpecial ?? false,
          ),
          maxFailedLogins: Number(data.settings.maxFailedLogins ?? 5),
          lockoutMinutes: Number(data.settings.lockoutMinutes ?? 15),
          rateLimitWindowMinutes: Number(
            data.settings.rateLimitWindowMinutes ?? 15,
          ),
          rateLimitMaxAttempts: Number(
            data.settings.rateLimitMaxAttempts ?? 20,
          ),
          smtpHost: data.settings.smtpHost
            ? String(data.settings.smtpHost)
            : null,
          smtpPort: Number(data.settings.smtpPort ?? 587),
          smtpSecure: Boolean(data.settings.smtpSecure ?? false),
          smtpUser: data.settings.smtpUser
            ? String(data.settings.smtpUser)
            : null,
          smtpPass: data.settings.smtpPass
            ? String(data.settings.smtpPass)
            : null,
          smtpFrom: data.settings.smtpFrom
            ? String(data.settings.smtpFrom)
            : null,
          adminNotificationEmail: data.settings.adminNotificationEmail
            ? String(data.settings.adminNotificationEmail)
            : null,
          notifyHostOnCheckIn: Boolean(
            data.settings.notifyHostOnCheckIn ?? true,
          ),
          notifyHostOnCheckOut: Boolean(
            data.settings.notifyHostOnCheckOut ?? false,
          ),
          notifyAdminOnCheckIn: Boolean(
            data.settings.notifyAdminOnCheckIn ?? true,
          ),
          notifyAdminOnCheckOut: Boolean(
            data.settings.notifyAdminOnCheckOut ?? true,
          ),
        },
      });
    }
  });

  await writeAuditLog({
    action: "BACKUP_RESTORED",
    entityType: "SYSTEM",
    summary: "System backup restored",
    actorId: actor.id,
    actorEmail: actor.email,
  });
}
