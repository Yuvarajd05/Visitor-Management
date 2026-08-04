"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { EmployeeRecord } from "@/types/employee";
import {
  EmployeeDeleteDialog,
  EmployeeStatusBadge,
} from "@/features/employees/components";
import {
  deleteEmployee,
  fetchEmployee,
} from "@/features/employees/lib/employee-api";
import { formatDateTime } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/server/utils/errors";

interface EmployeeDetailContentProps {
  employeeId: string;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export function EmployeeDetailContent({
  employeeId,
}: EmployeeDetailContentProps) {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEmployee = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchEmployee(employeeId);
      setEmployee(data);
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

  async function handleDelete() {
    if (!employee) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteEmployee(employee.id);
      toast.success("Employee deleted successfully.");
      router.push("/employees");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
              Employee Details
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {employee.fullName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Employee Code: {employee.employeeCode}
            </p>
          </div>
          <EmployeeStatusBadge isActive={employee.isActive} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/employees/${employee.id}/edit`}>
            <Button variant="outline">
              <Pencil className="size-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>Contact and role details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <DetailItem label="Full Name" value={employee.fullName} />
          <DetailItem label="Phone" value={employee.phone} />
          <DetailItem label="Email" value={employee.email} />
          <DetailItem label="Department" value={employee.department} />
          <DetailItem label="Designation" value={employee.designation} />
          <DetailItem
            label="Created"
            value={formatDateTime(employee.createdAt)}
          />
          <DetailItem
            label="Last Updated"
            value={formatDateTime(employee.updatedAt)}
          />
        </CardContent>
      </Card>

      <EmployeeDeleteDialog
        open={showDeleteDialog}
        employeeName={employee.fullName}
        employeeCode={employee.employeeCode}
        isDeleting={isDeleting}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  );
}
