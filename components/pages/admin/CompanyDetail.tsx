"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import {
  HiOutlineBuildingOffice2,
  HiOutlineUser,
  HiOutlineCheckBadge,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import {
  adminGetCompany,
  adminApproveCompany,
  adminRejectCompany,
  adminSuspendCompany,
  adminReinstateCompany,
  type AdminCompanyDetail,
  type CompanyStatus,
} from "@/lib/api/companies";
import { StatusPill } from "./AdminTablePanel";
import StepUpDialog, { type StepUpCreds } from "./StepUpDialog";
import ConfirmDialog from "./ConfirmDialog";
import { useToaster } from "@/components/ui/Toaster";
import { safeHttpUrl } from "@/lib/safe-url";

const STATUS_TONE: Record<CompanyStatus, "amber" | "emerald" | "rose" | "gray"> = {
  pending: "amber",
  approved: "emerald",
  rejected: "rose",
  suspended: "gray",
};

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const Field = ({
  label,
  value,
  href,
}: {
  label: string;
  value?: React.ReactNode;
  href?: string;
}) => (
  <div>
    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900 break-words">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {value}
        </a>
      ) : value ? (
        value
      ) : (
        <span className="text-gray-400">Not provided</span>
      )}
    </dd>
  </div>
);

const CompanyDetail = ({
  companyId,
  onChanged,
}: {
  companyId: string;
  onChanged?: () => void;
}) => {
  const { data: company, isLoading, mutate } = useSWR<AdminCompanyDetail>(
    ["admin-company", companyId],
    () => adminGetCompany(companyId),
  );
  const { showToast } = useToaster();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectBusy, setRejectBusy] = useState(false);
  const [stepUp, setStepUp] = useState<"suspend" | "reinstate" | null>(null);
  const [stepUpBusy, setStepUpBusy] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-sm text-gray-500">
        Loading company…
      </div>
    );
  }
  if (!company) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-sm text-gray-500">
        Company not found.
      </div>
    );
  }

  const location = [company.city, company.state_province, company.country]
    .filter(Boolean)
    .join(", ");
  const website = safeHttpUrl(company.website);

  const handleApprove = async () => {
    setBusy(true);
    try {
      await adminApproveCompany(company._id);
      showToast({ type: "success", title: "Company approved" });
      await mutate();
      onChanged?.();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't approve",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!reason?.trim()) return;
    setRejectBusy(true);
    try {
      await adminRejectCompany(company._id, reason.trim());
      showToast({ type: "success", title: "Company rejected" });
      setRejecting(false);
      await mutate();
      onChanged?.();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't reject",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setRejectBusy(false);
    }
  };

  const handleStepUp = async (creds: StepUpCreds) => {
    if (!stepUp) return;
    setStepUpBusy(true);
    try {
      if (stepUp === "suspend") {
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
        title: stepUp === "suspend" ? "Company suspended" : "Company reinstated",
      });
      setStepUp(null);
      await mutate();
      onChanged?.();
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

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <HiOutlineBuildingOffice2 className="w-7 h-7 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
              <StatusPill tone={STATUS_TONE[company.status]}>
                {company.status}
              </StatusPill>
              {company.authorized_rep_verified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <HiOutlineCheckBadge className="w-4 h-4" /> Rep verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {company.tagline || company.industry || "—"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {company.status === "pending" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  <HiOutlineCheck className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <HiOutlineXMark className="w-4 h-4" /> Reject
                </button>
              </>
            )}
            {company.status === "approved" && (
              <button
                onClick={() => setStepUp("suspend")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rose-200 bg-white text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                Suspend
              </button>
            )}
            {company.status === "suspended" && (
              <button
                onClick={() => setStepUp("reinstate")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Reinstate
              </button>
            )}
          </div>
        </div>
        {company.status === "rejected" && company.rejection_reason && (
          <p className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            <span className="font-semibold">Rejection reason:</span>{" "}
            {company.rejection_reason}
          </p>
        )}
      </div>

      {/* Requesting account */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">
          Requesting account
        </h2>
        {company.owner ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {company.owner.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.owner.picture}
                    alt={company.owner.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HiOutlineUser className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {company.owner.full_name || "—"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {company.owner.email}
                </p>
              </div>
            </div>
            <Link
              href={`/admin/users/${company.owner.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shrink-0"
            >
              View profile
              <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Owner account not found.</p>
        )}
      </div>

      {/* Submitted details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">
          Submitted details
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Industry" value={company.industry} />
          <Field label="Company size" value={company.size} />
          <Field label="Location" value={location} />
          <Field
            label="Email"
            value={company.email}
            href={company.email ? `mailto:${company.email}` : undefined}
          />
          <Field label="Phone" value={company.phone_number} />
          <Field label="Website" value={website} href={website} />
          <Field label="RC number" value={company.rc_number} />
          <Field
            label="Registration authority"
            value={company.registration_authority}
          />
          <Field label="Business number" value={company.business_number} />
          <Field label="Submitted" value={formatDate(company.createdAt)} />
        </dl>
        {company.about_company && (
          <div className="mt-6">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              About
            </dt>
            <dd className="mt-1 text-sm text-gray-700 whitespace-pre-line">
              {company.about_company}
            </dd>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={rejecting}
        title="Reject this company?"
        subject={company.name}
        description="A reason is required and is shown to the applicant."
        reasonLabel="Reason for rejection"
        reasonPlaceholder="What was missing or wrong?"
        confirmLabel="Reject Company"
        tone="danger"
        busy={rejectBusy}
        onClose={() => (rejectBusy ? null : setRejecting(false))}
        onConfirm={handleReject}
      />
      {stepUp && (
        <StepUpDialog
          open
          title={
            stepUp === "suspend"
              ? "Suspend this company?"
              : "Reinstate this company?"
          }
          description={
            stepUp === "suspend"
              ? `${company.name} will stop being able to post jobs.`
              : `${company.name} can post jobs again.`
          }
          confirmLabel={stepUp === "suspend" ? "Suspend" : "Reinstate"}
          requireReason={stepUp === "suspend"}
          danger={stepUp === "suspend"}
          busy={stepUpBusy}
          onClose={() => (stepUpBusy ? null : setStepUp(null))}
          onConfirm={handleStepUp}
        />
      )}
    </div>
  );
};

export default CompanyDetail;
