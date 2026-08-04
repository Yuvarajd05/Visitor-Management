import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UserNewContent } from "@/features/users/components";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Add User | Invenger VMS",
};

export default async function NewUserPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <UserNewContent />;
}
