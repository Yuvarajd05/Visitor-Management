"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CarFront,
  IdCard,
  Loader2,
  UserRound,
  Users,
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import {
  ID_PROOF_TYPES,
  PERSON_TO_MEET_OPTIONS,
  PERSON_TO_MEET_OTHER_OPTION,
  PURPOSE_OTHER_OPTION,
  VEHICLE_TYPE_OPTIONS,
  VEHICLE_TYPE_OTHER_OPTION,
  VISITING_PURPOSE_OPTIONS,
  type VisitorPhoneLookupMatch,
} from "@/types/visitor";
import { VisitorPhotoCapture } from "@/features/visitors/components/visitor-photo-capture";
import { lookupVisitorsByPhone } from "@/features/visitors/lib/visitor-api";
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
import { PhoneInput } from "@/components/ui/phone-input";
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
} from "@/server/validation/visitor";
import { formatDateTime } from "@/lib/date";
import { parsePhoneValue, phonesMatch } from "@/lib/country-codes";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/server/utils/errors";

const ID_PROOF_NONE = "None";
const VEHICLE_TYPE_NONE = "None";
const ADDITIONAL_MEMBERS_OPTIONS = Array.from({ length: 11 }, (_, i) => i);

type VisitorFormMode = "create" | "edit";

interface VisitorFormProps {
  mode: VisitorFormMode;
  defaultValues?: Partial<CreateVisitorFormValues>;
  existingPhotoUrl?: string | null;
  onSubmit: (values: CreateVisitorFormValues) => Promise<void>;
  onCancel: () => void;
  onExistingPhotoCleared?: () => void;
}

const emptyValues: CreateVisitorFormValues = {
  fullName: "",
  phone: "",
  company: "",
  address: "",
  purpose: "",
  personToMeet: "",
  idProofType: undefined,
  idProofNumber: "",
  vehicleType: undefined,
  vehicleNumber: "",
  additionalMembers: 0,
  photoDataUrl: undefined,
  reusePhotoFromVisitorId: undefined,
};

function resolvePurposeChoice(purpose: string | undefined): string | null {
  if (!purpose) {
    return null;
  }

  if ((VISITING_PURPOSE_OPTIONS as readonly string[]).includes(purpose)) {
    return purpose;
  }

  return PURPOSE_OTHER_OPTION;
}

function resolveOtherPurpose(purpose: string | undefined): string {
  if (!purpose) {
    return "";
  }

  if ((VISITING_PURPOSE_OPTIONS as readonly string[]).includes(purpose)) {
    return "";
  }

  return purpose;
}

function resolvePersonToMeetChoice(
  personToMeet: string | undefined,
): string | null {
  if (!personToMeet) {
    return null;
  }

  if ((PERSON_TO_MEET_OPTIONS as readonly string[]).includes(personToMeet)) {
    return personToMeet;
  }

  return PERSON_TO_MEET_OTHER_OPTION;
}

function resolveOtherPersonToMeet(personToMeet: string | undefined): string {
  if (!personToMeet) {
    return "";
  }

  if ((PERSON_TO_MEET_OPTIONS as readonly string[]).includes(personToMeet)) {
    return "";
  }

  return personToMeet;
}

function resolveVehicleTypeChoice(vehicleType: string | undefined): string {
  if (!vehicleType) {
    return VEHICLE_TYPE_NONE;
  }

  if ((VEHICLE_TYPE_OPTIONS as readonly string[]).includes(vehicleType)) {
    return vehicleType;
  }

  return VEHICLE_TYPE_OTHER_OPTION;
}

function resolveOtherVehicleType(vehicleType: string | undefined): string {
  if (!vehicleType) {
    return "";
  }

  if ((VEHICLE_TYPE_OPTIONS as readonly string[]).includes(vehicleType)) {
    return "";
  }

  return vehicleType;
}

