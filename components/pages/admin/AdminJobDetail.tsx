"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineBanknotes,
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";
import {
  useAdminJob,
  approveAdminJob,
  rejectAdminJob,
  unpublishAdminJob,
  type AdminJob,
  type AdminJobStatus,
} from "@/hooks/useAdminJobQueue";
import { useToaster } from "@/components/ui/Toaster";
import ConfirmDialog from "./ConfirmDialog";

interface AdminJobDetailProps {
  jobId: string;
  /** Called after an action succeeds, so the surrounding list can refresh. */
  onChanged?: () => void;
}

const STATUS_META: Record<
  AdminJobStatus,
  {
    label: string;
    pillClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "Pending Review",
    pillClass: "bg-amber-50 text-amber-700 ring-amber-200/70",
    icon: HiOutlineClock,
  },
  approved: {
    label: "Approved",
    pillClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    icon: HiOutlineCheckCircle,
  },
  rejected: {
    label: "Rejected",
    pillClass: "bg-rose-50 text-rose-700 ring-rose-200/70",
    icon: HiOutlineXCircle,
  },
};

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AdminJobDetail = ({ jobId, onChanged }: AdminJobDetailProps) => {
  const { showToast } = useToaster();
  const { job, isLoading, mutate } = useAdminJob(jobId);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [busy, setBusy] = useState<null | "approve" | "reject" | "unpublish">(
    null,
  );

  const meta = job ? STATUS_META[job.status] : null;
  const StatusIcon = meta?.icon;

  const handleApprove = async () => {
    if (!job) return;
    setBusy("approve");
    try {
      await approveAdminJob(job.id);
      const next: AdminJob = {
        ...job,
        status: "approved",
        approvedAt: new Date().toISOString(),
      };
      await mutate(next, false);
      onChanged?.();
      showToast({
        type: "success",
        title: "Job approved",
        description: `${job.role} is now live.`,
      });
    } catch {
      showToast({ type: "error", title: "Could not approve job" });
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!job || !reason) return;
    setBusy("reject");
    try {
      await rejectAdminJob(job.id, reason);
      const next: AdminJob = {
        ...job,
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        rejection_reason: reason,
      };
      await mutate(next, false);
      onChanged?.();
      showToast({
        type: "success",
        title: "Job rejected",
        description: `${job.role} was rejected.`,
      });
      setRejectOpen(false);
    } catch {
      showToast({ type: "error", title: "Could not reject job" });
    } finally {
      setBusy(null);
    }
  };

  const handleUnpublish = async (reason?: string) => {
    if (!job || !reason) return;
    setBusy("unpublish");
    try {
      await unpublishAdminJob(job.id, reason);
      const next: AdminJob = {
        ...job,
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        rejection_reason: reason,
      };
      await mutate(next, false);
      onChanged?.();
      showToast({
        type: "success",
        title: "Listing unpublished",
        description: `${job.role} is no longer live.`,
      });
      setUnpublishOpen(false);
    } catch {
      showToast({ type: "error", title: "Could not unpublish listing" });
    } finally {
      setBusy(null);
    }
  };

  // ─── Loading / not-found ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 bg-gray-100 rounded animate-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4">
            <div className="h-7 w-2/3 bg-gray-100 rounded animate-shimmer" />
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-shimmer" />
            <div className="h-3 w-full bg-gray-100 rounded animate-shimmer" />
            <div className="h-3 w-5/6 bg-gray-100 rounded animate-shimmer" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3">
            <div className="h-5 w-1/2 bg-gray-100 rounded animate-shimmer" />
            <div className="h-10 w-full bg-gray-100 rounded animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-10">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-4">
            <HiOutlineBriefcase className="w-6 h-6" />
          </div>
          <h1 className="text-base font-semibold text-gray-900">
            Job not found
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            The listing you&apos;re looking for may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Detail panel */}
        <article className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 md:p-6">
          {meta && StatusIcon && (
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1",
                meta.pillClass,
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {meta.label}
            </span>
          )}

          <h2 className="mt-3 text-2xl font-bold text-gray-900 tracking-tight">
            {job.role}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400" />
              {job.company_name}
              {job.employer.verified && (
                <HiOutlineShieldCheck
                  title="Verified employer"
                  className="w-4 h-4 text-emerald-500"
                />
              )}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineMapPin className="w-4 h-4 text-gray-400" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineBriefcase className="w-4 h-4 text-gray-400" />
              {job.employment_type}
            </span>
            {job.salary_range && (
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineBanknotes className="w-4 h-4 text-gray-400" />
                {job.salary_range}
              </span>
            )}
          </div>

          <div className="mt-6 space-y-5">
            <section>
              <h3 className="text-sm font-semibold text-gray-900">
                Job Description
              </h3>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </section>

            {job.requirements?.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-900">
                  Requirements
                </h3>
                <ul className="mt-1.5 space-y-1.5 text-sm text-gray-600">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.rejection_reason && (
              <section className="rounded-xl bg-rose-50/60 border border-rose-200/60 p-3.5">
                <h3 className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
                  Rejection reason
                </h3>
                <p className="mt-1 text-sm text-rose-900/80">
                  {job.rejection_reason}
                </p>
              </section>
            )}
          </div>

          <dl className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-500">
            <div>
              <dt className="font-semibold text-gray-600">Submitted</dt>
              <dd className="tabular-nums">{formatDate(job.submittedAt)}</dd>
            </div>
            {job.approvedAt && (
              <div>
                <dt className="font-semibold text-gray-600">Approved</dt>
                <dd className="tabular-nums">{formatDate(job.approvedAt)}</dd>
              </div>
            )}
            {job.rejectedAt && (
              <div>
                <dt className="font-semibold text-gray-600">Rejected</dt>
                <dd className="tabular-nums">{formatDate(job.rejectedAt)}</dd>
              </div>
            )}
            {typeof job.applications === "number" && (
              <div>
                <dt className="font-semibold text-gray-600">Applications</dt>
                <dd className="tabular-nums">{job.applications}</dd>
              </div>
            )}
          </dl>
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
              {job.role}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {job.company_name}
            </p>
          </div>

          {job.status === "pending" && (
            <div className="mt-4 space-y-2.5">
              <button
                onClick={handleApprove}
                disabled={busy !== null}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <HiOutlineCheck className="w-4 h-4" />
                {busy === "approve" ? "Approving…" : "Approve Job"}
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                disabled={busy !== null}
                className="w-full inline-flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <HiOutlineXMark className="w-4 h-4" />
                Reject Job
              </button>
            </div>
          )}

          {job.status === "approved" && (
            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => setUnpublishOpen(true)}
                disabled={busy !== null}
                className="w-full inline-flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Unpublish Listing
              </button>
            </div>
          )}

          {job.status === "rejected" && (
            <p className="mt-4 text-xs text-gray-500">
              This listing is rejected. No further action required.
            </p>
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

      <ConfirmDialog
        open={rejectOpen}
        title="Reject this job?"
        subject={job.role}
        description="The employer will be notified."
        reasonLabel="Reason for rejection"
        reasonPlaceholder="Share what the employer needs to fix before resubmitting…"
        confirmLabel="Confirm rejection"
        busy={busy === "reject"}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
      <ConfirmDialog
        open={unpublishOpen}
        title="Unpublish this job?"
        subject={job.role}
        description="The listing will be removed from public view immediately. The employer will be notified."
        reasonLabel="Reason"
        reasonPlaceholder="Why is this listing being unpublished?"
        confirmLabel="Confirm Unpublish"
        busy={busy === "unpublish"}
        onClose={() => setUnpublishOpen(false)}
        onConfirm={handleUnpublish}
      />
    </div>
  );
};

export default AdminJobDetail;
