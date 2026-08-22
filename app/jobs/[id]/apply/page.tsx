"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useJob } from "@/hooks/useJob";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useParams, useRouter } from "next/navigation";
import DashboardNavbar from "@/components/ui/DashboardNavbar";
import { getExternalApplyUrl } from "@/lib/job-display";
import { withReturnUrl } from "@/lib/auth-redirect";

// Lazy load the heavy job application form
const JobApplicationForm = dynamic(
  () => import("@/components/pages/jobs/JobApplicationForm"),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="h-4 w-32 bg-gray-200 rounded animate-shimmer mb-6" />
          <div className="h-8 w-72 bg-gray-200 rounded animate-shimmer mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-shimmer mb-8" />
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-10 w-full bg-gray-100 rounded-lg animate-shimmer" />
          </div>
        </div>
      </div>
    ),
  }
);

export default function ApplyPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { job, isLoading: jobLoading, isError: jobError } = useJob(jobId);
  const { userProfile, isLoading: profileLoading } = useUserProfile();

  const displayJob = job;
  const isLoading = jobLoading || profileLoading;
  const router = useRouter();

  /**
   * The button that leads here is gated, but the URL is public — and the
   * external branch below redirects off-site before any of the form's own
   * checks run. Gating the page too means the gate cannot be walked around by
   * typing the address or following a shared link.
   */
  useEffect(() => {
    if (profileLoading || userProfile) return;
    router.replace(withReturnUrl("/signin", `/jobs/${jobId}/apply`));
  }, [profileLoading, userProfile, jobId, router]);

  if (!profileLoading && !userProfile) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <p className="text-sm text-gray-500">Taking you to sign in…</p>
        </div>
      </>
    );
  }

  // Jobs that are applied for elsewhere never reach our application form:
  // employer postings with an external process, and aggregated listings whose
  // real posting lives on the source board. Submitting our form for an
  // aggregated listing would save an application no employer ever receives.
  const externalApplyUrl = displayJob
    ? getExternalApplyUrl(displayJob)
    : null;

  if (externalApplyUrl) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Apply on the employer&apos;s website
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This role uses the employer&apos;s own application process —
              we&apos;ll take you there to finish applying.
            </p>
            <a
              href={externalApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors text-center no-underline mb-3"
            >
              Continue to Application
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
