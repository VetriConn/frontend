import type { Metadata } from "next";
import CommunityModeration from "@/components/pages/admin/CommunityModeration";

export const metadata: Metadata = {
  title: "Community Moderation",
  robots: { index: false, follow: false },
};

export default function AdminCommunityPage() {
  return <CommunityModeration />;
}
