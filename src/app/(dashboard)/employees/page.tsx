import type { Metadata } from "next";

import { EmployeeListContent } from "@/features/employees/components/employee-list-content";

export const metadata: Metadata = {
  title: "Employees | Invenger VMS",
};

export default function EmployeesPage() {
  return <EmployeeListContent />;
}
