"use client";
import React from "react";
import Link from "next/link";
import JobDescriptor from "@/components/ui/JobDescriptor";
import { useJob } from "@/hooks/useJob";
import { Job } from "@/types/job";
import { JobDetailSkeleton } from "@/components/ui/Skeleton";

interface JobDetailClientProps {
  jobId: string;
  initialJob: Job | null;
}

export default function JobDetailClient({
  jobId,
  initialJob,
}: JobDetailClientProps) {
  const { job, isLoading, isError } = useJob(jobId);

  const displayJob = job || initialJob;

  if (isLoading && !displayJob) {
    return <JobDetailSkeleton />;
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
            href="/dashboard/find-jobs"
            className="text-primary font-medium hover:underline no-underline"
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return displayJob ? <JobDescriptor {...displayJob} /> : null;
}
