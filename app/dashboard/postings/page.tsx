"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  deletePosting,
  getMyPostings,
  updatePosting,
} from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineMapPin,
  HiOutlineUsers,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineArrowTopRightOnSquare,
  HiOutlinePlusCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { formatDate } from "@/lib/date-utils";


// ─── Page Component ──────────────────────────────────────────────────────────

export default function ManageJobsPage() {
  const { showToast } = useToaster();
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: jobs = [],
    isLoading,
    mutate,
  } = useSWR("employer-jobs-manage", getMyPostings);

  // Pagination calculations
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return jobs.slice(startIndex, startIndex + itemsPerPage);
  }, [jobs, currentPage]);

  // Reset to page 1 when jobs change
  const totalJobs = jobs.length;
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalJobs, currentPage, totalPages]);

  const handleToggleStatus = async (
    jobId: string,
    nextStatus: "draft" | "published",
  ) => {
    setBusyJobId(jobId);
    try {
      await updatePosting(jobId, { status: nextStatus });
      await mutate();
      showToast({
        type: "success",
        title:
          nextStatus === "published" ? "Job published" : "Job moved to draft",
        description: "Job status updated successfully",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Update failed",
        description:
          err instanceof Error ? err.message : "Could not update job",
      });
    } finally {
      setBusyJobId(null);
    }
  };

  const handleDelete = async (jobId: string) => {
    setBusyJobId(jobId);
    try {
      await deletePosting(jobId);
      await mutate();
      showToast({
        type: "success",
        title: "Job deleted",
        description: "The job posting was removed",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Delete failed",
        description:
          err instanceof Error ? err.message : "Could not delete job",
      });
    } finally {
      setBusyJobId(null);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Manage Job Postings
            </h1>
            <p className="text-gray-500">
              You have {totalJobs} total job posting
              {totalJobs !== 1 && "s"}.
            </p>
          </div>
          <Link
            href="/dashboard/post-job"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
          >
            <HiOutlinePlusCircle className="w-5 h-5" />
            Post New Job
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-gray-500 font-medium">Loading jobs...</p>
          </div>
        ) : totalJobs > 0 ? (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Job Details
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Applicants
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date Posted
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedJobs.map((job) => (
                      <tr
                        key={job._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                              <HiOutlineBriefcase className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {job.role}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <HiOutlineMapPin className="w-3 h-3" />
                                  {job.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const moderation =
                              job.moderation_status ??
                              (job.is_approved ? "approved" : "pending");
                            // A draft isn't submitted. A published job is only
                            // live once an admin approves it — until then it's
                            // awaiting review, not "live".
                            const badge =
                              job.status === "draft"
                                ? { label: "Draft", cls: "bg-gray-100 text-gray-600" }
                                : moderation === "rejected"
                                  ? { label: "Rejected", cls: "bg-rose-50 text-rose-700" }
                                  : moderation === "approved"
                                    ? { label: "Published", cls: "bg-green-50 text-green-700" }
                                    : {
                                        label: "Awaiting approval",
                                        cls: "bg-yellow-50 text-yellow-700",
                                      };
                            return (
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}
                              >
                                {badge.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <HiOutlineUsers className="w-4 h-4 text-gray-400" />
                            {job.application_count || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                            {formatDate(job.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/jobs/${job._id}`}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-red-50 transition-colors"
                              title="View Public Posting"
                            >
                              <HiOutlineArrowTopRightOnSquare className="w-5 h-5" />
                            </Link>
                            {job.status === "published" ? (
                              <button
                                onClick={() =>
                                  handleToggleStatus(job._id, "draft")
                                }
                                disabled={busyJobId === job._id}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Move to Drafts"
                              >
                                <HiOutlineEyeSlash className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleToggleStatus(job._id, "published")
                                }
                                disabled={busyJobId === job._id}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                title="Publish Job"
                              >
                                <HiOutlineEye className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(job._id)}
                              disabled={busyJobId === job._id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Job"
                            >
                              <HiOutlineTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">
                  Showing page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiOutlineChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiOutlineChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <HiOutlineBriefcase className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No jobs posted yet
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
              Post your first job opening to start receiving applications from
              qualified candidates.
            </p>
            <Link
              href="/dashboard/post-job"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
