"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBookmarkSlash,
  HiOutlineBookmark,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
} from "react-icons/hi2";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { RoleGuard } from "@/components/auth/RoleGuard";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SavedJob {
  id: string;
  role: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  savedDate: string;
}

// ─── Empty State ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <HiOutlineBookmark className="w-9 h-9 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        You haven&apos;t saved any jobs yet
      </h3>
      <p className="text-sm text-gray-500 max-w-95 leading-relaxed mb-8">
        Browse jobs and save ones you&apos;d like to apply for later. Your saved
        jobs will appear here for easy access.
      </p>
      <Link
        href="/dashboard/job-seeker/jobs"
        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
      >
        <HiOutlineMagnifyingGlass className="text-base" />
        Browse Jobs
      </Link>
    </div>
  );
}

// ─── Saved Job Card (Mobile View) ───────────────────────────────────────────────

function SavedJobCard({
  job,
  onRemove,
}: {
  job: SavedJob;
  onRemove: (id: string) => Promise<void>;
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
      <div className="space-y-3">
        {/* Position */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Position</div>
          <div className="text-sm font-semibold text-gray-900">{job.role}</div>
        </div>

        {/* Company */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Company</div>
          <div className="flex items-center gap-1.5 text-sm text-gray-900">
            <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400" />
            {job.company}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Location</div>
          <div className="flex items-center gap-1.5 text-sm text-gray-900">
            <HiOutlineMapPin className="w-4 h-4 text-gray-400" />
            {job.location}
          </div>
        </div>

        {/* Job Type */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Type</div>
          <div className="flex items-center gap-1.5 text-sm text-gray-900">
            <HiOutlineClock className="w-4 h-4 text-gray-400" />
            {job.jobType}
          </div>
        </div>

        {/* Salary */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Salary</div>
          <div className="flex items-center gap-1.5 text-sm text-gray-900">
            <HiOutlineCurrencyDollar className="w-4 h-4 text-gray-400" />
            {job.salary}
          </div>
        </div>

        {/* Saved Date */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Saved</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <HiOutlineCalendarDays className="w-3.5 h-3.5" />
            {job.savedDate}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-2">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-44 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline"
        >
          <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
          Apply Now
        </Link>

        {showConfirmDelete ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRemove(job.id)}
              className="flex-1 px-4 py-2 min-h-44 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Remove
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="flex-1 px-4 py-2 min-h-44 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-44 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <HiOutlineBookmarkSlash className="w-4 h-4" />
            Remove from Saved
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function SavedJobsPage() {
  const { savedJobs: data, isLoading, removeSavedJob } = useSavedJobs();

  const savedJobs: SavedJob[] = (data || []).map((job) => {
    const salary = job.salary_range?.start_salary?.number
      ? `${job.salary?.symbol || "$"}${Math.round((job.salary_range.start_salary.number || 0) / 1000)}k - ${job.salary?.symbol || "$"}${Math.round((job.salary_range.end_salary.number || 0) / 1000)}k/year`
      : job.salary?.number
        ? `${job.salary.symbol}${Math.round(job.salary.number / 1000)}k/year`
        : "Competitive";

    return {
      id: job.id || job._id,
      role: job.role,
      company: job.company_name,
      location: job.location || "Canada",
      jobType: "Flexible",
      salary,
      savedDate: "Recently",
    };
  });

  const handleRemove = async (id: string) => {
    await removeSavedJob(id);
  };

  if (isLoading) {
    return (
      <div className="max-w-200 mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-shimmer mb-4" />
        <div className="h-4 w-72 bg-gray-200 rounded animate-shimmer mb-8" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["job_seeker"]}>
      <div className="max-w-200 mx-auto">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="font-lato text-xl md:text-3xl font-bold text-gray-900">
            Saved Jobs
          </h1>
          {savedJobs.length > 0 && (
            <span className="text-sm text-gray-400 mt-2">
              {savedJobs.length} job{savedJobs.length !== 1 && "s"} saved
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Jobs you&apos;ve saved to review or apply for later. Take your time —
          there&apos;s no rush.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8" />

        {/* Content */}
        {savedJobs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Salary
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {savedJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {job.role}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900">
                          <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400" />
                          {job.company}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900">
                          <HiOutlineMapPin className="w-4 h-4 text-gray-400" />
                          {job.location}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900">
                          <HiOutlineClock className="w-4 h-4 text-gray-400" />
                          {job.jobType}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900">
                          <HiOutlineCurrencyDollar className="w-4 h-4 text-gray-400" />
                          {job.salary}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="p-2 min-h-44 min-w-44 text-primary hover:text-primary-hover hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                            aria-label="Apply to job"
                          >
                            <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleRemove(job.id)}
                            className="p-2 min-h-44 min-w-44 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Remove from saved jobs"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {savedJobs.map((job) => (
                <SavedJobCard key={job.id} job={job} onRemove={handleRemove} />
              ))}
            </div>

            {/* Footer message */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-400 text-center">
                Your saved jobs are always here when you need them. Take your
                time to review each opportunity before applying.
              </p>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
