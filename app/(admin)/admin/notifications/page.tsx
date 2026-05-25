import type { Metadata } from "next";
import AdminNotifications from "@/components/pages/admin/AdminNotifications";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default function AdminNotificationsPage() {
  return <AdminNotifications />;
}
