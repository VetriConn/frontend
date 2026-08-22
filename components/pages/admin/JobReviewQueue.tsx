"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineBanknotes,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import {
  useAdminJobQueue,
  approveAdminJob,
  rejectAdminJob,
  type AdminJob,
  type AdminJobStatus,
} from "@/hooks/useAdminJobQueue";
import { useToaster } from "@/components/ui/Toaster";
import { AdminPageHeader } from "./AdminTablePanel";
import ScrapeJobsButton from "./ScrapeJobsButton";

interface JobReviewQueueProps {
  status: AdminJobStatus;
}

const STATUS_META: Record<
  AdminJobStatus,
  {
    title: string;
    description: string;
    pillClass: string;
    pillIcon: React.ComponentType<{ className?: string }>;
    pillLabel: string;
  }
> = {
  pending: {
    title: "Job Review Queue",
    description: "Approve or reject job listings before they go live",
    pillClass: "bg-amber-50 text-amber-700 ring-amber-200/70",
    pillIcon: HiOutlineClock,
    pillLabel: "Pending Review",
  },
  approved: {
    title: "Approved Jobs",
    description: "Listings currently published on Vetriconn",
    pillClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    pillIcon: HiOutlineCheckCircle,
    pillLabel: "Approved",
  },
  rejected: {
    title: "Rejected Jobs",
    description: "Listings that did not pass review",
    pillClass: "bg-rose-50 text-rose-700 ring-rose-200/70",
    pillIcon: HiOutlineXCircle,
    pillLabel: "Rejected",
  },
};

const formatSubmittedAt = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Tabs (segmented row) ────────────────────────────────────────────────────