function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/70 bg-slate-50/60 p-4 md:p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3 border-b border-border/60 pb-3">
        <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function VisitorForm({
  mode,
  defaultValues,
  existingPhotoUrl,
  onSubmit,
  onCancel,
  onExistingPhotoCleared,
}: VisitorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = mode === "edit";
  const initialPurpose = defaultValues?.purpose;
  const initialPersonToMeet = defaultValues?.personToMeet;
  const initialVehicleType = defaultValues?.vehicleType;
  const [purposeChoice, setPurposeChoice] = useState(
    resolvePurposeChoice(initialPurpose),
  );
  const [otherPurpose, setOtherPurpose] = useState(
    resolveOtherPurpose(initialPurpose),
  );
  const [personToMeetChoice, setPersonToMeetChoice] = useState(
    resolvePersonToMeetChoice(initialPersonToMeet),
  );
  const [otherPersonToMeet, setOtherPersonToMeet] = useState(
    resolveOtherPersonToMeet(initialPersonToMeet),
  );
  const [vehicleTypeChoice, setVehicleTypeChoice] = useState(
    resolveVehicleTypeChoice(initialVehicleType),
  );
  const [otherVehicleType, setOtherVehicleType] = useState(
    resolveOtherVehicleType(initialVehicleType),
  );
  const [phoneMatches, setPhoneMatches] = useState<VisitorPhoneLookupMatch[]>(
    [],
  );
  const [isLookingUpPhone, setIsLookingUpPhone] = useState(false);
  const [pendingConfirmMatch, setPendingConfirmMatch] =
    useState<VisitorPhoneLookupMatch | null>(null);
  const [appliedMatch, setAppliedMatch] =
    useState<VisitorPhoneLookupMatch | null>(null);
  const [reusedPhotoUrl, setReusedPhotoUrl] = useState<string | null>(null);
  const [dismissedMatchId, setDismissedMatchId] = useState<string | null>(null);
  const lookupRequestId = useRef(0);

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
  const photoDataUrl = watch("photoDataUrl");
  const phone = watch("phone");
  const additionalMembers = watch("additionalMembers") ?? 0;
  const photoPreviewUrl = existingPhotoUrl ?? reusedPhotoUrl;

  function applyReturningVisitor(match: VisitorPhoneLookupMatch) {
    setValue("fullName", match.fullName, { shouldValidate: true });
    // Normalize legacy 10-digit phones to E.164 so the form matches new entries.
    setValue("phone", parsePhoneValue(match.phone).e164 || match.phone, {
      shouldValidate: true,
    });
    setValue("company", match.company ?? "", { shouldValidate: true });
    setValue("address", match.address ?? "", { shouldValidate: true });

    const safeIdProofType =
      match.idProofType &&
      (ID_PROOF_TYPES as readonly string[]).includes(match.idProofType)
        ? (match.idProofType as CreateVisitorFormValues["idProofType"])
        : undefined;
    setValue("idProofType", safeIdProofType, { shouldValidate: true });
    setValue("idProofNumber", match.idProofNumber ?? "", {
      shouldValidate: true,
    });
    setValue("vehicleNumber", match.vehicleNumber ?? "", {
      shouldValidate: true,
    });
    setValue("additionalMembers", match.additionalMembers ?? 0, {
      shouldValidate: true,
    });
    setValue("photoDataUrl", undefined, { shouldValidate: true });

    const purposeChoiceResolved =
      resolvePurposeChoice(match.purpose) ?? PURPOSE_OTHER_OPTION;
    const otherPurposeResolved = resolveOtherPurpose(match.purpose);
    applyPurposeChoice(purposeChoiceResolved, otherPurposeResolved);
    if (purposeChoiceResolved === PURPOSE_OTHER_OPTION) {
      setOtherPurpose(otherPurposeResolved);
      setValue("purpose", match.purpose, { shouldValidate: true });
    }

    const personChoiceResolved =
      resolvePersonToMeetChoice(match.personToMeet) ??
      PERSON_TO_MEET_OTHER_OPTION;
    const otherPersonResolved = resolveOtherPersonToMeet(match.personToMeet);
    applyPersonToMeetChoice(personChoiceResolved, otherPersonResolved);
    if (personChoiceResolved === PERSON_TO_MEET_OTHER_OPTION) {
      setOtherPersonToMeet(otherPersonResolved);
      setValue("personToMeet", match.personToMeet, { shouldValidate: true });
    }

    const vehicleChoiceResolved = resolveVehicleTypeChoice(
      match.vehicleType ?? undefined,
    );
    const otherVehicleResolved = resolveOtherVehicleType(
      match.vehicleType ?? undefined,
    );
    applyVehicleTypeChoice(vehicleChoiceResolved, otherVehicleResolved);
    if (vehicleChoiceResolved === VEHICLE_TYPE_OTHER_OPTION) {
      setOtherVehicleType(otherVehicleResolved);
      setValue("vehicleType", match.vehicleType ?? undefined, {
        shouldValidate: true,
      });
    }

    if (match.photoUrl) {
      setReusedPhotoUrl(match.photoUrl);
      setValue("reusePhotoFromVisitorId", match.id, { shouldValidate: false });
    } else {
      setReusedPhotoUrl(null);
      setValue("reusePhotoFromVisitorId", undefined, { shouldValidate: false });
    }

    setAppliedMatch(match);
    setPendingConfirmMatch(null);
    setPhoneMatches([]);
    toast.success(`Loaded details for ${match.fullName} from a previous visit.`);
  }

  function declineReturningVisitor() {
    if (pendingConfirmMatch) {
      setDismissedMatchId(pendingConfirmMatch.id);
    }
    setPendingConfirmMatch(null);
  }

  function askToFillReturningVisitor(match: VisitorPhoneLookupMatch) {
    setPendingConfirmMatch(match);
  }

  useEffect(() => {
    if (!defaultValues?.purpose) {
      return;
    }

    setPurposeChoice(resolvePurposeChoice(defaultValues.purpose));
    setOtherPurpose(resolveOtherPurpose(defaultValues.purpose));
  }, [defaultValues?.purpose]);

  useEffect(() => {
    if (!defaultValues?.personToMeet) {
      return;
    }

    setPersonToMeetChoice(
      resolvePersonToMeetChoice(defaultValues.personToMeet),
    );
    setOtherPersonToMeet(resolveOtherPersonToMeet(defaultValues.personToMeet));
  }, [defaultValues?.personToMeet]);

  useEffect(() => {
    setVehicleTypeChoice(
      resolveVehicleTypeChoice(defaultValues?.vehicleType),
    );
    setOtherVehicleType(resolveOtherVehicleType(defaultValues?.vehicleType));
  }, [defaultValues?.vehicleType]);

  useEffect(() => {
    if (isEdit) {
      return;
    }

    const digits = (phone ?? "").replace(/\D/g, "");
    if (digits.length < 4) {
      setPhoneMatches([]);
      setPendingConfirmMatch(null);
      setIsLookingUpPhone(false);
      setDismissedMatchId(null);
      return;
    }

    if (appliedMatch && phonesMatch(appliedMatch.phone, phone)) {
      return;
    }

    const requestId = ++lookupRequestId.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          setIsLookingUpPhone(true);
          const result = await lookupVisitorsByPhone(digits);
          if (requestId !== lookupRequestId.current) {
            return;
          }

          setPhoneMatches(result.matches);

          const exact = result.matches.find((match) =>
            phonesMatch(match.phone, phone),
          );
          const preferred =
            exact ??
            (result.matches.length === 1 && digits.length >= 8
              ? result.matches[0]
              : null);

          // Never autofill — only offer a Yes/No confirm prompt.
          if (
            preferred &&
            preferred.id !== dismissedMatchId &&
            appliedMatch?.id !== preferred.id &&
            pendingConfirmMatch?.id !== preferred.id
          ) {
            setPendingConfirmMatch(preferred);
          } else if (!preferred || preferred.id === dismissedMatchId) {
            if (!preferred) {
              setPendingConfirmMatch(null);
            }
          }
        } catch (error) {
          if (requestId === lookupRequestId.current) {
            setPhoneMatches([]);
            setPendingConfirmMatch(null);
            if (digits.length >= 10) {
              toast.error(getErrorMessage(error));
            }
          }
        } finally {
          if (requestId === lookupRequestId.current) {
            setIsLookingUpPhone(false);
          }
        }
      })();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, isEdit, dismissedMatchId]);

  function applyPurposeChoice(choice: string, customText = otherPurpose) {
    setPurposeChoice(choice);

    if (choice === PURPOSE_OTHER_OPTION) {
      setValue("purpose", customText.trim(), { shouldValidate: true });
      return;
    }

    setOtherPurpose("");
    setValue("purpose", choice, { shouldValidate: true });
  }

  function applyPersonToMeetChoice(
    choice: string,
    customText = otherPersonToMeet,
  ) {
    setPersonToMeetChoice(choice);

    if (choice === PERSON_TO_MEET_OTHER_OPTION) {
      setValue("personToMeet", customText.trim(), { shouldValidate: true });
      return;
    }

    setOtherPersonToMeet("");
    setValue("personToMeet", choice, { shouldValidate: true });
  }

  function applyVehicleTypeChoice(
    choice: string,
    customText = otherVehicleType,
  ) {
    if (choice === VEHICLE_TYPE_NONE) {
      setVehicleTypeChoice(VEHICLE_TYPE_NONE);
      setOtherVehicleType("");
      setValue("vehicleType", undefined, { shouldValidate: true });
      return;
    }

    setVehicleTypeChoice(choice);

    if (choice === VEHICLE_TYPE_OTHER_OPTION) {
      setValue("vehicleType", customText.trim() || undefined, {
        shouldValidate: true,
      });
      return;
    }

    setOtherVehicleType("");
    setValue("vehicleType", choice, { shouldValidate: true });
  }

  async function handleFormSubmit(values: CreateVisitorFormValues) {
    try {
      setIsSubmitting(true);
      const payload: CreateVisitorFormValues = {
        ...values,
        reusePhotoFromVisitorId:
          values.photoDataUrl || !values.reusePhotoFromVisitorId
            ? undefined
            : values.reusePhotoFromVisitorId,
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    const nextPurpose = defaultValues?.purpose;
    const nextPersonToMeet = defaultValues?.personToMeet;
    const nextVehicleType = defaultValues?.vehicleType;
    setPurposeChoice(resolvePurposeChoice(nextPurpose));
    setOtherPurpose(resolveOtherPurpose(nextPurpose));
    setPersonToMeetChoice(resolvePersonToMeetChoice(nextPersonToMeet));
    setOtherPersonToMeet(resolveOtherPersonToMeet(nextPersonToMeet));
    setVehicleTypeChoice(resolveVehicleTypeChoice(nextVehicleType));
    setOtherVehicleType(resolveOtherVehicleType(nextVehicleType));
    setPhoneMatches([]);
    setAppliedMatch(null);
    setPendingConfirmMatch(null);
    setDismissedMatchId(null);
    setReusedPhotoUrl(null);
    reset({
      ...emptyValues,
      ...defaultValues,
      reusePhotoFromVisitorId: undefined,
    });
  }

  return (
    <Card className="overflow-hidden border-border/70 bg-white/90 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-slate-50 to-blue-50/50">
        <CardTitle>
          {isEdit ? "Edit Visitor" : "Visitor details"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Update visitor details. Visitor code and check-in time cannot be changed."
            : "Start with the phone number. If the guest visited before, you can choose to fill their saved details. Required fields are marked with *."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <FormSection
            title="Visitor identity"
            description="Basic contact details for the guest"
            icon={UserRound}
          >
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                className="bg-white"
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
              <PhoneInput
                id="phone"
                value={phone}
                invalid={Boolean(errors.phone)}
                onChange={(next) => {
                  setValue("phone", next, { shouldValidate: true });
                  setDismissedMatchId(null);
                  if (appliedMatch) {
                    const nextDigits = next.replace(/\D/g, "");
                    const appliedNational = appliedMatch.phone
                      .replace(/\D/g, "")
                      .slice(-10);
                    const stillSame =
                      Boolean(nextDigits) &&
                      (phonesMatch(appliedMatch.phone, next) ||
                        appliedNational.startsWith(nextDigits) ||
                        nextDigits.endsWith(appliedNational) ||
                        appliedNational.includes(nextDigits));
                    if (!stillSame) {
                      setAppliedMatch(null);
                    }
                  }
                  if (pendingConfirmMatch) {
                    const nextDigits = next.replace(/\D/g, "");
                    const pendingNational = pendingConfirmMatch.phone
                      .replace(/\D/g, "")
                      .slice(-10);
                    const stillSame =
                      Boolean(nextDigits) &&
                      (phonesMatch(pendingConfirmMatch.phone, next) ||
                        pendingNational.startsWith(nextDigits) ||
                        nextDigits.includes(pendingNational) ||
                        pendingNational.includes(nextDigits));
                    if (!stillSame) {
                      setPendingConfirmMatch(null);
                    }
                  }
                }}
              />
              {errors.phone ? (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              ) : null}
              {!isEdit ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Type the mobile number to check for a returning visitor.
                    {isLookingUpPhone ? " Searching…" : null}
                  </p>
                  {appliedMatch ? (
                    <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-800">
                      Returning visitor loaded: <b>{appliedMatch.fullName}</b>
                      {appliedMatch.visitorCode
                        ? ` (${appliedMatch.visitorCode})`
                        : ""}
                      . Review fields and save a new check-in.
                    </p>
                  ) : null}
                  {!appliedMatch && pendingConfirmMatch ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
                      <p>
                        Found previous visitor{" "}
                        <b>{pendingConfirmMatch.fullName}</b>
                        {pendingConfirmMatch.company
                          ? ` (${pendingConfirmMatch.company})`
                          : ""}
                        .
                      </p>
                      <p className="mt-1 text-xs text-amber-900/80">
                        Last visit{" "}
                        {formatDateTime(pendingConfirmMatch.lastVisitAt)}. Fill
                        the form with their saved details?
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="bg-secondary hover:bg-secondary/90"
                          onClick={() =>
                            applyReturningVisitor(pendingConfirmMatch)
                          }
                        >
                          Yes, fill details
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={declineReturningVisitor}
                        >
                          No, enter manually
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  {!appliedMatch &&
                  !pendingConfirmMatch &&
                  phoneMatches.length > 1 ? (
                    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                      <p className="border-b border-border bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                        Multiple matches — choose one to confirm fill
                      </p>
                      <ul className="max-h-48 divide-y divide-border overflow-y-auto">
                        {phoneMatches.map((match) => (
                          <li key={match.id}>
                            <button
                              type="button"
                              className="flex w-full flex-col gap-0.5 px-2.5 py-2 text-left text-sm hover:bg-accent"
                              onClick={() => askToFillReturningVisitor(match)}
                            >
                              <span className="font-medium text-foreground">
                                {match.fullName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {match.phone}
                                {match.company ? ` · ${match.company}` : ""}
                                {" · Last visit "}
                                {formatDateTime(match.lastVisitAt)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                className="bg-white"
                placeholder="Company name (optional)"
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                className="bg-white"
                placeholder="Address (optional)"
                aria-invalid={Boolean(errors.address)}
                {...register("address")}
              />
              {errors.address ? (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              ) : null}
            </div>
          </FormSection>

          <FormSection
            title="Visit details"
            description="Who they are meeting and why"
            icon={Users}
          >
            <div className="space-y-2">
              <Label htmlFor="personToMeet">Person To Meet *</Label>
              <Select
                value={personToMeetChoice}
                onValueChange={(value) => {
                  if (value) {
                    applyPersonToMeetChoice(value);
                  }
                }}
              >
                <SelectTrigger
                  id="personToMeet"
                  className="w-full bg-white"
                  aria-invalid={Boolean(errors.personToMeet)}
                >
                  <SelectValue placeholder="Select person to meet" />
                </SelectTrigger>
                <SelectContent>
                  {PERSON_TO_MEET_OPTIONS.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                  <SelectItem value={PERSON_TO_MEET_OTHER_OPTION}>
                    Other (type name)
                  </SelectItem>
                </SelectContent>
              </Select>

              {personToMeetChoice === PERSON_TO_MEET_OTHER_OPTION ? (
                <Input
                  id="personToMeetOther"
                  className="bg-white"
                  placeholder="Type the person to meet"
                  value={otherPersonToMeet}
                  aria-invalid={Boolean(errors.personToMeet)}
                  onChange={(event) => {
                    const next = event.target.value;
                    setOtherPersonToMeet(next);
                    setValue("personToMeet", next.trim(), {
                      shouldValidate: true,
                    });
                  }}
                />
              ) : null}

              {errors.personToMeet ? (
                <p className="text-sm text-destructive">
                  {errors.personToMeet.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Visiting Reason *</Label>
              <Select
                value={purposeChoice}
                onValueChange={(value) => {
                  if (value) {
                    applyPurposeChoice(value);
                  }
                }}
              >
                <SelectTrigger
                  id="purpose"
                  className="w-full bg-white"
                  aria-invalid={Boolean(errors.purpose)}
                >
                  <SelectValue placeholder="Select visiting reason" />
                </SelectTrigger>
                <SelectContent>
                  {VISITING_PURPOSE_OPTIONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                  <SelectItem value={PURPOSE_OTHER_OPTION}>
                    Other (type reason)
                  </SelectItem>
                </SelectContent>
              </Select>

              {purposeChoice === PURPOSE_OTHER_OPTION ? (
                <Input
                  id="purposeOther"
                  className="bg-white"
                  placeholder="Type the visiting reason"
                  value={otherPurpose}
                  aria-invalid={Boolean(errors.purpose)}
                  onChange={(event) => {
                    const next = event.target.value;
                    setOtherPurpose(next);
                    setValue("purpose", next.trim(), { shouldValidate: true });
                  }}
                />
              ) : null}

              {errors.purpose ? (
                <p className="text-sm text-destructive">
                  {errors.purpose.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalMembers">Additional Members</Label>
              <Select
                value={String(additionalMembers)}
                onValueChange={(value) => {
                  if (value == null) {
                    return;
                  }
                  setValue("additionalMembers", Number(value), {
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger
                  id="additionalMembers"
                  className="w-full bg-white"
                  aria-invalid={Boolean(errors.additionalMembers)}
                >
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  {ADDITIONAL_MEMBERS_OPTIONS.map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count === 0 ? "None (0)" : String(count)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.additionalMembers ? (
                <p className="text-sm text-destructive">
                  {errors.additionalMembers.message}
                </p>
              ) : null}
            </div>
          </FormSection>

          <FormSection
            title="ID proof"
            description="Optional identification for gate records"
            icon={IdCard}
          >
            <div className="space-y-2">
              <Label htmlFor="idProofType">ID Proof Type</Label>
              <Select
                value={idProofType ?? ID_PROOF_NONE}
                onValueChange={(value) =>
                  setValue(
                    "idProofType",
                    value === ID_PROOF_NONE
                      ? undefined
                      : (value as CreateVisitorFormValues["idProofType"]),
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger id="idProofType" className="w-full bg-white">
                  <SelectValue placeholder="Select ID proof type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ID_PROOF_NONE}>None</SelectItem>
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
                className="bg-white"
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
          </FormSection>

          <FormSection
            title="Vehicle"
            description="Optional vehicle type and number"
            icon={CarFront}
          >
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select
                value={vehicleTypeChoice}
                onValueChange={(value) => {
                  if (value) {
                    applyVehicleTypeChoice(value);
                  }
                }}
              >
                <SelectTrigger
                  id="vehicleType"
                  className="w-full bg-white"
                  aria-invalid={Boolean(errors.vehicleType)}
                >
                  <SelectValue placeholder="Select vehicle type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VEHICLE_TYPE_NONE}>None</SelectItem>
                  {VEHICLE_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  <SelectItem value={VEHICLE_TYPE_OTHER_OPTION}>
                    Other (type manually)
                  </SelectItem>
                </SelectContent>
              </Select>

              {vehicleTypeChoice === VEHICLE_TYPE_OTHER_OPTION ? (
                <Input
                  id="vehicleTypeOther"
                  className="bg-white"
                  placeholder="Type the vehicle type"
                  value={otherVehicleType}
                  aria-invalid={Boolean(errors.vehicleType)}
                  onChange={(event) => {
                    const next = event.target.value;
                    setOtherVehicleType(next);
                    setValue("vehicleType", next.trim() || undefined, {
                      shouldValidate: true,
                    });
                  }}
                />
              ) : null}

              {errors.vehicleType ? (
                <p className="text-sm text-destructive">
                  {errors.vehicleType.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                className="bg-white"
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
          </FormSection>

          <section className="rounded-xl border border-border/70 bg-slate-50/60 p-4 md:p-5">
            <VisitorPhotoCapture
              value={photoDataUrl}
              existingPhotoUrl={photoPreviewUrl}
              onChange={(dataUrl) => {
                setValue("photoDataUrl", dataUrl, { shouldValidate: true });
                if (dataUrl) {
                  setValue("reusePhotoFromVisitorId", undefined, {
                    shouldValidate: false,
                  });
                  setReusedPhotoUrl(null);
                } else {
                  setReusedPhotoUrl(null);
                  setValue("reusePhotoFromVisitorId", undefined, {
                    shouldValidate: false,
                  });
                  onExistingPhotoCleared?.();
                }
              }}
            />
            {errors.photoDataUrl ? (
              <p className="mt-2 text-sm text-destructive">
                {errors.photoDataUrl.message}
              </p>
            ) : null}
          </section>

          <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-secondary shadow-sm shadow-blue-500/20 hover:bg-secondary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Register visitor"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
