"use client";

import Link from "next/link";
import useSWR from "swr";
import { getEmployerJobs } from "@/lib/api";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  HiOutlineClipboardDocument,
  HiOutlineCalendar,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import { formatDate } from "@/lib/date-utils";


export default function ManageDraftsPage() {
  const { data: jobs = [], isLoading } = useSWR(
    "employer-jobs-drafts",
    getEmployerJobs,
  );

  const drafts = jobs.filter((job) => job.status === "draft");

  return (
    <AuthGuard>
      <div className="max-w-200 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Job Drafts
          </h1>
          <Link
            href="/dashboard/post-job"
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
            {drafts.map((draft) => (
              <div
                key={draft._id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between gap-4 hover:border-gray-300 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {draft.role}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <HiOutlineCalendar className="w-3.5 h-3.5" />
                      Updated {formatDate(draft.updatedAt)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/post-job?draftId=${draft._id}`}
                  className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-red-50 transition-colors"
                >
                  <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
