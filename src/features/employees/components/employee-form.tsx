"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";

import { DEPARTMENTS } from "@/types/employee";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEmployeeSchema,
  type CreateEmployeeFormValues,
} from "@/server/validation/employee";

type EmployeeFormMode = "create" | "edit";

interface EmployeeFormProps {
  mode: EmployeeFormMode;
  defaultValues?: Partial<CreateEmployeeFormValues>;
  onSubmit: (values: CreateEmployeeFormValues) => Promise<void>;
  onCancel: () => void;
}

const emptyValues: CreateEmployeeFormValues = {
  fullName: "",
  email: "",
  phone: "",
  department: "Engineering",
  designation: "",
  isActive: true,
};

export function EmployeeForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(
      createEmployeeSchema,
    ) as Resolver<CreateEmployeeFormValues>,
    defaultValues: {
      ...emptyValues,
      ...defaultValues,
    },
  });

  const department = watch("department");
  const isActive = watch("isActive");

  async function handleFormSubmit(values: CreateEmployeeFormValues) {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    reset({
      ...emptyValues,
      ...defaultValues,
    });
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Employee" : "Add Employee"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update employee details. Employee code cannot be changed."
            : "Enter employee details. A unique employee code will be generated on save."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName")}
              />
              {errors.fullName ? (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="10-digit mobile number"
                maxLength={10}
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com (optional)"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={department}
                onValueChange={(value) => {
                  if (value) {
                    setValue("department", value, { shouldValidate: true });
                  }
                }}
              >
                <SelectTrigger id="department" className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department ? (
                <p className="text-sm text-destructive">
                  {errors.department.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                placeholder="Job title"
                aria-invalid={Boolean(errors.designation)}
                {...register("designation")}
              />
              {errors.designation ? (
                <p className="text-sm text-destructive">
                  {errors.designation.message}
                </p>
              ) : null}
            </div>

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
                Active employee
              </Label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
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
