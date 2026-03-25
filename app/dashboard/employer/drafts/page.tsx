"use client";

import Link from "next/link";
import useSWR from "swr";
import { getEmployerJobs } from "@/lib/api";
import {
  HiOutlineClipboardDocument,
  HiOutlineCalendar,
  HiOutlineArrowRight,
} from "react-icons/hi2";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

export default function ManageDraftsPage() {
  const { data: jobs = [], isLoading } = useSWR(
    "employer-jobs-drafts",
    getEmployerJobs,
  );

  const drafts = jobs.filter((job) => job.status === "draft");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-200 mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Job Drafts
          </h1>
          <Link
            href="/dashboard/employer/post-job"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
          >
            New Draft
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-500">
            Loading drafts...
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineClipboardDocument className="w-7 h-7" />
            </div>
            <p className="text-sm text-gray-500">No drafts saved yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between"
              >
                <div className="min-w-0 mr-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5 truncate">
                    {job.role}
                  </h3>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                    Last updated {formatDate(job.updatedAt)}
                  </div>
                </div>

                <Link
                  href={`/dashboard/employer/post-job?draftId=${job._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Continue Draft
                  <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
