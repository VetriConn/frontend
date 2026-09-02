"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import clsx from "clsx";
import {
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlinePauseCircle,
  HiOutlinePlayCircle,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import {
  adminApproveCompany,
  adminRejectCompany,
  adminSuspendCompany,
  adminReinstateCompany,
  adminCompanyCounts,
  type Company,
  type CompanyStatus,
} from "@/lib/api/companies";
import { useAdminCompanies } from "@/hooks/useCompanies";
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
import CompanyDetail from "./CompanyDetail";
import StepUpDialog, { type StepUpCreds } from "./StepUpDialog";
import ConfirmDialog from "./ConfirmDialog";
import { formatDate } from "@/lib/date-utils";

const FILTERS: { value: CompanyStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const STATUS_TONE: Record<CompanyStatus, "amber" | "emerald" | "rose" | "gray"> =
  {
    pending: "amber",
    approved: "emerald",
    rejected: "rose",
    suspended: "gray",
  };


// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: "amber" | "emerald" | "indigo" | "gray";
}) => {
  const map = {
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    gray: "bg-gray-100 text-gray-600 ring-gray-200",
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export const CompanyReviewQueue = () => {
  const searchParams = useSearchParams();
  // One page for every company; standing is a filter, not a separate route.
  const [status, setStatus] = useState<CompanyStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { companies, pagination, isLoading, mutate } = useAdminCompanies(
    status,
    page,
  );
  const { data: counts, mutate: mutateCounts } = useSWR(
    "admin-company-counts",
    adminCompanyCounts,
  );
  const { showToast } = useToaster();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Company | null>(null);
  const [rejectBusy, setRejectBusy] = useState(false);
  const [stepUp, setStepUp] = useState<{
    company: Company;
    action: "suspend" | "reinstate";
  } | null>(null);
  const [stepUpBusy, setStepUpBusy] = useState(false);

  // Deep link: /admin/companies?company=<id> opens that company's drawer.
  useEffect(() => {
    const deepLink = searchParams.get("company");
    if (deepLink) setDrawerId(deepLink);
  }, [searchParams]);

  const refresh = () => {
    mutate();
    mutateCounts();
  };

  const handleApprove = async (company: Company) => {
    setBusyId(company._id);
    try {
      await adminApproveCompany(company._id);
      showToast({ type: "success", title: "Company approved" });
      refresh();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't approve company",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!rejecting || !reason?.trim()) return;
    setRejectBusy(true);
    try {
      await adminRejectCompany(rejecting._id, reason.trim());
      showToast({ type: "success", title: "Company rejected" });
      setRejecting(null);
      refresh();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't reject company",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setRejectBusy(false);
    }
  };

  const handleStepUpConfirm = async (creds: StepUpCreds) => {
    if (!stepUp) return;
    const { company, action } = stepUp;
    setStepUpBusy(true);
    try {
      if (action === "suspend") {
        await adminSuspendCompany(company._id, {
          reason: creds.reason,
          password: creds.password,
          totp_code: creds.totp_code,
        });
      } else {
        await adminReinstateCompany(company._id, {
          password: creds.password,
          totp_code: creds.totp_code,
        });
      }
      showToast({
        type: "success",
        title: action === "suspend" ? "Company suspended" : "Company reinstated",
      });
      setStepUp(null);
      refresh();
    } catch (err) {
      showToast({
        type: "error",
        title: "Action failed",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setStepUpBusy(false);
    }
  };

  const rowActions = (company: Company): KebabAction[] => {
    const actions: KebabAction[] = [
      {
        label: "View details",
        icon: HiOutlineEye,
        onClick: () => setDrawerId(company._id),
      },
    ];
    if (company.status === "pending") {
      actions.push({
        label: "Approve",
        icon: HiOutlineCheck,
        onClick: () => handleApprove(company),
        disabled: busyId === company._id,
      });
      actions.push({
        label: "Reject",
        icon: HiOutlineXMark,
        danger: true,
        onClick: () => setRejecting(company),
      });
    } else if (company.status === "approved") {
      actions.push({
        label: "Suspend",
        icon: HiOutlinePauseCircle,
        danger: true,
        onClick: () => setStepUp({ company, action: "suspend" }),
      });
    } else if (company.status === "suspended") {
      actions.push({
        label: "Reinstate",
        icon: HiOutlinePlayCircle,
        onClick: () => setStepUp({ company, action: "reinstate" }),
      });
    }
    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Companies"
        description="Vet company applications and manage organisations that post jobs"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          icon={HiOutlineClock}
          label="Pending"
          value={counts?.pending ?? "-"}
          tone="amber"
        />
        <StatCard
          icon={HiOutlineCheckCircle}
          label="Approved"
          value={counts?.approved ?? "-"}
          tone="emerald"
        />
        <StatCard
          icon={HiOutlinePauseCircle}
          label="Suspended"
          value={counts?.suspended ?? "-"}
          tone="gray"
        />
        <StatCard
          icon={HiOutlineBuildingOffice2}
          label="Total"
          value={counts?.total ?? "-"}
          tone="indigo"
        />
      </div>

      {/* Status filter */}
      <div
        className="inline-flex flex-wrap rounded-xl border border-gray-200 bg-white p-1"
        role="tablist"
        aria-label="Company status"
      >
        {FILTERS.map((f) => {
          const active = status === f.value;
          const count =
            f.value === "all" ? counts?.total : counts?.[f.value];
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
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600",
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
            <AdminTableTh>Company</AdminTableTh>
            <AdminTableTh>Industry</AdminTableTh>
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
              : companies.map((company) => (
                  <AdminTableRow key={company._id} onOpen={() => setDrawerId(company._id)}>
                    <AdminTableTd className="font-semibold text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {company.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={company.logo_url}
                              alt={company.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <HiOutlineBuildingOffice2 className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <button
                          onClick={() => setDrawerId(company._id)}
                          className="text-left hover:text-primary"
                        >
                          {company.name}
                        </button>
                      </div>
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600">
                      {company.industry || "-"}
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600">
                      {[company.city, company.country]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </AdminTableTd>
                    <AdminTableTd>
                      <StatusPill tone={STATUS_TONE[company.status]}>
                        {company.status}
                      </StatusPill>
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600 tabular-nums">
                      {formatDate(company.createdAt)}
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      <KebabMenu actions={rowActions(company)} />
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>

        {!isLoading && companies.length === 0 && (
          <AdminEmptyState
            title="No companies"
            description={
              status === "all"
                ? "No companies have applied yet."
                : `No ${status} companies.`
            }
            icon={HiOutlineBuildingOffice2}
          />
        )}

        {/* Pagination */}
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

      {/* Detail drawer */}
      <DetailDrawer
        open={!!drawerId}
        title="Company details"
        onClose={() => setDrawerId(null)}
      >
        {drawerId && <CompanyDetail companyId={drawerId} onChanged={refresh} />}
      </DetailDrawer>

      {/* Reject dialog */}
      <ConfirmDialog
        open={!!rejecting}
        title="Reject this company?"
        subject={rejecting?.name}
        description="A reason is required and is shown to the applicant."
        reasonLabel="Reason for rejection"
        reasonPlaceholder="What was missing or wrong?"
        confirmLabel="Reject Company"
        tone="danger"
        busy={rejectBusy}
        onClose={() => (rejectBusy ? null : setRejecting(null))}
        onConfirm={handleReject}
      />

      {/* Suspend / reinstate step-up */}
      {stepUp && (
        <StepUpDialog
          open
          title={
            stepUp.action === "suspend"
              ? "Suspend this company?"
              : "Reinstate this company?"
          }
          description={
            stepUp.action === "suspend"
              ? `${stepUp.company.name} will stop being able to post jobs.`
              : `${stepUp.company.name} can post jobs again.`
          }
          confirmLabel={stepUp.action === "suspend" ? "Suspend" : "Reinstate"}
          requireReason={stepUp.action === "suspend"}
          danger={stepUp.action === "suspend"}
          busy={stepUpBusy}
          onClose={() => (stepUpBusy ? null : setStepUp(null))}
          onConfirm={handleStepUpConfirm}
        />
      )}
    </div>
  );
};

export default CompanyReviewQueue;
