import type { Metadata } from "next";
import MyCompanies from "@/components/pages/companies/MyCompanies";

export const metadata: Metadata = {
  title: "Companies",
  robots: { index: false, follow: false },
};

export default function CompaniesPage() {
  return <MyCompanies />;
}
