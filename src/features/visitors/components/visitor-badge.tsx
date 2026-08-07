"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

import type { VisitorWithCreator } from "@/types/visitor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VisitorBadgeProps {
  visitor: VisitorWithCreator;
}

const COMPANY_ADDRESS =
  "WareHouse Rd, Ballalbagh, Mangaluru, Karnataka, India - 575 003";

const PAGE_STYLE_ID = "visitor-pass-page-style";

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPassTime(value: Date | string | null | undefined): string {
  const date = toDate(value);
  if (!date) {
    // Blank at check-in so security can write Out Time by hand when the visitor leaves.
    return "";
  }

  // Match Invenger pass: "06:11 pm"
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase();
}

function formatPassDate(value: Date | string | null | undefined): string {
  const date = toDate(value);
  if (!date) {
    return "—";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function FieldRow({
  label,
  value,
  uppercase = true,
}: {
  label: string;
  value?: string | null;
  uppercase?: boolean;
}) {
  const display = value?.trim() ?? "";

  return (
    <div className="grid grid-cols-[138px_14px_1fr] items-baseline text-[12.5px] leading-[1.65]">
      <span className="font-bold text-black">{label}</span>
      <span className="text-center font-bold text-black">:</span>
      <span
        className={`min-h-[1.35rem] font-bold text-black ${
          uppercase ? "uppercase tracking-[0.02em]" : ""
        }`}
      >
        {display}
      </span>
    </div>
  );
}

function setVisitorPassPageStyle(enabled: boolean) {
  const existing = document.getElementById(PAGE_STYLE_ID);

  if (!enabled) {
    existing?.remove();
    return;
  }

  const style =
    existing instanceof HTMLStyleElement
      ? existing
      : document.createElement("style");

  style.id = PAGE_STYLE_ID;
  // Envelope C5 — inset a bit so card side borders aren't clipped by the printer.
  style.textContent = `
    @media print {
      @page {
        size: C5;
        margin: 10mm;
      }
    }
  `;

  if (!existing) {
    document.head.appendChild(style);
  }
}

export function VisitorBadge({ visitor }: VisitorBadgeProps) {
  useEffect(() => {
    const afterPrint = () => {
      document.body.classList.remove("printing-visitor-pass");
      setVisitorPassPageStyle(false);
    };

    window.addEventListener("afterprint", afterPrint);

    return () => {
      window.removeEventListener("afterprint", afterPrint);
      document.body.classList.remove("printing-visitor-pass");
      setVisitorPassPageStyle(false);
    };
  }, []);

  function handlePrint() {
    setVisitorPassPageStyle(true);
    document.body.classList.add("printing-visitor-pass");
    // Keep print styles until afterprint — Chrome reflows the preview if we
    // strip page size / visibility rules while the dialog is still open.
    window.print();
  }

  const passNumber =
    visitor.visitorCode.replace(/^.*?(\d+)$/, "$1") || visitor.visitorCode;

  return (
    <Card className="border-border/80 shadow-sm print:border-0 print:shadow-none">
      <CardHeader className="print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Visitor Pass</CardTitle>
            <CardDescription>
              Prints on Envelope C5 — same format as the Invenger visitor pass.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="size-4" />
            Print Pass
          </Button>
        </div>
      </CardHeader>
      <CardContent className="print:p-0">
        <div className="visitor-pass-sheet mx-auto flex w-full max-w-[520px] flex-col items-stretch bg-white font-[Arial,Helvetica,sans-serif] text-black print:max-w-none print:bg-white">
          <div
            id="visitor-badge-print"
            className="visitor-pass-card w-full border border-black bg-white px-4 pb-3 pt-4"
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/invenger-logo.png"
                alt="Invenger"
                className="h-10 w-auto object-contain"
              />
              <p className="mt-1.5 text-[10px] leading-snug text-black">
                {COMPANY_ADDRESS}
              </p>
              <p className="mt-3 text-[18px] font-bold uppercase tracking-wide text-black">
                Visitor&apos;s Pass
              </p>
              <p className="mt-1 text-[11.5px] font-bold underline underline-offset-2">
                (Not transferable - valid for the date of issue)
              </p>
            </div>

            {/* Photo + pass meta */}
            <div className="mt-4">
              <div className="grid grid-cols-[118px_1fr] gap-4">
                <div className="flex h-[118px] w-[110px] items-center justify-center overflow-hidden border border-black bg-white">
                  {visitor.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={visitor.photoUrl}
                      alt={visitor.fullName}
                      className="h-full w-full object-cover grayscale"
                    />
                  ) : (
                    <span className="px-1 text-center text-[10px] text-neutral-500">
                      Photo
                    </span>
                  )}
                </div>

                <div className="space-y-2 pt-1 text-[13px] leading-snug">
                  <div className="flex items-start justify-between gap-2">
                    <p>
                      <span className="font-bold">No:</span>{" "}
                      <span className="font-bold">{passNumber}</span>
                    </p>
                    <p className="text-right">
                      <span className="font-bold">Date:</span>{" "}
                      <span className="font-bold">
                        {formatPassDate(visitor.checkInTime)}
                      </span>
                    </p>
                  </div>
                  <p>
                    <span className="font-bold">In Time:</span>{" "}
                    <span className="font-bold">
                      {formatPassTime(visitor.checkInTime)}
                    </span>
                  </p>
                  <p>
                    <span className="font-bold">Out Time:</span>{" "}
                    <span className="font-bold">
                      {formatPassTime(visitor.checkOutTime)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Visitor details */}
            <div className="mt-3 border-t border-black pt-3">
              <div className="space-y-0.5">
                <FieldRow label="Name" value={visitor.fullName} />
                <FieldRow label="Company/Firm" value={visitor.company} />
                <FieldRow label="Address" value={visitor.address} />
                <FieldRow
                  label="Visiting to"
                  value={visitor.personToMeet}
                  uppercase={false}
                />
                <FieldRow label="Mobile" value={visitor.phone} />
                <FieldRow
                  label="Vehicle No."
                  value={visitor.vehicleNumber?.trim() || ""}
                />
                <FieldRow label="Visiting Reason" value={visitor.purpose} />
                <FieldRow
                  label="Additional Members"
                  value={String(visitor.additionalMembers ?? 0)}
                  uppercase={false}
                />
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-4 border-t border-black pt-8">
              <div className="grid grid-cols-3 gap-4 text-center text-[11px] leading-tight">
                <div>
                  <div className="mb-2 border-b border-dashed border-black" />
                  <p>Visitor&apos;s Signature</p>
                </div>
                <div>
                  <div className="mb-2 border-b border-dashed border-black" />
                  <p>Visiting To</p>
                </div>
                <div>
                  <div className="mb-2 border-b border-dashed border-black" />
                  <p>Issued by</p>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-black" />
          </div>

          <p className="visitor-pass-note mt-2 text-center text-[10.5px] leading-snug text-black">
            Note: Please return the Pass/Badge to the security at the time of
            leaving the premises.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
