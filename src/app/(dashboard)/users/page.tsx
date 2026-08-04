import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UserListContent } from "@/features/users/components";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Users | Invenger VMS",
};

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <UserListContent />;
}
