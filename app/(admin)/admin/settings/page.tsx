import type { Metadata } from "next";
import AdminSettingsPage from "@/components/pages/admin/AdminSettingsPage";

export const metadata: Metadata = {
  title: "Admin Settings",
  robots: { index: false, follow: false },
};

export default function AdminSettings() {
  return <AdminSettingsPage />;
}
