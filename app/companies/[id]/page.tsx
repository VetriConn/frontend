import type { Metadata } from "next";
import { cache } from "react";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import CompanyProfile from "@/components/pages/companies/CompanyProfile";
import { getCompanyById, getPublicCompanyJobs } from "@/lib/api";
import type { Company } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Server-rendered with the /jobs ISR pattern: the fetches carry
// revalidate:300, so crawlers and first paints get real content without a
// client waterfall. A failed fetch (pending company, backend down) falls back
// to the client path, where a member's cookie can still load it.
const getCompanyBundle = cache(
  async (
    id: string,
  ): Promise<{
    company: Company;
    jobs: Awaited<ReturnType<typeof getPublicCompanyJobs>> | null;
  } | null> => {
    try {
      const company = await getCompanyById(id);
      const jobs = await getPublicCompanyJobs(id).catch(() => null);
      return { company, jobs };
    } catch {
      return null;
    }
  },
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const bundle = await getCompanyBundle(id);
  if (!bundle) return { title: "Company Profile" };
  const { company } = bundle;
  return {
    title: `${company.name} | Vetriconn`,
    description:
      company.tagline ||
      company.about_company?.slice(0, 160) ||
      `Jobs and company profile for ${company.name} on Vetriconn.`,
  };
}

export default async function PublicCompanyPage({ params }: PageProps) {
  const { id } = await params;
  const bundle = await getCompanyBundle(id);

  return (
    <main id="main-content" className="max-w-screen-2xl min-w-80 mx-auto">
      <div className="sticky bg-white top-0 left-0 z-50">
        <Header />
      </div>
      <CompanyProfile
        companyId={id}
        initialCompany={bundle?.company ?? null}
        initialJobs={bundle?.jobs ?? null}
      />
      <Footer />
    </main>
  );
}
