import type { Metadata } from "next";
import AcceptInviteForm from "@/components/pages/admin/AcceptInviteForm";

export const metadata: Metadata = {
  title: "Accept Admin Invite",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptAdminInvitePage({ params }: PageProps) {
  const { token } = await params;
  return <AcceptInviteForm token={token} />;
}
