import type { Metadata } from "next";

import { VisitorListContent } from "@/features/visitors/components/visitor-list-content";

export const metadata: Metadata = {
  title: "Visitors | Invenger VMS",
};

export default function VisitorsPage() {
  return <VisitorListContent />;
}
