import type { Metadata } from "next";

import { VisitorListContent } from "@/features/visitors/components";

export const metadata: Metadata = {
  title: "Visitors | Invenger VMS",
};

export default function VisitorsPage() {
  return <VisitorListContent />;
}
