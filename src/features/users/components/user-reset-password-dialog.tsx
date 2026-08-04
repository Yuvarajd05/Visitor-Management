"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { adminResetUserPassword } from "@/features/users/lib/user-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/server/utils/errors";

interface UserResetPasswordDialogProps {
  open: boolean;
  userId?: string;
  userName?: string;
  onOpenChange: (open: boolean) => void;
}

export function UserResetPasswordDialog({
  open,
  userId,
  userName,
  onOpenChange,
}: UserResetPasswordDialogProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  async function handleReset() {
    if (!userId) {
      return;
    }

    try {
      setIsResetting(true);
      const result = await adminResetUserPassword(userId);
      setTemporaryPassword(result.temporaryPassword);
      toast.success("Temporary password created.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsResetting(false);
    }
  }

  async function handleCopy() {
    if (!temporaryPassword) {
      return;
    }

    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      toast.success("Temporary password copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy password. Please copy it manually.");
    }
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setTemporaryPassword(null);
      setCopied(false);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            {temporaryPassword
              ? "Share this temporary password securely (in person or by phone). The user must change it after login."
              : `Generate a temporary password for ${userName ?? "this user"}. They will be required to change it on next login.`}
          </DialogDescription>
        </DialogHeader>

        {temporaryPassword ? (
          <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Temporary password
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-background px-3 py-2 text-sm font-semibold tracking-wide">
                {temporaryPassword}
              </code>
              <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This password is shown only once. Copy it before closing.
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            {temporaryPassword ? "Done" : "Cancel"}
          </Button>
          {!temporaryPassword ? (
            <Button
              type="button"
              className="bg-secondary hover:bg-secondary/90"
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  Generate temporary password
                </>
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
