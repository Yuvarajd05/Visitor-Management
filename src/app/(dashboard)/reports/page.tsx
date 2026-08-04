import type { Metadata } from "next";

import { ReportsContent } from "@/features/reports/components/reports-content";

export const metadata: Metadata = {
  title: "Reports | Invenger VMS",
};

export default function ReportsPage() {
  return <ReportsContent />;
}
