import type { Metadata } from "next";
import CompanyProfile from "@/components/pages/companies/CompanyProfile";

export const metadata: Metadata = {
  title: "Company Profile",
  // The public copy at /companies/[id] is the one crawlers should find. This
  // is the same page inside the dashboard chrome, so indexing it would put
  // two URLs for one company in front of a search engine.
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * The company's own profile, seen from inside the dashboard.
 *
 * The team reached this through "View public profile" on the workspace, which
 * pointed at /companies/[id] and threw them out of the dashboard onto the
 * marketing site - header, footer and all - with no way back except the browser
 * button. Same component, same data, dashboard chrome: they see what a
 * candidate sees without leaving the place they were working.
 *
 * No server prefetch here, unlike the public route. That one carries the ISR
 * bundle because crawlers and cold first paints need real content in the HTML;
 * this one is behind AuthGuard, never indexed, and always reached by a member
 * whose cookie the client fetch already has.
 */
export default async function DashboardCompanyProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <CompanyProfile companyId={id} />;
}
