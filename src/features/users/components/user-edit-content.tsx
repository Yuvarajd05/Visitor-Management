"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { UserForm } from "@/features/users/components/user-form";
import { UserResetPasswordDialog } from "@/features/users/components/user-reset-password-dialog";
import { fetchUser, updateUser } from "@/features/users/lib/user-api";
import type { CreateUserFormValues } from "@/server/validation/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/server/utils/errors";

interface UserEditContentProps {
  userId: string;
}

export function UserEditContent({ userId }: UserEditContentProps) {
  const router = useRouter();
  const [defaultValues, setDefaultValues] =
    useState<Partial<CreateUserFormValues>>();
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = await fetchUser(userId);
      setUserName(user.name);
      setDefaultValues({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        password: "",
        mustChangePassword: user.mustChangePassword,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
      router.push("/users");
    } finally {
      setIsLoading(false);
    }
  }, [router, userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  async function handleSubmit(values: CreateUserFormValues) {
    try {
      await updateUser(userId, {
        name: values.name,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
      });
      toast.success("User updated successfully.");
      router.push("/users");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  if (isLoading || !defaultValues) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link
            href="/users"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to users
          </Link>
          <div>
            <Badge variant="secondary" className="mb-3">
              Edit User
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Edit User
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{userName}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowResetDialog(true)}>
          <KeyRound className="size-4" />
          Reset password
        </Button>
      </div>

      <UserForm
        mode="edit"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/users")}
      />

      <UserResetPasswordDialog
        open={showResetDialog}
        userId={userId}
        userName={userName}
        onOpenChange={setShowResetDialog}
      />
    </div>
  );
}
