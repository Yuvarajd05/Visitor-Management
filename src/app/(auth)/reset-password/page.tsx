import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Invenger VMS",
  description: "Choose a new password for your Invenger VMS account",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_45%)]" />
      <div className="relative z-10 w-full max-w-md">
        <ResetPasswordForm token={token ?? ""} />
      </div>
    </div>
  );
}
