"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { VisitorForm } from "@/features/visitors/components/visitor-form";
import { createVisitor } from "@/features/visitors/lib/visitor-api";
import type { CreateVisitorFormValues } from "@/utils/validation/visitor";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/utils/errors";

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
      <div className="space-y-3">
        <Link
          href="/visitors"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to visitors
        </Link>
        <div>
          <Badge variant="secondary" className="mb-3">
            Registration
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Register Visitor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A unique visitor code will be generated automatically on save.
          </p>
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
