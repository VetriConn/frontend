"use client";

import Link from "next/link";
import useSWR from "swr";
import { getEmployerJobs } from "@/lib/api";
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineMapPin,
  HiOutlineUsers,
} from "react-icons/hi2";
function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ManageJobsPage() {
  const { data: jobs = [], isLoading } = useSWR(
    "employer-jobs-manage",
    getEmployerJobs,
  );

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

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium">
                  <HiOutlineUsers className="w-4 h-4" />
                  {job.application_count || 0} application
                  {(job.application_count || 0) === 1 ? "" : "s"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
