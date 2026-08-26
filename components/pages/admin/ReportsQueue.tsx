"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  HiOutlineFlag,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
} from "react-icons/hi2";
import {
  useAdminReports,
  useReportCounts,
  resolveAdminReport,
  TARGET_TYPE_LABEL,
  REASON_LABEL,
  type AdminReport,
  type ReportStatus,
  type ReportTargetType,
} from "@/hooks/useAdminReports";
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
  AdminStatCard,
  AdminStatRow,
} from "./AdminTablePanel";
import KebabMenu, { type KebabAction } from "./KebabMenu";
import { useToaster } from "@/components/ui/Toaster";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const reasonTone = (reason: string): "rose" | "amber" | "gray" => {
  if (reason === "scam" || reason === "abuse") return "rose";
  if (reason === "spam" || reason === "inappropriate") return "amber";
  return "gray";
};

const STATUS_TABS: { value: ReportStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const TYPE_TABS: { value: ReportTargetType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "job", label: "Jobs" },
  { value: "company", label: "Companies" },
  { value: "company_member", label: "Members" },
];

const ReportsQueue = () => {
  const [status, setStatus] = useState<ReportStatus>("open");
  const [type, setType] = useState<ReportTargetType | "all">("all");
  const { reports, isLoading, mutate } = useAdminReports(
    status,
    type === "all" ? undefined : type,
  );
  const { counts, total: openTotal, mutate: mutateCounts } = useReportCounts();
  const { showToast } = useToaster();
  const [busyId, setBusyId] = useState<string | null>(null);

  const act = async (id: string, next: "resolved" | "dismissed") => {
    setBusyId(id);
    try {
      await resolveAdminReport(id, next);
      showToast({
        type: "success",
        title: next === "resolved" ? "Report resolved" : "Report dismissed",
      });
      await Promise.all([mutate(), mutateCounts()]);
    } catch {
      showToast({ type: "error", title: "Could not update report" });
    } finally {
      setBusyId(null);
    }
  };

  const rowActions = (r: AdminReport): KebabAction[] => [
    {
      label: "Resolve",
      icon: HiOutlineCheck,
      onClick: () => act(r.id, "resolved"),
      disabled: busyId === r.id,
    },
    {
      label: "Dismiss",
      icon: HiOutlineXMark,
      onClick: () => act(r.id, "dismissed"),
      disabled: busyId === r.id,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Reports"
        description="Abuse reports across jobs, companies, and company members."
      />

      <AdminStatRow>
        <AdminStatCard
          icon={HiOutlineFlag}
          label="Open reports"
          value={openTotal}
          tone="rose"
        />
        <AdminStatCard
          icon={HiOutlineBriefcase}
          label="On jobs"
          value={counts.job ?? 0}
          tone="amber"
        />
        <AdminStatCard
          icon={HiOutlineBuildingOffice2}
          label="On companies"
          value={counts.company ?? 0}
          tone="indigo"
        />
        <AdminStatCard
          icon={HiOutlineUsers}
          label="On members"
          value={counts.company_member ?? 0}
          tone="gray"
        />
      </AdminStatRow>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="inline-flex rounded-xl border border-gray-200 bg-white p-1"
          role="tablist"
          aria-label="Report status"
        >
          {STATUS_TABS.map((tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={active}
                onClick={() => setStatus(tab.value)}
                className={clsx(
                  "px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                {tab.label}
                {tab.value === "open" && openTotal > 0 && (
                  <span
                    className={clsx(
                      "ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold",
                      active ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700",
                    )}
                  >
                    {openTotal}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          className="inline-flex rounded-xl border border-gray-200 bg-white p-1"
          role="tablist"
          aria-label="Report type"
        >
          {TYPE_TABS.map((tab) => {
            const active = type === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={active}
                onClick={() => setType(tab.value)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Target</AdminTableTh>
            <AdminTableTh>Reason</AdminTableTh>
            <AdminTableTh>Reporter</AdminTableTh>
            <AdminTableTh>Reported</AdminTableTh>
            <AdminTableTh align="right">
              {status === "open" ? "Actions" : "Status"}
            </AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={5} />
                ))
              : reports.map((r) => (
                  <AdminTableRow key={r.id}>
                    <AdminTableTd className="font-semibold text-gray-900">
                      <div className="flex flex-col gap-0.5">
                        {r.target_href ? (
                          <Link
                            href={r.target_href}
                            className="hover:text-primary"
                          >
                            {r.target_label}
                          </Link>
                        ) : (
                          <span>{r.target_label}</span>
                        )}
                        <span className="text-[11px] font-medium text-gray-400">
                          {TARGET_TYPE_LABEL[r.target_type]}
                        </span>
                      </div>
                    </AdminTableTd>
                    <AdminTableTd>
                      <div className="flex flex-col gap-1">
                        <StatusPill tone={reasonTone(r.reason)}>
                          {REASON_LABEL[r.reason] ?? r.reason}
                        </StatusPill>
                        {r.details && (
                          <span
                            className="text-[11px] text-gray-500 max-w-xs truncate"
                            title={r.details}
                          >
                            {r.details}
                          </span>
                        )}
                      </div>
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600">
                      {r.reporter ? (
                        <div className="flex flex-col">
                          {r.reporter.name && (
                            <span className="text-gray-800">
                              {r.reporter.name}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">
                            {r.reporter.email || "—"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Anonymous</span>
                      )}
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600 tabular-nums">
                      {formatDate(r.createdAt)}
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      {status === "open" ? (
                        <KebabMenu actions={rowActions(r)} />
                      ) : (
                        <StatusPill
                          tone={status === "resolved" ? "emerald" : "gray"}
                        >
                          {status === "resolved" ? "Resolved" : "Dismissed"}
                        </StatusPill>
                      )}
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>
        {!isLoading && reports.length === 0 && (
          <AdminEmptyState
            title={
              status === "open" ? "No open reports" : `No ${status} reports`
            }
            description={
              status === "open"
                ? "When users report a job, company, or member, it appears here."
                : "Nothing to show for this filter."
            }
            icon={HiOutlineFlag}
          />
        )}
      </AdminTablePanel>
    </div>
  );
};

export default ReportsQueue;
