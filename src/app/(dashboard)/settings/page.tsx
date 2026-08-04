import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsContent } from "@/features/settings/components/settings-content";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Settings | Invenger VMS",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <SettingsContent user={user} />;
}
