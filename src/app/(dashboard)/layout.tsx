import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layout/app-layout";
import { SessionTimeoutGuard } from "@/components/session-timeout-guard";
import { getCurrentUser } from "@/server/auth/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";

  if (user.mustChangePassword && pathname !== "/change-password") {
    redirect("/change-password");
  }

  return (
    <AppLayout user={user}>
      <SessionTimeoutGuard />
      {children}
    </AppLayout>
  );
}
