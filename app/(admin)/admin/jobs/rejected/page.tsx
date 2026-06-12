import type { Metadata } from "next";
import RejectedJobsTable from "@/components/pages/admin/RejectedJobsTable";

export const metadata: Metadata = {
  title: "Rejected Jobs",
  robots: { index: false, follow: false },
};

export default function AdminRejectedJobsPage() {
  return <RejectedJobsTable />;
}
