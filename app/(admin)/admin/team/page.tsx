import type { Metadata } from "next";
import AdminTeam from "@/components/pages/admin/AdminTeam";

export const metadata: Metadata = {
  title: "Admin Team",
  robots: { index: false, follow: false },
};

export default function AdminTeamPage() {
  return <AdminTeam />;
}
