import type { Metadata } from "next";

import { EmployeeNewContent } from "@/features/employees/components";

export const metadata: Metadata = {
  title: "Add Employee | Invenger VMS",
};

export default function NewEmployeePage() {
  return <EmployeeNewContent />;
}
