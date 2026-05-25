import type { Metadata } from "next";
import ApprovedJobsTable from "@/components/pages/admin/ApprovedJobsTable";

export const metadata: Metadata = {
  title: "Approved Jobs",
  robots: { index: false, follow: false },
};

export default function AdminApprovedJobsPage() {
  return <ApprovedJobsTable />;
}
