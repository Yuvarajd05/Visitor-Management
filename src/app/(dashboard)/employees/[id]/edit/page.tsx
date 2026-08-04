import type { Metadata } from "next";

import { EmployeeEditContent } from "@/features/employees/components";

export const metadata: Metadata = {
  title: "Edit Employee | Invenger VMS",
};

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EmployeeEditContent employeeId={id} />;
}
