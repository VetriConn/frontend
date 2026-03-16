"use client";

import dynamic from "next/dynamic";

const CompanyProfileSetup = dynamic(
  () => import("@/components/pages/dashboard/employer/CompanyProfileSetup"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-[600px]" />
        </div>
      </div>
    ),
  },
);

export default function CompanyProfilePage() {
  return <CompanyProfileSetup />;
}
