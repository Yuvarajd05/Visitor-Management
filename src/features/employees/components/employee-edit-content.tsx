"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { EmployeeForm } from "@/features/employees/components/employee-form";
import {
  fetchEmployee,
  updateEmployee,
} from "@/features/employees/lib/employee-api";
import type { CreateEmployeeFormValues } from "@/server/validation/employee";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/server/utils/errors";

interface EmployeeEditContentProps {
  employeeId: string;
}

export function EmployeeEditContent({ employeeId }: EmployeeEditContentProps) {
  const router = useRouter();
  const [defaultValues, setDefaultValues] =
    useState<Partial<CreateEmployeeFormValues>>();
  const [employeeCode, setEmployeeCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadEmployee = useCallback(async () => {
    try {
      setIsLoading(true);
      const employee = await fetchEmployee(employeeId);
      setEmployeeCode(employee.employeeCode);
      setDefaultValues({
        fullName: employee.fullName,
        email: employee.email ?? "",
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        isActive: employee.isActive,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
      router.push("/employees");
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, router]);

  useEffect(() => {
    void loadEmployee();
  }, [loadEmployee]);

  async function handleSubmit(values: CreateEmployeeFormValues) {
    try {
      await updateEmployee(employeeId, {
        ...values,
        email: values.email?.trim() ? values.email : null,
      });
      toast.success("Employee updated successfully.");
      router.push(`/employees/${employeeId}`);
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3">
        <Link
          href={`/employees/${employeeId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to employee details
        </Link>
        <div>
          <Badge variant="secondary" className="mb-3">
            Edit Employee
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Edit Employee
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Employee Code: {employeeCode} (read-only)
          </p>
        </div>
      </div>

      <EmployeeForm
        mode="edit"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/employees/${employeeId}`)}
      />
    </div>
  );
}
