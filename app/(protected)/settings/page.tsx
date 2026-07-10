import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Settings | Invenger VMS",
};

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="System configuration will be available in a future phase."
    />
  );
}
