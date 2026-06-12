import type { Metadata } from "next";
import AdminEmployerDetail from "@/components/pages/admin/AdminEmployerDetail";

export const metadata: Metadata = {
  title: "Employer",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEmployerDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminEmployerDetail employerId={id} />;
}