interface JobTabsProps {
  jobs: AdminJob[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const JobTabs = ({ jobs, selectedId, onSelect }: JobTabsProps) => {
  if (jobs.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
      {jobs.map((job) => {
        const isActive = job.id === selectedId;
        return (
          <button
            key={job.id}
            onClick={() => onSelect(job.id)}
            className={clsx(
              "shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
              isActive
                ? "bg-primary text-white shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)]"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900",
            )}
          >
            {job.role}
          </button>
        );
      })}
    </div>
  );
};

// ─── Reject modal ────────────────────────────────────────────────────────────

interface RejectDialogProps {
  open: boolean;
  jobTitle: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectDialog = ({
  open,
  jobTitle,
  busy,
  onClose,
  onConfirm,
}: RejectDialogProps) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100 flex items-center justify-center shrink-0">
            <HiOutlineExclamationTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900">
              Reject this job?
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{jobTitle}</p>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">
              Reason for rejection
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Share what the employer needs to fix before resubmitting…"
              className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </label>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={busy || reason.trim().length < 5}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Rejecting…" : "Confirm rejection"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

const QueueSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4">
      <div className="h-7 w-1/2 bg-gray-100 rounded animate-shimmer" />
      <div className="h-4 w-1/3 bg-gray-100 rounded animate-shimmer" />
      <div className="h-3 w-full bg-gray-100 rounded animate-shimmer mt-6" />
      <div className="h-3 w-5/6 bg-gray-100 rounded animate-shimmer" />
      <div className="h-3 w-4/6 bg-gray-100 rounded animate-shimmer" />
    </div>
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4">
      <div className="h-5 w-1/2 bg-gray-100 rounded animate-shimmer" />
      <div className="h-10 w-full bg-gray-100 rounded-lg animate-shimmer" />
      <div className="h-10 w-full bg-gray-100 rounded-lg animate-shimmer" />
    </div>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────

const JobReviewQueue = ({ status }: JobReviewQueueProps) => {
  const meta = STATUS_META[status];
  const { jobs, isLoading, mutate } = useAdminJobQueue(status);
  const { showToast } = useToaster();
  const PillIcon = meta.pillIcon;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<null | "approve" | "reject">(
    null,
  );

  // Keep selection valid as data loads / changes
  useEffect(() => {
    if (jobs.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !jobs.some((j) => j.id === selectedId)) {
      setSelectedId(jobs[0].id);
    }
  }, [jobs, selectedId]);

  const selected = useMemo(
    () => jobs.find((j) => j.id === selectedId) ?? null,
    [jobs, selectedId],
  );

  const handleApprove = async () => {
    if (!selected) return;
    setBusyAction("approve");
    try {
      await approveAdminJob(selected.id);
      showToast({
        type: "success",
        title: "Job approved",
        description: `${selected.role} is now live.`,
      });
      // Optimistically drop from pending list
      await mutate(jobs.filter((j) => j.id !== selected.id), false);
    } catch {
      showToast({ type: "error", title: "Could not approve job" });
    } finally {
      setBusyAction(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selected) return;
    setBusyAction("reject");
    try {
      await rejectAdminJob(selected.id, reason);
      showToast({
        type: "success",
        title: "Job rejected",
        description: `${selected.role} was rejected.`,
      });
      await mutate(jobs.filter((j) => j.id !== selected.id), false);
      setRejectOpen(false);
    } catch {
      showToast({ type: "error", title: "Could not reject job" });
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title={meta.title}
        description={meta.description}
        actions={status === "pending" ? <ScrapeJobsButton /> : undefined}
      />

      {/* Tabs */}
      <JobTabs
        jobs={jobs}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Body */}
      {isLoading ? (
        <QueueSkeleton />
      ) : !selected ? (
        <EmptyState status={status} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Job detail panel */}
          <article className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 md:p-6">
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1",
                meta.pillClass,
              )}
            >
              <PillIcon className="w-3.5 h-3.5" />
              {meta.pillLabel}
            </span>

            <h2 className="mt-3 text-2xl font-bold text-gray-900 tracking-tight">
              {selected.role}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400" />
                {selected.company_name}
                {selected.employer.verified && (
                  <HiOutlineShieldCheck
                    title="Verified employer"
                    className="w-4 h-4 text-emerald-500"
                  />
                )}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineMapPin className="w-4 h-4 text-gray-400" />
                {selected.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineBriefcase className="w-4 h-4 text-gray-400" />
                {selected.employment_type}
              </span>
              {selected.salary_range && (
                <span className="inline-flex items-center gap-1.5">
                  <HiOutlineBanknotes className="w-4 h-4 text-gray-400" />
                  {selected.salary_range}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-5">
              <section>
                <h3 className="text-sm font-semibold text-gray-900">
                  Job Description
                </h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selected.description}
                </p>
              </section>

              {selected.requirements?.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Requirements
                  </h3>
                  <ul className="mt-1.5 space-y-1.5 text-sm text-gray-600">
                    {selected.requirements.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {selected.rejection_reason && (
                <section className="rounded-xl bg-rose-50/60 border border-rose-200/60 p-3.5">
                  <h3 className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
                    Rejection reason
                  </h3>
                  <p className="mt-1 text-sm text-rose-900/80">
                    {selected.rejection_reason}
                  </p>
                </section>
              )}
            </div>

            <p className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
              Submitted: {formatSubmittedAt(selected.submittedAt)}
            </p>
          </article>

          {/* Decision sidebar */}
          <aside className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 md:p-6 lg:sticky lg:top-20">
            <h2 className="text-base font-semibold text-gray-900">
              Admin Decision
            </h2>

            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Reviewing
              </p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900 truncate">
                {selected.role}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {selected.company_name}
              </p>
            </div>

            {status === "pending" ? (
              <div className="mt-4 space-y-2.5">
                <button
                  onClick={handleApprove}
                  disabled={busyAction !== null}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <HiOutlineCheck className="w-4 h-4" />
                  {busyAction === "approve" ? "Approving…" : "Approve Job"}
                </button>
                <button
                  onClick={() => setRejectOpen(true)}
                  disabled={busyAction !== null}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <HiOutlineXMark className="w-4 h-4" />
                  Reject Job
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  This listing is in the{" "}
                  <span className="font-semibold text-gray-700">
                    {meta.pillLabel.toLowerCase()}
                  </span>{" "}
                  state. No further action required.
                </p>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Review checklist
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-gray-600">
                {[
                  "Job description is clear and professional",
                  "Requirements are reasonable",
                  "Salary information is provided",
                  "Employer is verified",
                  "No discriminatory language",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}

      <RejectDialog
        open={rejectOpen}
        jobTitle={selected?.role ?? ""}
        busy={busyAction === "reject"}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
    </div>
  );
};

// ─── Empty state ─────────────────────────────────────────────────────────────

const EmptyState = ({ status }: { status: AdminJobStatus }) => {
  const meta = STATUS_META[status];
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-12 text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-4">
        <HiOutlineBriefcase className="w-6 h-6" />
      </div>
      <h2 className="text-base font-semibold text-gray-900">
        {status === "pending"
          ? "Inbox zero"
          : status === "approved"
            ? "No approved jobs yet"
            : "No rejected jobs"}
      </h2>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
        {status === "pending"
          ? "There are no jobs awaiting review right now. New submissions will appear here automatically."
          : status === "approved"
            ? "Approved jobs will show up here once you start reviewing the queue."
            : `${meta.title} will list any listings rejected during review.`}
      </p>
    </div>
  );
};

export default JobReviewQueue;
