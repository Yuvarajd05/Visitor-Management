import type { Metadata } from "next";

import { VisitorDetailContent } from "@/features/visitors/components";

export const metadata: Metadata = {
  title: "Visitor Details | Invenger VMS",
};

export default async function VisitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VisitorDetailContent visitorId={id} />;
}
