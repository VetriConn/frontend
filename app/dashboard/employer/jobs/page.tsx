"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import {
  deleteEmployerJob,
  getEmployerJobs,
  updateEmployerJob,
} from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineMapPin,
  HiOutlineUsers,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ManageJobsPage() {
  const { showToast } = useToaster();
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const {
    data: jobs = [],
    isLoading,
    mutate,
  } = useSWR("employer-jobs-manage", getEmployerJobs);

  const handleToggleStatus = async (
    jobId: string,
    nextStatus: "draft" | "published",
  ) => {
    setBusyJobId(jobId);
    try {
      await updateEmployerJob(jobId, { status: nextStatus });
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
      await deleteEmployerJob(jobId);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-200 mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Job Postings
          </h1>
          <Link
            href="/dashboard/employer/post-job"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
          >
            Post New Job
          </Link>
        </div>

        <div className="mb-6 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
          {jobs.length} job posting{jobs.length === 1 ? "" : "s"} created
        </div>

        {/* Job Cards */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-500">
            Loading postings...
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineBriefcase className="w-7 h-7" />
            </div>
            <p className="text-sm text-gray-500">No postings yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between"
              >
                {/* Left — info */}
                <div className="min-w-0 mr-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                    {job.role}
                  </h3>
                  <div className="text-xs text-gray-400 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineMapPin className="w-3.5 h-3.5" />
                      {job.location || "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineCalendar className="w-3.5 h-3.5" />
                      Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium">
                    <HiOutlineUsers className="w-4 h-4" />
                    {job.application_count || 0} application
                    {(job.application_count || 0) === 1 ? "" : "s"}
                  </div>
                  {job.status === "published" && (
                    <Link
                      href={`/jobs/${job._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                      View as Candidate
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={busyJobId === job._id}
                    onClick={() =>
                      handleToggleStatus(
                        job._id,
                        job.status === "published" ? "draft" : "published",
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {job.status === "published" ? (
                      <HiOutlineEyeSlash className="w-4 h-4" />
                    ) : (
                      <HiOutlineEye className="w-4 h-4" />
                    )}
                    {job.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    disabled={busyJobId === job._id}
                    onClick={() => handleDelete(job._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
