import type { Metadata } from "next";

import { EmployeeDetailContent } from "@/features/employees/components";

export const metadata: Metadata = {
  title: "Employee Details | Invenger VMS",
};

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EmployeeDetailContent employeeId={id} />;
}
