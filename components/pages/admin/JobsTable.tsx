"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import clsx from "clsx";
import {
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import {
  useAdminJobQueue,
  approveAdminJob,
  rejectAdminJob,
  unpublishAdminJob,
  type AdminJob,
  type AdminJobStatus,
} from "@/hooks/useAdminJobQueue";
import { adminJobCounts } from "@/lib/api/jobs";
import { useToaster } from "@/components/ui/Toaster";
import {
  AdminPageHeader,
  AdminTablePanel,
  AdminTable,
  AdminTableHead,
  AdminTableTh,
  AdminTableBody,
  AdminTableRow,
  AdminTableTd,
  AdminRowSkeleton,
  AdminEmptyState,
  StatusPill,
} from "./AdminTablePanel";
import KebabMenu, { type KebabAction } from "./KebabMenu";
import DetailDrawer from "./DetailDrawer";
import AdminJobDetail from "./AdminJobDetail";
import ConfirmDialog from "./ConfirmDialog";
import ScrapeJobsButton from "./ScrapeJobsButton";

const FILTERS: { value: AdminJobStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_TONE: Record<AdminJobStatus, "amber" | "emerald" | "rose"> = {
  pending: "amber",
  approved: "emerald",
  rejected: "rose",
};

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: "amber" | "emerald" | "rose" | "indigo";
}) => {
  const map = {
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  } as const;
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={clsx(
            "w-11 h-11 rounded-xl ring-1 flex items-center justify-center shrink-0",
            map[tone],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

/**
 * Job moderation — one page for every listing, with standing as a filter
 * rather than separate routes. Details and review actions open in a drawer.
 * Scraped listings are excluded server-side: admins moderate Vetriconn posts.
 */
const JobsTable = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<AdminJobStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { jobs, pagination, isLoading, mutate } = useAdminJobQueue(status, page);
  const { data: counts, mutate: mutateCounts } = useSWR(
    "admin-job-counts",
    adminJobCounts,
  );
  const { showToast } = useToaster();

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AdminJob | null>(null);
  const [unpublishing, setUnpublishing] = useState<AdminJob | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);

  // Deep link: /admin/jobs?job=<id> opens that job's drawer, so notification
  // and dashboard links still land on the subject now that details live here.
  useEffect(() => {
    const deepLink = searchParams.get("job");
    if (deepLink) setDrawerId(deepLink);
  }, [searchParams]);

  const refresh = () => {
    mutate();
    mutateCounts();
  };

  const handleApprove = async (job: AdminJob) => {
    setBusyId(job.id);
    try {
      await approveAdminJob(job.id);
      showToast({ type: "success", title: "Job approved" });
      refresh();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't approve job",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!rejecting || !reason?.trim()) return;
    setDialogBusy(true);
    try {
      await rejectAdminJob(rejecting.id, reason.trim());
      showToast({ type: "success", title: "Job rejected" });
      setRejecting(null);
      refresh();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't reject job",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDialogBusy(false);
    }
  };

  const handleUnpublish = async (reason?: string) => {
    if (!unpublishing || !reason?.trim()) return;
    setDialogBusy(true);
    try {
      await unpublishAdminJob(unpublishing.id, reason.trim());
      showToast({ type: "success", title: "Job unpublished" });
      setUnpublishing(null);
      refresh();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't unpublish job",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDialogBusy(false);
    }
  };

  const rowActions = (job: AdminJob): KebabAction[] => {
    const actions: KebabAction[] = [
      {
        label: "View details",
        icon: HiOutlineEye,
        onClick: () => setDrawerId(job.id),
      },
    ];
    if (job.status === "pending") {
      actions.push({
        label: "Approve",
        icon: HiOutlineCheck,
        onClick: () => handleApprove(job),
        disabled: busyId === job.id,
      });
      actions.push({
        label: "Reject",
        icon: HiOutlineXMark,
        danger: true,
        onClick: () => setRejecting(job),
      });
    } else if (job.status === "approved") {
      actions.push({
        label: "Unpublish",
        icon: HiOutlineXCircle,
        danger: true,
        onClick: () => setUnpublishing(job),
      });
    } else if (job.status === "rejected") {
      actions.push({
        label: "Approve",
        icon: HiOutlineCheck,
        onClick: () => handleApprove(job),
        disabled: busyId === job.id,
      });
    }
    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Jobs"
        description="Review job postings before they go live on the board"
        actions={<ScrapeJobsButton />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          icon={HiOutlineClock}
          label="Pending"
          value={counts?.pending ?? "—"}
          tone="amber"
        />
        <StatCard
          icon={HiOutlineCheckCircle}
          label="Approved"
          value={counts?.approved ?? "—"}
          tone="emerald"
        />
        <StatCard
          icon={HiOutlineXCircle}
          label="Rejected"
          value={counts?.rejected ?? "—"}
          tone="rose"
        />
        <StatCard
          icon={HiOutlineBriefcase}
          label="Total"
          value={counts?.total ?? "—"}
          tone="indigo"
        />
      </div>

      {/* Status filter */}
      <div
        className="inline-flex flex-wrap rounded-xl border border-gray-200 bg-white p-1"
        role="tablist"
        aria-label="Job status"
      >
        {FILTERS.map((f) => {
          const active = status === f.value;
          const count = f.value === "all" ? counts?.total : counts?.[f.value];
          return (
            <button
              key={f.value}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={clsx(
                "px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              {f.label}
              {typeof count === "number" && count > 0 && (
                <span
                  className={clsx(
                    "ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Role</AdminTableTh>
            <AdminTableTh>Company</AdminTableTh>
            <AdminTableTh>Location</AdminTableTh>
            <AdminTableTh>Status</AdminTableTh>
            <AdminTableTh>Submitted</AdminTableTh>
            <AdminTableTh align="right">Actions</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={6} />
                ))
              : jobs.map((job) => (
                  <AdminTableRow key={job.id}>
                    <AdminTableTd className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDrawerId(job.id)}
                          className="text-left hover:text-primary"
                        >
                          {job.role}
                        </button>
                        {!!job.scam_flags?.length && (
                          <span
                            title={`Scam signals: ${job.scam_flags.join(", ")}`}
                            className="inline-flex items-center text-amber-500"
                          >
                            <HiOutlineExclamationTriangle className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600">
                      {job.company_name || "—"}
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600">
                      {job.location || "—"}
                    </AdminTableTd>
                    <AdminTableTd>
                      <StatusPill tone={STATUS_TONE[job.status]}>
                        {job.status}
                      </StatusPill>
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600 tabular-nums">
                      {formatDate(job.submittedAt)}
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      <KebabMenu actions={rowActions(job)} />
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>

        {!isLoading && jobs.length === 0 && (
          <AdminEmptyState
            title="No jobs"
            description={
              status === "all"
                ? "No jobs have been posted yet."
                : `No ${status} jobs.`
            }
            icon={HiOutlineBriefcase}
          />
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 px-5 md:px-6 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 tabular-nums">
              Page {pagination.currentPage} of {pagination.totalPages} ·{" "}
              {pagination.totalItems} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </AdminTablePanel>

      <DetailDrawer
        open={!!drawerId}
        title="Job details"
        onClose={() => setDrawerId(null)}
      >
        {drawerId && <AdminJobDetail jobId={drawerId} onChanged={refresh} />}
      </DetailDrawer>

      <ConfirmDialog
        open={!!rejecting}
        title="Reject this job?"
        subject={rejecting?.role}
        description="A reason is required and is shown to the poster."
        reasonLabel="Reason for rejection"
        reasonPlaceholder="What needs to change?"
        confirmLabel="Reject Job"
        tone="danger"
        busy={dialogBusy}
        onClose={() => (dialogBusy ? null : setRejecting(null))}
        onConfirm={handleReject}
      />

      <ConfirmDialog
        open={!!unpublishing}
        title="Unpublish this job?"
        subject={unpublishing?.role}
        description="The listing comes off the public board and returns to the moderated states."
        reasonLabel="Reason"
        reasonPlaceholder="Why is this coming down?"
        confirmLabel="Unpublish"
        tone="danger"
        busy={dialogBusy}
        onClose={() => (dialogBusy ? null : setUnpublishing(null))}
        onConfirm={handleUnpublish}
      />
    </div>
  );
};

export default JobsTable;
