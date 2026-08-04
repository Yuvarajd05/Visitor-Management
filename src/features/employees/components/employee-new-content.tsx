"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { EmployeeForm } from "@/features/employees/components/employee-form";
import { createEmployee } from "@/features/employees/lib/employee-api";
import type { CreateEmployeeFormValues } from "@/server/validation/employee";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/server/utils/errors";

export function EmployeeNewContent() {
  const router = useRouter();

  async function handleSubmit(values: CreateEmployeeFormValues) {
    try {
      const employee = await createEmployee(values);
      toast.success("Employee created successfully.");
      router.push(`/employees/${employee.id}`);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to employees
        </Link>
        <div>
          <Badge variant="secondary" className="mb-3">
            New Employee
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Add Employee
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A unique employee code will be generated automatically on save.
          </p>
        </div>
      </div>

      <EmployeeForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/employees")}
      />
    </div>
  );
}
