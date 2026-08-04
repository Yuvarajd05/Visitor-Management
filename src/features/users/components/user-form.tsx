"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";

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
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "@/server/validation/user";

type UserFormMode = "create" | "edit";

interface UserFormProps {
  mode: UserFormMode;
  defaultValues?: Partial<CreateUserFormValues & UpdateUserFormValues>;
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
  onCancel: () => void;
}

const emptyCreateValues: CreateUserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "SECURITY",
  isActive: true,
  mustChangePassword: true,
};

export function UserForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(
      isEdit ? updateUserSchema : createUserSchema,
    ) as Resolver<CreateUserFormValues>,
    defaultValues: {
      ...emptyCreateValues,
      ...defaultValues,
    },
  });

  const role = watch("role");
  const isActive = watch("isActive");
  const mustChangePassword = watch("mustChangePassword");

  async function handleFormSubmit(values: CreateUserFormValues) {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit User" : "Add User"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update account details. Use Reset Password from the list to issue a temporary password."
            : "Create a login for admin or security staff. They should change the password after first login."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  if (value === "ADMIN" || value === "SECURITY") {
                    setValue("role", value, { shouldValidate: true });
                  }
                }}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SECURITY">Security</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role ? (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              ) : null}
            </div>

            {!isEdit ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Initial Password *</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  placeholder="Min 8 chars, upper, lower, number"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center gap-2 md:col-span-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue("isActive", checked === true, {
                    shouldValidate: true,
                  })
                }
              />
              <Label htmlFor="isActive" className="font-normal">
                Active account
              </Label>
            </div>

            {!isEdit ? (
              <div className="flex items-center gap-2 md:col-span-2">
                <Checkbox
                  id="mustChangePassword"
                  checked={mustChangePassword}
                  onCheckedChange={(checked) =>
                    setValue("mustChangePassword", checked === true, {
                      shouldValidate: true,
                    })
                  }
                />
                <Label htmlFor="mustChangePassword" className="font-normal">
                  Require password change on first login
                </Label>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                reset({
                  ...emptyCreateValues,
                  ...defaultValues,
                })
              }
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
