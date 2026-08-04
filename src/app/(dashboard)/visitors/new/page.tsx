import type { Metadata } from "next";

import { VisitorNewContent } from "@/features/visitors/components";

export const metadata: Metadata = {
  title: "Register Visitor | Invenger VMS",
};

export default function NewVisitorPage() {
  return <VisitorNewContent />;
}
