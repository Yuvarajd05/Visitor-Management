import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login | Invenger VMS",
  description: "Sign in to the Invenger Visitor Management System",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_45%)]" />
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
