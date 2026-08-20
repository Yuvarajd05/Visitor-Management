import type { Metadata } from "next";

import { VisitorListContent } from "@/features/visitors/components/visitor-list-content";

export const metadata: Metadata = {
  title: "Visitors | Invenger VMS",
};

function parseStatus(
  value: string | string[] | undefined,
): "ALL" | "CHECKED_IN" | "CHECKED_OUT" {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "CHECKED_IN" || raw === "CHECKED_OUT" || raw === "ALL") {
    return raw;
  }
  return "ALL";
}

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  return <VisitorListContent initialStatus={parseStatus(params.status)} />;
}
