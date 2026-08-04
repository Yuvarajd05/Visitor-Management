"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

import type { SystemSettingsRecord } from "@/types/system";
import type { AuthUser } from "@/types/auth";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import {
  downloadBackup,
  fetchSettings,
  restoreBackupFile,
  sendTestEmail,
  updateSettings,
} from "@/features/settings/lib/system-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/server/utils/errors";

interface SettingsContentProps {
  user: AuthUser;
}

export function SettingsContent({ user }: SettingsContentProps) {
  const isAdmin = user.role === "ADMIN";
  const [settings, setSettings] = useState<SystemSettingsRecord | null>(null);
  const [isLoading, setIsLoading] = useState(isAdmin);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState("");
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!isAdmin) {
      return;
    }

    try {
      setIsLoading(true);
      setSettings(await fetchSettings());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleSaveSettings() {
    if (!settings) {
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateSettings({
        companyName: settings.companyName,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
        passwordMinLength: settings.passwordMinLength,
        passwordRequireUpper: settings.passwordRequireUpper,
        passwordRequireLower: settings.passwordRequireLower,
        passwordRequireNumber: settings.passwordRequireNumber,
        passwordRequireSpecial: settings.passwordRequireSpecial,
        maxFailedLogins: settings.maxFailedLogins,
        lockoutMinutes: settings.lockoutMinutes,
        rateLimitWindowMinutes: settings.rateLimitWindowMinutes,
        rateLimitMaxAttempts: settings.rateLimitMaxAttempts,
        smtpHost: settings.smtpHost ?? "",
        smtpPort: settings.smtpPort,
        smtpSecure: settings.smtpSecure,
        smtpUser: settings.smtpUser ?? "",
        smtpPass: settings.smtpPass ?? "",
        smtpFrom: settings.smtpFrom ?? "",
        adminNotificationEmail: settings.adminNotificationEmail ?? "",
        notifyHostOnCheckIn: settings.notifyHostOnCheckIn,
        notifyHostOnCheckOut: settings.notifyHostOnCheckOut,
        notifyAdminOnCheckIn: settings.notifyAdminOnCheckIn,
        notifyAdminOnCheckOut: settings.notifyAdminOnCheckOut,
      });
      setSettings(updated);
      toast.success("System settings saved.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBackup() {
    try {
      setIsBackingUp(true);
      await downloadBackup();
      toast.success("Backup downloaded.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsBackingUp(false);
    }
  }

  async function handleRestore(file: File | null) {
    if (!file) {
      return;
    }

    const confirmed = window.confirm(
      "Restore will replace current users, visitors, employees, and settings. Continue?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setIsRestoring(true);
      await restoreBackupFile(file);
      toast.success("Backup restored. Refreshing…");
      window.location.reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">
          Settings
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage account security
          {isAdmin ? ", system policies, and backups" : ""}.
        </p>
      </div>

      <ChangePasswordForm />

      {isAdmin ? (
        <>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Session timeout, password policy, lockout, and rate limiting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading || !settings ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Company name</Label>
                      <Input
                        value={settings.companyName}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            companyName: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Session timeout (minutes)</Label>
                      <Input
                        type="number"
                        min={60}
                        max={20160}
                        value={settings.sessionTimeoutMinutes}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            sessionTimeoutMinutes: Number(event.target.value),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Default 10080 (1 week) so reception stays signed in.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Password min length</Label>
                      <Input
                        type="number"
                        min={6}
                        max={32}
                        value={settings.passwordMinLength}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            passwordMinLength: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Max failed logins</Label>
                      <Input
                        type="number"
                        min={3}
                        max={20}
                        value={settings.maxFailedLogins}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            maxFailedLogins: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Lockout duration (minutes)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={1440}
                        value={settings.lockoutMinutes}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            lockoutMinutes: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Rate limit window (minutes)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={120}
                        value={settings.rateLimitWindowMinutes}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            rateLimitWindowMinutes: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Rate limit max attempts</Label>
                      <Input
                        type="number"
                        min={5}
                        max={200}
                        value={settings.rateLimitMaxAttempts}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            rateLimitMaxAttempts: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {(
                      [
                        ["passwordRequireUpper", "Require uppercase"],
                        ["passwordRequireLower", "Require lowercase"],
                        ["passwordRequireNumber", "Require number"],
                        ["passwordRequireSpecial", "Require special character"],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={settings[key]}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              [key]: checked === true,
                            })
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  <Button
                    type="button"
                    className="bg-secondary hover:bg-secondary/90"
                    disabled={isSaving}
                    onClick={() => void handleSaveSettings()}
                  >
                    {isSaving ? "Saving..." : "Save system settings"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Email / SMTP</CardTitle>
              <CardDescription>
                Configure SMTP for host/admin visitor notifications. Leave blank to
                use `.env` SMTP, or Ethereal in local development.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!settings ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>SMTP host</Label>
                      <Input
                        value={settings.smtpHost ?? ""}
                        onChange={(event) =>
                          setSettings({ ...settings, smtpHost: event.target.value })
                        }
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>SMTP port</Label>
                      <Input
                        type="number"
                        value={settings.smtpPort}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            smtpPort: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>SMTP user</Label>
                      <Input
                        value={settings.smtpUser ?? ""}
                        onChange={(event) =>
                          setSettings({ ...settings, smtpUser: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>SMTP password</Label>
                      <Input
                        type="password"
                        value={settings.smtpPass ?? ""}
                        onChange={(event) =>
                          setSettings({ ...settings, smtpPass: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>From address</Label>
                      <Input
                        value={settings.smtpFrom ?? ""}
                        onChange={(event) =>
                          setSettings({ ...settings, smtpFrom: event.target.value })
                        }
                        placeholder="Invenger VMS <noreply@company.com>"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Admin notification email</Label>
                      <Input
                        type="email"
                        value={settings.adminNotificationEmail ?? ""}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            adminNotificationEmail: event.target.value,
                          })
                        }
                        placeholder="admin@company.com"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={settings.smtpSecure}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          smtpSecure: checked === true,
                        })
                      }
                    />
                    Use secure SMTP (TLS/SSL)
                  </label>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        ["notifyHostOnCheckIn", "Notify host on check-in"],
                        ["notifyHostOnCheckOut", "Notify host on check-out"],
                        ["notifyAdminOnCheckIn", "Notify admin on check-in"],
                        ["notifyAdminOnCheckOut", "Notify admin on check-out"],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={settings[key]}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              [key]: checked === true,
                            })
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-1.5">
                      <Label>Send test email to</Label>
                      <Input
                        type="email"
                        value={testEmailTo}
                        onChange={(event) => setTestEmailTo(event.target.value)}
                        placeholder="you@company.com"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isTestingEmail || !testEmailTo.trim()}
                      onClick={async () => {
                        try {
                          setIsTestingEmail(true);
                          await sendTestEmail(testEmailTo.trim());
                          toast.success("Test email sent.");
                        } catch (error) {
                          toast.error(getErrorMessage(error));
                        } finally {
                          setIsTestingEmail(false);
                        }
                      }}
                    >
                      {isTestingEmail ? "Sending..." : "Send test"}
                    </Button>
                  </div>

                  <Button
                    type="button"
                    className="bg-secondary hover:bg-secondary/90"
                    disabled={isSaving}
                    onClick={() => void handleSaveSettings()}
                  >
                    {isSaving ? "Saving..." : "Save email settings"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Backup / Restore</CardTitle>
              <CardDescription>
                Export or restore users, visitors, employees, and settings as JSON.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isBackingUp}
                onClick={() => void handleBackup()}
              >
                <Download className="size-4" />
                {isBackingUp ? "Preparing..." : "Download backup"}
              </Button>
              <Button type="button" variant="outline" disabled={isRestoring}>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <Upload className="size-4" />
                  {isRestoring ? "Restoring..." : "Restore from file"}
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    disabled={isRestoring}
                    onChange={(event) => {
                      void handleRestore(event.target.files?.[0] ?? null);
                      event.target.value = "";
                    }}
                  />
                </label>
              </Button>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
