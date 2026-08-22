import type { Metadata } from "next";
import CompanyApplicationForm from "@/components/pages/companies/CompanyApplicationForm";

export const metadata: Metadata = {
  title: "Apply for a Company Page",
  robots: { index: false, follow: false },
};

export default function CompanyApplyPage() {
  return <CompanyApplicationForm />;
}
