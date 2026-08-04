export interface SystemSettingsRecord {
  id: string;
  companyName: string;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordRequireUpper: boolean;
  passwordRequireLower: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  maxFailedLogins: number;
  lockoutMinutes: number;
  rateLimitWindowMinutes: number;
  rateLimitMaxAttempts: number;
  smtpHost: string | null;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
  adminNotificationEmail: string | null;
  notifyHostOnCheckIn: boolean;
  notifyHostOnCheckOut: boolean;
  notifyAdminOnCheckIn: boolean;
  notifyAdminOnCheckOut: boolean;
  updatedAt: Date;
}

export interface PublicSystemSettings {
  companyName: string;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordRequireUpper: boolean;
  passwordRequireLower: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  metadata: unknown;
  actorId: string | null;
  actorEmail: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface ErrorLogRecord {
  id: string;
  message: string;
  stack: string | null;
  path: string | null;
  method: string | null;
  statusCode: number | null;
  userId: string | null;
  createdAt: Date;
}
