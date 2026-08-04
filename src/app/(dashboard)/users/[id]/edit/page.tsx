import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UserEditContent } from "@/features/users/components";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Edit User | Invenger VMS",
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  return <UserEditContent userId={id} />;
}
