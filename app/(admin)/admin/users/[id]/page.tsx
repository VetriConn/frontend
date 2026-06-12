import type { Metadata } from "next";
import AdminUserDetail from "@/components/pages/admin/AdminUserDetail";

export const metadata: Metadata = {
  title: "User",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminUserDetail userId={id} />;
}
