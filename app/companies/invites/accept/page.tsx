import type { Metadata } from "next";
import { Suspense } from "react";
import AcceptCompanyInvite from "@/components/pages/companies/AcceptCompanyInvite";

export const metadata: Metadata = {
  title: "Accept Company Invite",
  robots: { index: false, follow: false },
};

/**
 * Destination for company hiring-team invite emails, which link here as
 * `/companies/invites/accept?token=…` — a query param, not a path segment.
 */
export default function AcceptCompanyInvitePage() {
  return (
    <Suspense>
      <AcceptCompanyInvite />
    </Suspense>
  );
}
