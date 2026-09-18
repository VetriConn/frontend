import type { Metadata } from "next";
import MyCompanies from "@/components/pages/companies/MyCompanies";
import CompanyTourAutoStart from "@/components/tour/CompanyTourAutoStart";

export const metadata: Metadata = {
  title: "Companies",
  robots: { index: false, follow: false },
};

export default function CompaniesPage() {
  return (
    <>
      <MyCompanies />
      {/* Runs the company tour on a first visit. The TourProvider it needs is
          already in the dashboard layout. */}
      <CompanyTourAutoStart />
    </>
  );
}
