import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuditContent } from "@/features/settings/components/audit-content";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Audit & Errors | Invenger VMS",
};

export default async function AuditPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AuditContent />;
}
