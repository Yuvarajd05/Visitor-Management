"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { toast } from "sonner";

import { VisitorForm } from "@/features/visitors/components/visitor-form";
import { createVisitor } from "@/features/visitors/lib/visitor-api";
import type { CreateVisitorFormValues } from "@/server/validation/visitor";
import { getErrorMessage } from "@/server/utils/errors";

export function VisitorNewContent() {
  const router = useRouter();

  async function handleSubmit(values: CreateVisitorFormValues) {
    try {
      const visitor = await createVisitor(values);
      toast.success("Visitor registered successfully.");
      router.push(`/visitors/${visitor.id}`);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="relative px-5 py-6 md:px-7 md:py-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_42%),linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#2563eb_100%)] opacity-[0.97]"
          />
          <div className="relative space-y-4 text-white">
            <Link
              href="/visitors"
              className="inline-flex items-center gap-2 text-sm text-blue-100 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to visitors
            </Link>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white/15 p-2.5 ring-1 ring-white/25">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.14em] text-blue-100 uppercase">
                  Registration
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                  Register Visitor
                </h1>
                <p className="mt-1.5 max-w-xl text-sm text-blue-100/90">
                  A unique visitor code is generated automatically when you save.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VisitorForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/visitors")}
      />
    </div>
  );
}
