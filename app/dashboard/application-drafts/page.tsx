"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineClipboardDocument,
  HiOutlineClock,
  HiOutlineTrash,
  HiOutlineArrowTopRightOnSquare,
  HiOutlinePencilSquare,
} from "react-icons/hi2";
import {
  listApplicationDrafts,
  removeApplicationDraft,
  type ApplicationDraftRecord,
} from "@/lib/applicationDrafts";
import { useToaster } from "@/components/ui/Toaster";

function formatSavedDate(value?: string): string {
  if (!value) return "Saved recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Saved recently";
  return `Saved ${parsed.toLocaleString()}`;
}

export default function ApplicationDraftsPage() {
  const { showToast } = useToaster();
  const [drafts, setDrafts] = useState<ApplicationDraftRecord[]>([]);

  const loadDrafts = useCallback(() => {
    setDrafts(listApplicationDrafts());
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleDelete = useCallback(
    (jobId: string) => {
      removeApplicationDraft(jobId);
      loadDrafts();
      showToast({
        type: "success",
        title: "Draft deleted",
        description: "The application draft was removed.",
      });
    },
    [loadDrafts, showToast],
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-250 mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4 mobile:flex-col mobile:items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Application Drafts
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Continue applications you saved for later.
            </p>
          </div>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors no-underline"
          >
            Browse Jobs
          </Link>
        </div>

        {drafts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-4">
              <HiOutlineClipboardDocument className="w-7 h-7" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              No saved drafts yet
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Start an application and use Save and Finish Later to keep it as a
              draft.
            </p>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors no-underline"
            >
              Find Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <article
                key={draft.jobId}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4 mobile:flex-col mobile:items-start">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900 truncate">
                      {draft.jobTitle || "Untitled Job"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {draft.companyName || "Unknown Company"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                      <HiOutlineClock className="w-3.5 h-3.5" />
                      {formatSavedDate(draft.savedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mobile:flex-wrap">
                    <Link
                      href={`/jobs/${draft.jobId}/apply`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors no-underline"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                      Continue Draft
                    </Link>
                    <Link
                      href={`/jobs/${draft.jobId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors no-underline"
                    >
                      <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                      View Posting
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(draft.jobId)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
