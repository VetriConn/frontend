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
import { AuthGuard } from "@/components/auth/AuthGuard";
import { formatFullDateTime } from "@/lib/date-utils";

export default function ApplicationDraftsPage() {
  const { showToast } = useToaster();
  const [drafts, setDrafts] = useState<ApplicationDraftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDrafts = useCallback(async () => {
    try {
      const result = await listApplicationDrafts();
      setDrafts(result);
    } catch (err) {
      console.error("Failed to load drafts:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleDelete = useCallback(
    async (jobId: string) => {
      // Optimistic removal
      setDrafts((prev) => prev.filter((d) => d.jobId !== jobId));
      try {
        await removeApplicationDraft(jobId);
        showToast({
          type: "success",
          title: "Draft deleted",
          description: "The application draft was removed.",
        });
      } catch {
        // Re-fetch on failure
        loadDrafts();
        showToast({
          type: "error",
          title: "Delete failed",
          description: "Could not delete the draft. Please try again.",
        });
      }
    },
    [loadDrafts, showToast],
  );

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="max-w-4xl mx-auto py-8 px-4 md:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Application Drafts
            </h1>
            <p className="text-gray-500">
              Pick up where you left off with your job applications.
            </p>
          </div>
          <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
            <span className="text-sm font-medium text-primary">
              {drafts.length} draft{drafts.length !== 1 && "s"} available
            </span>
          </div>
        </div>

        {drafts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {drafts.map((draft) => (
              <div
                key={draft.jobId}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {draft.jobTitle}
                      </h3>
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                        Draft
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-gray-500">
                      <span className="font-medium text-gray-700">
                        {draft.companyName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HiOutlineClock className="w-4 h-4 text-gray-400" />
                        {draft.savedAt ? `Saved ${formatFullDateTime(draft.savedAt)}` : "Saved recently"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDelete(draft.jobId)}
                      className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Draft"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/jobs/${draft.jobId}?resumeDraft=true`}
                      className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-all shadow-sm shadow-primary/20"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                      Resume Application
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineClipboardDocument className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No application drafts found
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              When you start an application but don&apos;t finish it, we&apos;ll
              save your progress here so you can come back later.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
            >
              Browse jobs to start applying
              <HiOutlineArrowTopRightOnSquare className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
