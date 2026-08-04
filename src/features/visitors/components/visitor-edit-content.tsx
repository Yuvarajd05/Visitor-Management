"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { VisitorForm } from "@/features/visitors/components/visitor-form";
import {
  fetchVisitor,
  updateVisitor,
} from "@/features/visitors/lib/visitor-api";
import { PERSON_TO_MEET_OPTIONS } from "@/types/visitor";
import type {
  CreateVisitorFormValues,
  UpdateVisitorFormValues,
} from "@/server/validation/visitor";
import { Badge } from "@/components/ui/badge";
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
    purpose: values.purpose,
    personToMeet: values.personToMeet,
    idProofType: values.idProofType ?? null,
    idProofNumber: values.idProofNumber?.trim()
      ? values.idProofNumber
      : null,
    vehicleNumber: values.vehicleNumber?.trim()
      ? values.vehicleNumber
      : null,
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
        purpose: visitor.purpose,
        personToMeet: (PERSON_TO_MEET_OPTIONS as readonly string[]).includes(
          visitor.personToMeet,
        )
          ? visitor.personToMeet
          : "",
        idProofType: visitor.idProofType as CreateVisitorFormValues["idProofType"],
        idProofNumber: visitor.idProofNumber ?? "",
        vehicleNumber: visitor.vehicleNumber ?? "",
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
      <div className="space-y-3">
        <Link
          href={`/visitors/${visitorId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to visitor details
        </Link>
        <div>
          <Badge variant="secondary" className="mb-3">
            Edit Visitor
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Edit Visitor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visitor Code: {visitorCode} (read-only)
          </p>
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
