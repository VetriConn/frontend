"use client";
import React from "react";
import Link from "next/link";
import JobDescriptor from "@/components/ui/JobDescriptor";
import { useJob } from "@/hooks/useJob";
import { Job } from "@/types/job";
import { getDummyJob } from "@/lib/dummy-jobs";

interface JobDetailClientProps {
  jobId: string;
  initialJob: Job | null;
}

export default function JobDetailClient({
  jobId,
  initialJob,
}: JobDetailClientProps) {
  const { job, isLoading, isError } = useJob(jobId);

  // Use API data → server pre-fetched data → dummy fallback
  const displayJob = job || initialJob || getDummyJob(jobId);

  if (isLoading && !displayJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-10 bg-gray-200 rounded animate-shimmer" />
            <div className="h-4 w-4 bg-gray-200 rounded animate-shimmer" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-shimmer" />
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-shimmer mb-8" />

          <div className="flex gap-8">
            {/* Main content skeleton */}
            <div className="flex-1">
              <div className="flex gap-2 mb-5">
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-shimmer" />
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-shimmer" />
              </div>
              <div className="h-10 w-3/4 bg-gray-200 rounded animate-shimmer mb-3" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-shimmer" />
                <div>
                  <div className="h-4 w-28 bg-gray-200 rounded animate-shimmer mb-1" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-shimmer" />
                </div>
              </div>
              <div className="flex gap-3 mb-8 pb-8 border-b border-gray-200">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-36 bg-gray-200 rounded-lg animate-shimmer"
                  />
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-6 w-40 bg-gray-200 rounded animate-shimmer" />
                <div className="h-4 w-full bg-gray-200 rounded animate-shimmer" />
                <div className="h-4 w-full bg-gray-200 rounded animate-shimmer" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-shimmer" />
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="w-80 shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="h-5 w-28 bg-gray-200 rounded animate-shimmer mb-5" />
                <div className="space-y-4 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-shimmer" />
                      <div>
                        <div className="h-3 w-16 bg-gray-200 rounded animate-shimmer mb-1" />
                        <div className="h-4 w-24 bg-gray-200 rounded animate-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-11 w-full bg-gray-200 rounded-lg animate-shimmer mb-3" />
                <div className="h-11 w-full bg-gray-200 rounded-lg animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError && !displayJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Job Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            The job you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/dashboard/jobs"
            className="text-primary font-medium hover:underline no-underline"
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return <JobDescriptor {...displayJob} />;
}
