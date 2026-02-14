"use client";
import React from "react";
import Link from "next/link";
import { useJob } from "@/hooks/useJob";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useParams } from "next/navigation";
import DashboardNavbar from "@/components/ui/DashboardNavbar";
import JobApplicationForm from "@/components/pages/jobs/JobApplicationForm";
import { getDummyJob } from "@/lib/dummy-jobs";

export default function ApplyPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { job, isLoading: jobLoading, isError: jobError } = useJob(jobId);
  const { userProfile, isLoading: profileLoading } = useUserProfile();

  // Use API data or fall back to dummy data for UI development
  const displayJob = job || getDummyJob(jobId);
  const isLoading = jobLoading || profileLoading;

  // If job has an external application link, redirect them back
  if (displayJob?.applicationLink) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              External Application
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This job uses an external application process. You&apos;ll be
              redirected to the employer&apos;s website.
            </p>
            <a
              href={displayJob.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors text-center no-underline mb-3"
            >
              Apply on External Site
            </a>
            <Link
              href={`/jobs/${jobId}`}
              className="block text-sm text-gray-500 hover:text-gray-700 no-underline"
            >
              ← Back to job details
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-6 py-8">
            {/* Back link skeleton */}
            <div className="h-4 w-32 bg-gray-200 rounded animate-shimmer mb-6" />

            {/* Title skeleton */}
            <div className="h-8 w-72 bg-gray-200 rounded animate-shimmer mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-shimmer mb-8" />

            {/* Progress bar skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <div className="h-4 w-36 bg-gray-200 rounded animate-shimmer" />
                <div className="h-3 w-40 bg-gray-200 rounded animate-shimmer" />
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full" />
            </div>

            {/* Job card skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-shimmer" />
                <div>
                  <div className="h-5 w-52 bg-gray-200 rounded animate-shimmer mb-2" />
                  <div className="h-4 w-36 bg-gray-200 rounded animate-shimmer mb-2" />
                  <div className="h-3 w-48 bg-gray-200 rounded animate-shimmer" />
                </div>
              </div>
            </div>

            {/* Section skeletons */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
              >
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-shimmer" />
                  <div>
                    <div className="h-5 w-44 bg-gray-200 rounded animate-shimmer mb-2" />
                    <div className="h-3 w-64 bg-gray-200 rounded animate-shimmer" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-10 w-full bg-gray-100 rounded-lg animate-shimmer" />
                  <div className="h-10 w-full bg-gray-100 rounded-lg animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (jobError && !displayJob) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Job Not Found
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              The job you&apos;re trying to apply for doesn&apos;t exist or has
              been removed.
            </p>
            <Link
              href="/dashboard/jobs"
              className="text-primary font-medium hover:underline no-underline"
            >
              ← Browse Jobs
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!displayJob) return null;

  return (
    <>
      <DashboardNavbar />
      <JobApplicationForm job={displayJob} userProfile={userProfile} />
    </>
  );
}
