import type { Metadata } from "next";

import { VisitorEditContent } from "@/features/visitors/components";

export const metadata: Metadata = {
  title: "Edit Visitor | Invenger VMS",
};

export default async function EditVisitorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VisitorEditContent visitorId={id} />;
}
