"use client";
import React from "react";
import Link from "next/link";
import JobDescriptor from "@/components/ui/JobDescriptor";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
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

  let content: React.ReactNode = null;
  if (isLoading && !displayJob) {
    content = <JobDetailSkeleton />;
  } else if (isError && !displayJob) {
    content = (
      <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-6">
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
  } else if (displayJob) {
    content = <JobDescriptor {...displayJob} />;
  }

  // The branded header (Vetriconn logo + auth-aware nav) and footer wrap every
  // state, so a job — including one opened from a shared link — is recognisably
  // Vetriconn at a glance, matching the /jobs browse page.
  return (
    <>
      <Header />
      {content}
      <Footer />
    </>
  );
}
