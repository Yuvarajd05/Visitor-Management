import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Employees | Invenger VMS",
};

export default function EmployeesPage() {
  return (
    <PlaceholderPage
      title="Employees"
      description="Employee management will be available in a future phase."
    />
  );
}
