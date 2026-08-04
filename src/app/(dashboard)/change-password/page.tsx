import type { Metadata } from "next";

import { ChangePasswordContent } from "@/features/auth/components/change-password-content";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Change Password | Invenger VMS",
};

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();

  return <ChangePasswordContent forced={Boolean(user?.mustChangePassword)} />;
}
