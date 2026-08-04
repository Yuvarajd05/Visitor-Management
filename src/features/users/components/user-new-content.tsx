"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { UserForm } from "@/features/users/components/user-form";
import { createUser } from "@/features/users/lib/user-api";
import type { CreateUserFormValues } from "@/server/validation/user";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/server/utils/errors";

export function UserNewContent() {
  const router = useRouter();

  async function handleSubmit(values: CreateUserFormValues) {
    try {
      await createUser(values);
      toast.success("User created successfully.");
      router.push("/users");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
            New User
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Add User
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an admin or security login account.
          </p>
        </div>
      </div>

      <UserForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/users")}
      />
    </div>
  );
}
