import type { Metadata } from "next";
import EmployerManagement from "@/components/pages/admin/EmployerManagement";

export const metadata: Metadata = {
  title: "Employer Management",
  robots: { index: false, follow: false },
};

export default function AdminEmployersPage() {
  return <EmployerManagement />;
}
