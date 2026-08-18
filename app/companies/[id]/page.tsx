import type { Metadata } from "next";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import CompanyProfile from "@/components/pages/companies/CompanyProfile";

export const metadata: Metadata = {
  title: "Company Profile",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicCompanyPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="max-w-screen-2xl min-w-80 mx-auto">
      <div className="sticky bg-white top-0 left-0 z-50">
        <Header />
      </div>
      <CompanyProfile companyId={id} />
      <Footer />
    </main>
  );
}
