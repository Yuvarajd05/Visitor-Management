"use client";

import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { Badge } from "@/components/ui/badge";

interface ChangePasswordContentProps {
  forced?: boolean;
}

export function ChangePasswordContent({
  forced = false,
}: ChangePasswordContentProps) {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">
          Security
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {forced ? "Password Update Required" : "Change Password"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {forced
            ? "You must set a new password before continuing. You will be signed out after updating."
            : "Update your account password. You will be signed out after updating."}
        </p>
      </div>

      <ChangePasswordForm
        title={forced ? "Set a new password" : "Change Password"}
        description="Password must be at least 8 characters and include uppercase, lowercase, and a number. You will need to sign in again afterward."
      />
    </div>
  );
}
