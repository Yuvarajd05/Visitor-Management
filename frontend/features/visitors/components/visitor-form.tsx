"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";

import { ID_PROOF_TYPES } from "@/types/visitor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createVisitorSchema,
  type CreateVisitorFormValues,
} from "@/utils/validation/visitor";

type VisitorFormMode = "create" | "edit";

interface VisitorFormProps {
  mode: VisitorFormMode;
  defaultValues?: Partial<CreateVisitorFormValues>;
  onSubmit: (values: CreateVisitorFormValues) => Promise<void>;
  onCancel: () => void;
}

const emptyValues: CreateVisitorFormValues = {
  fullName: "",
  phone: "",
  company: "",
  purpose: "",
  personToMeet: "",
  idProofType: undefined,
  idProofNumber: "",
  vehicleNumber: "",
};

export function VisitorForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: VisitorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateVisitorFormValues>({
    resolver: zodResolver(createVisitorSchema) as Resolver<CreateVisitorFormValues>,
    defaultValues: {
      ...emptyValues,
      ...defaultValues,
    },
  });

  const idProofType = watch("idProofType");

  async function handleFormSubmit(values: CreateVisitorFormValues) {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    reset({
      ...emptyValues,
      ...defaultValues,
    });
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>
          {isEdit ? "Edit Visitor" : "Register Visitor"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Update visitor details. Visitor code and check-in time cannot be changed."
            : "Enter visitor details to register a new check-in."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName")}
              />
              {errors.fullName ? (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="10-digit mobile number"
                maxLength={10}
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="Company name"
                aria-invalid={Boolean(errors.company)}
                {...register("company")}
              />
              {errors.company ? (
                <p className="text-sm text-destructive">
                  {errors.company.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="personToMeet">Person To Meet *</Label>
              <Input
                id="personToMeet"
                placeholder="Host name"
                aria-invalid={Boolean(errors.personToMeet)}
                {...register("personToMeet")}
              />
              {errors.personToMeet ? (
                <p className="text-sm text-destructive">
                  {errors.personToMeet.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Input
                id="purpose"
                placeholder="Reason for visit"
                aria-invalid={Boolean(errors.purpose)}
                {...register("purpose")}
              />
              {errors.purpose ? (
                <p className="text-sm text-destructive">
                  {errors.purpose.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idProofType">ID Proof Type</Label>
              <Select
                value={idProofType ?? ""}
                onValueChange={(value) =>
                  setValue(
                    "idProofType",
                    value === ""
                      ? undefined
                      : (value as CreateVisitorFormValues["idProofType"]),
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger id="idProofType" className="w-full">
                  <SelectValue placeholder="Select ID proof type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not provided</SelectItem>
                  {ID_PROOF_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idProofType ? (
                <p className="text-sm text-destructive">
                  {errors.idProofType.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idProofNumber">ID Proof Number</Label>
              <Input
                id="idProofNumber"
                placeholder="ID proof number (optional)"
                aria-invalid={Boolean(errors.idProofNumber)}
                {...register("idProofNumber")}
              />
              {errors.idProofNumber ? (
                <p className="text-sm text-destructive">
                  {errors.idProofNumber.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                placeholder="Vehicle number (optional)"
                aria-invalid={Boolean(errors.vehicleNumber)}
                {...register("vehicleNumber")}
              />
              {errors.vehicleNumber ? (
                <p className="text-sm text-destructive">
                  {errors.vehicleNumber.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
