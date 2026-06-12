import type { Metadata } from "next";
import JobReviewQueue from "@/components/pages/admin/JobReviewQueue";

export const metadata: Metadata = {
  title: "Pending Jobs",
  robots: { index: false, follow: false },
};

export default function AdminPendingJobsPage() {
  return <JobReviewQueue status="pending" />;
}
