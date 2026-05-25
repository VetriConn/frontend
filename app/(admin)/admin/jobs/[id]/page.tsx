import type { Metadata } from "next";
import AdminJobDetail from "@/components/pages/admin/AdminJobDetail";

export const metadata: Metadata = {
  title: "Job Details",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminJobDetail jobId={id} />;
}
