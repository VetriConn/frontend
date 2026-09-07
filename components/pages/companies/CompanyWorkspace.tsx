"use client";

import Link from "next/link";
import { HiOutlineBriefcase } from "react-icons/hi2";
import { useCompany, useCompanyJobs } from "@/hooks/useCompanies";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getMyRole } from "@/lib/api";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import CompanyProfileEditor from "./CompanyProfileEditor";
import CompanyTeam from "./CompanyTeam";

/**
 * Everything for one company in a single page: profile, hiring team, and the
 * jobs posted under it. Recruiters see the same page with editing disabled.
 */
export const CompanyWorkspace = ({ companyId }: { companyId: string }) => {
  const { company, isLoading, isError, error, mutate } = useCompany(companyId);
  const { jobs, isLoading: jobsLoading } = useCompanyJobs(companyId);
  const { userProfile } = useUserProfile();

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !company) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            We couldn&apos;t open this company
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {error instanceof Error
              ? error.message
              : "It may have been removed, or you may no longer be a member."}
          </p>
          <Link
            href="/dashboard/companies"
            className="text-primary font-medium hover:underline no-underline"
          >
            ← Back to companies
          </Link>
        </div>
      </div>
    );
  }

  const myRole = getMyRole(company, userProfile?.id);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <Link
        href="/dashboard/companies"
        className="text-sm text-gray-500 hover:text-gray-700 no-underline mb-6 inline-block"
      >
        ← Back to companies
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        {company.name}
      </h1>

      {company.status === "suspended" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-900 mb-1">
            This company is suspended
          </h2>
          <p className="text-sm text-amber-800 leading-relaxed">
            Your listings are off the board and new postings are paused
            {company.suspension_reason
              ? ` - reason given: ${company.suspension_reason}`
              : ""}
            . If you believe this is a mistake, write to us through the{" "}
            <Link href="/#contact-section" className="underline">
              contact form
            </Link>{" "}
            and our team will take another look.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <CompanyProfileEditor
          company={company}
          myRole={myRole}
          onChanged={mutate}
        />

        <CompanyTeam
          company={company}
          myRole={myRole}
          myUserId={userProfile?.id}
          onChanged={mutate}
        />

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Jobs posted as {company.name}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            These stay with the company, not with whoever posted them.
          </p>

          {jobsLoading && (
            <p className="text-sm text-gray-400 py-2">Loading jobs…</p>
          )}

          {!jobsLoading && jobs.length === 0 && (
            <div className="text-center py-6">
              <HiOutlineBriefcase className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">
                No jobs posted under this company yet.
              </p>
              <Link
                href="/dashboard/post-job"
                className="inline-block py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline"
              >
                Post a job
              </Link>
            </div>
          )}

          <ul className="flex flex-col divide-y divide-gray-100">
            {jobs.map((job) => {
              // Same standing logic as My Postings - this list used to hide
              // status entirely and link to the candidate-facing page, so a
              // pending or held listing looked identical to a live one.
              const moderation = job.moderation_status ?? "pending";
              const badge =
                job.status === "draft"
                  ? { label: "Draft", cls: "bg-gray-100 text-gray-600" }
                  : moderation === "rejected"
                    ? { label: "Rejected", cls: "bg-rose-50 text-rose-700" }
                    : job.unpublished_reason === "company_suspended"
                      ? { label: "On hold", cls: "bg-amber-50 text-amber-700" }
                      : moderation === "approved"
                        ? { label: "Published", cls: "bg-green-50 text-green-700" }
                        : { label: "Awaiting approval", cls: "bg-yellow-50 text-yellow-700" };
              return (
                <li
                  key={job._id}
                  className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <Link
                      href="/dashboard/postings"
                      className="text-sm font-medium text-gray-900 hover:text-primary no-underline"
                    >
                      {job.role}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {job.location || "Location not set"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default CompanyWorkspace;
