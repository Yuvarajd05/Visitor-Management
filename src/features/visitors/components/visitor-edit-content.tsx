"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";
import { toast } from "sonner";

import { VisitorForm } from "@/features/visitors/components/visitor-form";
import {
  fetchVisitor,
  updateVisitor,
} from "@/features/visitors/lib/visitor-api";
import type {
  CreateVisitorFormValues,
  UpdateVisitorFormValues,
} from "@/server/validation/visitor";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/server/utils/errors";

interface VisitorEditContentProps {
  visitorId: string;
}

function toUpdatePayload(
  values: CreateVisitorFormValues,
  removePhoto: boolean,
): UpdateVisitorFormValues {
  const payload: UpdateVisitorFormValues = {
    fullName: values.fullName,
    phone: values.phone,
    company: values.company?.trim() ? values.company : null,
    address: values.address?.trim() ? values.address : null,
    purpose: values.purpose,
    personToMeet: values.personToMeet,
    idProofType: values.idProofType ?? null,
    idProofNumber: values.idProofNumber?.trim()
      ? values.idProofNumber
      : null,
    vehicleType: values.vehicleType?.trim() ? values.vehicleType : null,
    vehicleNumber: values.vehicleNumber?.trim()
      ? values.vehicleNumber
      : null,
    additionalMembers: values.additionalMembers ?? 0,
  };

  if (values.photoDataUrl) {
    payload.photoDataUrl = values.photoDataUrl;
  } else if (removePhoto) {
    payload.photoDataUrl = null;
  }

  return payload;
}

export function VisitorEditContent({ visitorId }: VisitorEditContentProps) {
  const router = useRouter();
  const [defaultValues, setDefaultValues] =
    useState<Partial<CreateVisitorFormValues>>();
  const [visitorCode, setVisitorCode] = useState<string>("");
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadVisitor = useCallback(async () => {
    try {
      setIsLoading(true);
      const visitor = await fetchVisitor(visitorId);
      setVisitorCode(visitor.visitorCode);
      setExistingPhotoUrl(visitor.photoUrl);
      setRemovePhoto(false);
      setDefaultValues({
        fullName: visitor.fullName,
        phone: visitor.phone,
        company: visitor.company ?? "",
        address: visitor.address ?? "",
        purpose: visitor.purpose,
        personToMeet: visitor.personToMeet,
        idProofType: visitor.idProofType as CreateVisitorFormValues["idProofType"],
        idProofNumber: visitor.idProofNumber ?? "",
        vehicleType: visitor.vehicleType ?? "",
        vehicleNumber: visitor.vehicleNumber ?? "",
        additionalMembers: visitor.additionalMembers ?? 0,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
      router.push("/visitors");
    } finally {
      setIsLoading(false);
    }
  }, [router, visitorId]);

  useEffect(() => {
    void loadVisitor();
  }, [loadVisitor]);

  async function handleSubmit(values: CreateVisitorFormValues) {
    try {
      await updateVisitor(visitorId, toUpdatePayload(values, removePhoto));
      toast.success("Visitor updated successfully.");
      router.push(`/visitors/${visitorId}`);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }

  if (isLoading || !defaultValues) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
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
              href={`/visitors/${visitorId}`}
              className="inline-flex items-center gap-2 text-sm text-blue-100 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to visitor details
            </Link>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white/15 p-2.5 ring-1 ring-white/25">
                <PencilLine className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.14em] text-blue-100 uppercase">
                  Edit Visitor
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                  Edit Visitor
                </h1>
                <p className="mt-1.5 text-sm text-blue-100/90">
                  Visitor Code: {visitorCode} (read-only)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VisitorForm
        mode="edit"
        defaultValues={defaultValues}
        existingPhotoUrl={existingPhotoUrl}
        onExistingPhotoCleared={() => {
          setExistingPhotoUrl(null);
          setRemovePhoto(true);
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/visitors/${visitorId}`)}
      />
    </div>
  );
}
