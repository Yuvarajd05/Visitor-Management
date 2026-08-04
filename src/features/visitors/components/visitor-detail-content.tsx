"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LogOut, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { VisitorWithCreator } from "@/types/visitor";
import {
  VisitorBadge,
  VisitorDeleteDialog,
  VisitorStatusBadge,
} from "@/features/visitors/components";
import {
  checkoutVisitor,
  deleteVisitor,
  fetchVisitor,
} from "@/features/visitors/lib/visitor-api";
import { formatDateTime } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/server/utils/errors";

interface VisitorDetailContentProps {
  visitorId: string;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export function VisitorDetailContent({ visitorId }: VisitorDetailContentProps) {
  const router = useRouter();
  const [visitor, setVisitor] = useState<VisitorWithCreator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadVisitor = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchVisitor(visitorId);
      setVisitor(data);
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

  async function handleCheckout() {
    if (!visitor) {
      return;
    }

    try {
      setIsCheckingOut(true);
      const updated = await checkoutVisitor(visitor.id);
      setVisitor(updated);
      toast.success("Visitor checked out successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsCheckingOut(false);
    }
  }

  async function handleDelete() {
    if (!visitor) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteVisitor(visitor.id);
      toast.success("Visitor deleted successfully.");
      router.push("/visitors");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!visitor) {
    return null;
  }

  const isCheckedOut = visitor.status === "CHECKED_OUT";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 print:hidden lg:flex-row lg:items-start lg:justify-between">
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
              Visitor Details
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {visitor.fullName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Visitor Code: {visitor.visitorCode}
            </p>
          </div>
          <VisitorStatusBadge status={visitor.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/visitors/${visitor.id}/edit`}>
            <Button variant="outline">
              <Pencil className="size-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleCheckout}
            disabled={isCheckedOut || isCheckingOut}
          >
            {isCheckingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            {isCheckedOut ? "Checked Out" : "Check Out"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 print:hidden lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {visitor.photoUrl ? (
              <div className="sm:col-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visitor.photoUrl}
                  alt={visitor.fullName}
                  className="h-40 w-32 rounded-lg border object-cover"
                />
              </div>
            ) : null}
            <DetailItem label="Full Name" value={visitor.fullName} />
            <DetailItem label="Phone" value={visitor.phone} />
            <DetailItem label="Company" value={visitor.company} />
            <DetailItem label="Person To Meet" value={visitor.personToMeet} />
            <DetailItem label="Purpose" value={visitor.purpose} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identification & Visit</CardTitle>
            <CardDescription>ID proof and visit timeline</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="ID Proof Type" value={visitor.idProofType} />
            <DetailItem label="ID Proof Number" value={visitor.idProofNumber} />
            <DetailItem label="Vehicle Number" value={visitor.vehicleNumber} />
            <DetailItem
              label="Check-In Time"
              value={formatDateTime(visitor.checkInTime)}
            />
            <DetailItem
              label="Check-Out Time"
              value={formatDateTime(visitor.checkOutTime)}
            />
            <DetailItem label="Registered By" value={visitor.creator.name} />
          </CardContent>
        </Card>
      </div>

      <VisitorBadge visitor={visitor} />

      <VisitorDeleteDialog
        open={showDeleteDialog}
        visitorName={visitor.fullName}
        visitorCode={visitor.visitorCode}
        isDeleting={isDeleting}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  );
}
