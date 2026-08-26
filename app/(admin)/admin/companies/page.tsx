import type { Metadata } from "next";
import { Suspense } from "react";
import CompanyReviewQueue from "@/components/pages/admin/CompanyReviewQueue";

export const metadata: Metadata = {
  title: "Companies",
  robots: { index: false, follow: false },
};

export default function AdminCompaniesPage() {
  // The table reads a deep-link query param, so it needs a Suspense boundary.
  return (
    <Suspense>
      <CompanyReviewQueue />
    </Suspense>
  );
}
