"use client";

import dynamic from "next/dynamic";

const CreateJobPosting = dynamic(
  () => import("@/components/pages/dashboard/employer/CreateJobPosting"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[560px] mx-auto px-6 py-8">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="flex gap-4 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-[400px]" />
        </div>
      </div>
    ),
  },
);

export default function PostJobPage() {
  return <CreateJobPosting />;
}
