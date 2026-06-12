import type { Metadata } from "next";
import UserManagement from "@/components/pages/admin/UserManagement";

export const metadata: Metadata = {
  title: "User Management",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return <UserManagement />;
}
