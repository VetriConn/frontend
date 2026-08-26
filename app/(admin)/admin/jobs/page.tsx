import type { Metadata } from "next";
import { Suspense } from "react";
import JobsTable from "@/components/pages/admin/JobsTable";

export const metadata: Metadata = {
  title: "Jobs",
  robots: { index: false, follow: false },
};

export default function AdminJobsPage() {
  // The table reads a deep-link query param, so it needs a Suspense boundary.
  return (
    <Suspense>
      <JobsTable />
    </Suspense>
  );
}
