import type { Metadata } from "next";

import { VisitorDetailContent } from "@/features/visitors/components";

export const metadata: Metadata = {
  title: "Visitor Details | Invenger VMS",
};

export default async function VisitorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  return (
    <VisitorDetailContent
      visitorId={id}
      autoPrint={query.print === "1"}
    />
  );
}
