"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineBanknotes,
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
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
import { formatFullDateTime } from "@/lib/date-utils";

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


/**
 * What a reviewer must confirm before a listing can go live. Ticking is
 * deliberate friction: approval publishes to the public board, so the checks
 * are made explicit rather than assumed.
 */
const REVIEW_CHECKS = [
  "Job description is clear and professional",
  "Requirements are reasonable",
  "Salary information is provided",
  "Employer is verified",
  "No discriminatory language",
] as const;

const AdminJobDetail = ({ jobId, onChanged }: AdminJobDetailProps) => {
  const { showToast } = useToaster();
  const { job, isLoading, mutate } = useAdminJob(jobId);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  // A fresh job means a fresh review — never carry ticks across listings.
  useEffect(() => {
    setChecked([]);
  }, [jobId]);

  const allChecked = checked.length === REVIEW_CHECKS.length;

  const [busy, setBusy] = useState<null | "approve" | "reject" | "unpublish">(
    null,
  );

  const meta = job ? STATUS_META[job.status] : null;
  const StatusIcon = meta?.icon;

  const handleApprove = async () => {
    if (!job) return;
    setBusy("approve");
    try {
      await approveAdminJob(job.id, job.version);
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
        // Approval is the verdict, not the publish switch: a draft stays a
        // draft and a suspension hold keeps the listing down.
        description: `${job.role} is approved.`,
      });
    } catch (err) {
      // The 409 from a stale expected_version carries the message that
      // matters ("this job changed since you loaded it") - swallowing it
      // defeated the whole precondition.
      showToast({
        type: "error",
        title: "Couldn't approve job",
        description: err instanceof Error ? err.message : undefined,
      });
      await mutate();
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!job || !reason) return;
    setBusy("reject");
    try {
      await rejectAdminJob(job.id, reason, job.version);
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
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't reject job",
        description: err instanceof Error ? err.message : undefined,
      });
      await mutate();
    } finally {
      setBusy(null);
    }
  };

  const handleUnpublish = async (reason?: string) => {
    if (!job || !reason) return;
    setBusy("unpublish");
    try {
      await unpublishAdminJob(job.id, reason, job.version);
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
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't unpublish listing",
        description: err instanceof Error ? err.message : undefined,
      });
      await mutate();
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
          <div className="space-y-4">
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
        <div className="p-10 text-center">
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
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
        {/* Detail panel — no card chrome: the drawer is already the surface. */}
        <article className="max-w-[70ch] animate-slide-up">
          {meta && StatusIcon && (
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold ring-1",
                meta.pillClass,
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {meta.label}
            </span>
          )}

          {job.scam_flags && job.scam_flags.length > 0 && (
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200/70 p-3.5">
              <div className="flex items-center gap-2">
                <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  {job.scam_flags.length} scam signal
                  {job.scam_flags.length === 1 ? "" : "s"} detected
                </p>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {job.scam_flags.map((flag) => (
                  <li
                    key={flag}
                    className="px-2 py-0.5 rounded-md bg-white/70 border border-amber-200 text-[0.6875rem] font-medium text-amber-900"
                  >
                    {flag.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="mt-3 text-[1.75rem] leading-[1.15] font-bold text-gray-900 tracking-[-0.02em]">
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
            {job.pay && (
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineBanknotes className="w-4 h-4 text-gray-400" />
                {job.pay}
              </span>
            )}
          </div>

          <div className="mt-6 space-y-5">
            <section>
              <h3 className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wide">
                Job Description
              </h3>
              {!job.description?.trim() ? (
                <p className="mt-1.5 text-sm text-gray-400 italic">
                  No description supplied.
                </p>
              ) : /<\/?(p|ul|ol|li|br|strong|b|em|i|u|a)\b/i.test(job.description) ? (
                <div
                  className="rich-text mt-1.5 text-sm text-gray-600 leading-relaxed"
                  // Safe: sanitized server-side to a small formatting allowlist.
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              )}
            </section>

            {job.responsibilities?.length > 0 && (
              <section>
                <h3 className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wide">
                  Responsibilities
                </h3>
                <ul className="mt-1.5 space-y-1.5 text-sm text-gray-600">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.requirements?.length === 0 && (
              <section>
                <h3 className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wide">
                  Requirements
                </h3>
                <p className="mt-1.5 text-sm text-gray-400 italic">
                  None listed.
                </p>
              </section>
            )}

            {job.requirements?.length > 0 && (
              <section>
                <h3 className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wide">
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

            {job.details.length > 0 && (
              <section>
                <h3 className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wide">
                  Posting details
                </h3>
                <dl className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {job.details.map((d) => (
                    <div key={d.label} className="flex justify-between gap-3 text-sm">
                      <dt className="text-gray-500 shrink-0">{d.label}</dt>
                      <dd className="text-gray-800 text-right">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {job.screening.length > 0 && (
              <section>
                <h3 className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wide">
                  Screening questions
                </h3>
                {/* What every applicant is made to answer before they can
                    apply. A reviewer approving a posting is approving these
                    too — a question can be intrusive or disqualifying in ways
                    the description never hints at. */}
                <ol className="mt-1.5 space-y-2 text-sm text-gray-600">
                  {job.screening.map((q, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-gray-400 shrink-0">{i + 1}.</span>
                      <span>
                        {q.question}
                        <span className="ml-1.5 text-xs text-gray-400">
                          ({q.type}
                          {q.required ? ", required" : ""})
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
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

          {/* Time of day, not just the date. A moderation record is an audit
              trail — "Sep 9" cannot tell you whether a decision came before or
              after the report that prompted it. */}
          <dl className="mt-8 pt-5 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-xs text-gray-500">
            <div>
              <dt className="font-semibold text-gray-600">Submitted</dt>
              <dd className="tabular-nums text-sm font-semibold text-gray-900 mt-0.5">{formatFullDateTime(job.submittedAt)}</dd>
            </div>
            {job.approvedAt && (
              <div>
                <dt className="font-semibold text-gray-600">Approved</dt>
                <dd className="tabular-nums text-sm font-semibold text-gray-900 mt-0.5">{formatFullDateTime(job.approvedAt)}</dd>
              </div>
            )}
            {job.rejectedAt && (
              <div>
                <dt className="font-semibold text-gray-600">Rejected</dt>
                <dd className="tabular-nums text-sm font-semibold text-gray-900 mt-0.5">{formatFullDateTime(job.rejectedAt)}</dd>
              </div>
            )}
            {typeof job.applications === "number" && (
              <div>
                <dt className="font-semibold text-gray-600">Applications</dt>
                <dd className="tabular-nums text-sm font-semibold text-gray-900 mt-0.5">{job.applications}</dd>
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
            <p className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wide">
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
            <fieldset className="mt-5 pt-4 border-t border-gray-100">
              <legend className="sr-only">Review checklist</legend>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wide">
                  Review checklist
                </p>
                <span
                  className={clsx(
                    "text-[0.6875rem] font-bold tabular-nums",
                    allChecked ? "text-emerald-600" : "text-gray-400",
                  )}
                >
                  {checked.length}/{REVIEW_CHECKS.length}
                </span>
              </div>

              <ul className="mt-2.5 space-y-0.5">
                {REVIEW_CHECKS.map((item) => {
                  const isOn = checked.includes(item);
                  return (
                    <li key={item}>
                      <label
                        className={clsx(
                          "flex items-start gap-2.5 py-1.5 px-2 -mx-2 rounded-lg cursor-pointer transition-colors",
                          "hover:bg-gray-50 focus-within:bg-gray-50",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isOn}
                          onChange={() =>
                            setChecked((prev) =>
                              prev.includes(item)
                                ? prev.filter((c) => c !== item)
                                : [...prev, item],
                            )
                          }
                          className="sr-only peer"
                        />
                        <span
                          aria-hidden
                          className={clsx(
                            "mt-px w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors",
                            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40",
                            isOn
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-white border-gray-300",
                          )}
                        >
                          {isOn && <HiOutlineCheck className="w-3 h-3" strokeWidth={3} />}
                        </span>
                        <span
                          className={clsx(
                            "text-xs leading-snug transition-colors",
                            isOn ? "text-gray-500 line-through" : "text-gray-700",
                          )}
                        >
                          {item}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          )}

          {job.status === "pending" && (
            <div className="mt-4 space-y-2.5">
              {!allChecked && (
                <p className="text-[0.6875rem] text-gray-500 leading-snug">
                  Complete the checklist to approve. You can reject at any time.
                </p>
              )}
              <button
                onClick={handleApprove}
                title={
                  allChecked
                    ? undefined
                    : "Tick every checklist item before approving"
                }
                disabled={busy !== null || !allChecked}
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
