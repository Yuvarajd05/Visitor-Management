import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Users | Invenger VMS",
};

export default function UsersPage() {
  return (
    <PlaceholderPage
      title="Users"
      description="User administration will be available in a future phase."
    />
  );
}
