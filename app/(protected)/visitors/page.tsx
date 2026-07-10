import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Visitors | Invenger VMS",
};

export default function VisitorsPage() {
  return (
    <PlaceholderPage
      title="Visitors"
      description="Visitor registration and tracking will be available in the next phase."
    />
  );
}
