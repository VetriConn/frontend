"use client";

import Link from "next/link";
import { ListLoadError } from "@/components/ui/ListLoadError";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { deletePosting, getMyPostings, updatePosting } from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useModalFocus } from "@/hooks/useModalFocus";
import KebabMenu from "@/components/pages/admin/KebabMenu";
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineMapPin,
  HiOutlineUsers,
  HiOutlineTrash,
  HiOutlinePencilSquare,
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
  const router = useRouter();
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data,
    isLoading,
    error: loadError,
    mutate,
  } = useSWR("employer-jobs-manage", getMyPostings);
  // The error card is for a FAILED FIRST LOAD only. On a failed background
  // revalidation SWR keeps the last good data - swapping a populated list
  // for an error card over a network blip would be worse than the blip.
  const showLoadError = !!loadError && data === undefined;
  const jobs = data ?? [];

  // Pagination calculations
  const totalJobs = jobs.length;
  const totalPages = Math.ceil(totalJobs / itemsPerPage);

  // The page actually shown, clamped to what exists. This used to be a
  // setCurrentPage call inside a useMemo, which React is explicit about: a
  // memo callback may be evaluated more than once and setting state from it
  // can loop. Deleting the last posting on page 3 also left `currentPage` at
  // 3 for a render before the correction landed, which is a blank list.
  // Clamping here means the out-of-range value never reaches the slice.
  const page = Math.min(currentPage, Math.max(totalPages, 1));

  const paginatedJobs = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return jobs.slice(startIndex, startIndex + itemsPerPage);
  }, [jobs, page]);

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
        description: err instanceof Error ? err.message : "Couldn't update job",
      });
    } finally {
      setBusyJobId(null);
    }
  };

  // Deletion is permanent and closes every open application on the posting,
  // so it is the one action here that must never ride on a single stray
  // click - the trash icon arms this dialog instead of deleting.
  const [deleting, setDeleting] = useState<{ id: string; role: string } | null>(
    null,
  );

  const handleDelete = async (jobId: string) => {
    setBusyJobId(jobId);
    try {
      await deletePosting(jobId);
      await mutate();
      showToast({
        type: "success",
        title: "Posting deleted",
        description: "Applicants with open applications have been notified.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Couldn't delete job",
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
              My Postings
            </h1>
            <p className="text-gray-600">
              You have {totalJobs} posting
              {totalJobs !== 1 && "s"}.
            </p>
          </div>
          <Link
            href="/dashboard/post-job"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
          >
            <HiOutlinePlusCircle className="w-5 h-5" />
            Post a Job
          </Link>
        </div>

        {showLoadError ? (
          <ListLoadError what="your postings" onRetry={() => mutate()} />
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-gray-600 font-medium">Loading jobs...</p>
          </div>
        ) : totalJobs > 0 ? (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Job Details
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Applicants
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Date Posted
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedJobs.map((job) => (
                      <tr
                        key={job._id}
                        // A click anywhere on the row opens the public
                        // posting — but not one that landed on the actions
                        // menu, which is inside the row and means something
                        // else entirely. The keyboard path is the title link
                        // below, deliberately: a <tr> wearing a click handler
                        // is not focusable and announces as nothing.
                        onClick={(e) => {
                          const el = e.target as HTMLElement;
                          if (el.closest("button, a, input, label, [role='menu']")) return;
                          router.push(`/jobs/${job._id}`);
                        }}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                              <HiOutlineBriefcase className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/jobs/${job._id}`}
                                className="block text-sm font-semibold text-gray-900 truncate no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                              >
                                {job.role}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-600">
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
                              job.moderation_status ?? "pending";
                            // A draft isn't submitted. A published job is only
                            // live once an admin approves it — until then it's
                            // awaiting review, not "live". A suspension hold
                            // shows as its own state: it isn't a rejection and
                            // there is nothing for the employer to fix.
                            const badge =
                              job.status === "draft"
                                ? {
                                    label: "Draft",
                                    cls: "bg-gray-100 text-gray-600",
                                  }
                                : moderation === "rejected"
                                  ? {
                                      label: "Rejected",
                                      cls: "bg-rose-50 text-rose-700",
                                    }
                                  : job.unpublished_reason === "expired"
                                    ? {
                                        label: "Expired",
                                        cls: "bg-gray-100 text-gray-600",
                                      }
                                    : job.unpublished_reason ===
                                        "company_suspended"
                                      ? {
                                          label: "On hold",
                                          cls: "bg-amber-50 text-amber-700",
                                        }
                                      : moderation === "approved"
                                        ? {
                                            label: "Published",
                                            cls: "bg-green-50 text-green-700",
                                          }
                                        : {
                                            label: "Awaiting approval",
                                            cls: "bg-yellow-50 text-yellow-700",
                                          };
                            return (
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium ${badge.cls}`}
                              >
                                {badge.label}
                              </span>
                            );
                          })()}
                          {job.moderation_status === "rejected" &&
                            job.rejection_reason && (
                              <p className="mt-1.5 max-w-[16rem] text-sm text-rose-700">
                                {job.rejection_reason} Edit the job to fix this
                                and resubmit it for review.
                              </p>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <HiOutlineUsers className="w-4 h-4 text-gray-400" />
                            {job.application_count || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                            {formatDate(job.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {/* One menu rather than four icons in a row. The
                              icons were unlabelled, four abreast and 20px
                              apart on a board whose audience is 45+ — and the
                              eye/eye-slash pair asked you to know which of two
                              near-identical glyphs meant "publish". Named
                              items in a menu say what they do. */}
                          <KebabMenu
                            label={`Actions for ${job.role}`}
                            actions={[
                              {
                                label: "Edit posting",
                                icon: HiOutlinePencilSquare,
                                onClick: () =>
                                  router.push(
                                    `/dashboard/post-job?draftId=${job._id}`,
                                  ),
                              },
                              {
                                label: "View public posting",
                                icon: HiOutlineArrowTopRightOnSquare,
                                onClick: () => router.push(`/jobs/${job._id}`),
                              },
                              job.status === "published"
                                ? {
                                    label: "Move to drafts",
                                    icon: HiOutlineEyeSlash,
                                    disabled: busyJobId === job._id,
                                    onClick: () =>
                                      handleToggleStatus(job._id, "draft"),
                                  }
                                : {
                                    label: "Publish posting",
                                    icon: HiOutlineEye,
                                    disabled: busyJobId === job._id,
                                    onClick: () =>
                                      handleToggleStatus(job._id, "published"),
                                  },
                              {
                                label: "Delete posting",
                                icon: HiOutlineTrash,
                                danger: true,
                                disabled: busyJobId === job._id,
                                onClick: () =>
                                  setDeleting({ id: job._id, role: job.role }),
                              },
                            ]}
                          />
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
                <p className="text-sm text-gray-600 font-medium">
                  Showing page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage(Math.max(1, page - 1))
                    }
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiOutlineChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, page + 1))
                    }
                    disabled={page === totalPages}
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
              No postings yet
            </h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-8">
              Post your first job opening to start receiving applications from
              qualified candidates.
            </p>
            <Link
              href="/dashboard/post-job"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
              Post a Job
            </Link>
          </div>
        )}
      </div>

      {deleting && (
        <DeletePostingDialog
          role={deleting.role}
          busy={busyJobId === deleting.id}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await handleDelete(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </AuthGuard>
  );
}

/**
 * Deleting a posting is permanent and closes every open application on it,
 * so it asks first — every other destructive action in the app already did.
 */
function DeletePostingDialog({
  role,
  busy,
  onCancel,
  onConfirm,
}: {
  role: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const panelRef = useModalFocus(true, onCancel, { closeDisabled: busy });
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-posting-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div
        ref={panelRef}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
      >
        <h2
          id="delete-posting-title"
          className="text-lg font-semibold text-gray-900"
        >
          Delete this posting?
        </h2>
        <p className="mt-2 text-gray-600">
          &ldquo;{role}&rdquo; will be removed permanently. Anyone with an open
          application will be told the listing is gone. This can&apos;t be
          undone.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete posting"}
          </button>
        </div>
      </div>
    </div>
  );
}
