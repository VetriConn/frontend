import type { Metadata } from "next";
import CompanyWorkspace from "@/components/pages/companies/CompanyWorkspace";

export const metadata: Metadata = {
  title: "Manage Company",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params;
  return <CompanyWorkspace companyId={id} />;
}
