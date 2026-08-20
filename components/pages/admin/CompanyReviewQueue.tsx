"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineEnvelope,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";
import {
  adminApproveCompany,
  adminRejectCompany,
  type Company,
  type CompanyStatus,
} from "@/lib/api";
import { useAdminCompanies } from "@/hooks/useCompanies";
import { useToaster } from "@/components/ui/Toaster";
import { AdminPageHeader } from "./AdminTablePanel";

/**
 * Company vetting queue.
 *
 * Mirrors the job review queue: a company sits in `pending` until an admin
 * approves it, and only then can its members post jobs under it. Rejection
 * requires a reason, which is shown back to the applicant.
 */

const STATUS_META: Record<
  CompanyStatus,
  {
    title: string;
    description: string;
    pillClass: string;
    pillIcon: React.ComponentType<{ className?: string }>;
    pillLabel: string;
    empty: string;
  }
> = {
  pending: {
    title: "Company Review Queue",
    description: "Vet company applications before they can post jobs",
    pillClass: "bg-amber-50 text-amber-700 ring-amber-200/70",
    pillIcon: HiOutlineClock,
    pillLabel: "Pending Review",
    empty: "No companies are waiting for review.",
  },
  approved: {
    title: "Approved Companies",
    description: "Companies currently able to post jobs as an organisation",
    pillClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    pillIcon: HiOutlineCheckCircle,
    pillLabel: "Approved",
    empty: "No companies have been approved yet.",
  },
  rejected: {
    title: "Rejected Companies",
    description: "Applications that did not pass review",
    pillClass: "bg-rose-50 text-rose-700 ring-rose-200/70",
    pillIcon: HiOutlineXCircle,
    pillLabel: "Rejected",
    empty: "No companies have been rejected.",
  },
};

const DetailRow = ({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
    <Icon className="w-4 h-4 shrink-0" />
    {children}
  </span>
);

export const CompanyReviewQueue = ({ status }: { status: CompanyStatus }) => {
  const meta = STATUS_META[status];
  const PillIcon = meta.pillIcon;

  const { companies, isLoading, isError, error, mutate } =
    useAdminCompanies(status);
  const { showToast } = useToaster();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Company | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const handleApprove = async (company: Company) => {
    setBusyId(company._id);
    try {
      await adminApproveCompany(company._id);
      showToast({
        type: "success",
        title: "Company approved",
        description: `${company.name} can now post jobs as an organisation.`,
      });
      await mutate();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't approve company",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;

    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError("A reason is required — the applicant sees this.");
      return;
    }
    if (trimmed.length > 500) {
      setReasonError("Keep the reason under 500 characters.");
      return;
    }

    setBusyId(rejecting._id);
    try {
      await adminRejectCompany(rejecting._id, trimmed);
      showToast({
        type: "success",
        title: "Company rejected",
        description: `${rejecting.name} was notified with your reason.`,
      });
      setRejecting(null);
      setReason("");
      setReasonError(null);
      await mutate();
    } catch (err) {
      setReasonError(
        err instanceof Error ? err.message : "Please try again in a moment.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={meta.title}
        description={meta.description}
        actions={
          <span
            className={clsx(
              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1",
              meta.pillClass,
            )}
          >
            <PillIcon className="w-3.5 h-3.5" />
            {meta.pillLabel}
          </span>
        }
      />

      {isLoading && (
        <p className="text-sm text-gray-400 py-8 text-center">
          Loading companies…
        </p>
      )}

      {isError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-sm text-red-700">
            {error instanceof Error
              ? error.message
              : "We couldn't load the review queue."}
          </p>
        </div>
      )}

      {!isLoading && !isError && companies.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <HiOutlineBuildingOffice2 className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500">{meta.empty}</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {companies.map((company) => (
          <article
            key={company._id}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {company.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HiOutlineBuildingOffice2 className="w-6 h-6 text-gray-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  {company.name}
                </h2>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                  {company.industry && (
                    <DetailRow icon={HiOutlineBuildingOffice2}>
                      {company.industry}
                    </DetailRow>
                  )}
                  {(company.city || company.country) && (
                    <DetailRow icon={HiOutlineMapPin}>
                      {[company.city, company.country]
                        .filter(Boolean)
                        .join(", ")}
                    </DetailRow>
                  )}
                  {company.email && (
                    <DetailRow icon={HiOutlineEnvelope}>
                      {company.email}
                    </DetailRow>
                  )}
                  {company.website && (
                    <DetailRow icon={HiOutlineGlobeAlt}>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        {company.website}
                      </a>
                    </DetailRow>
                  )}
                </div>

                {company.about_company && (
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                    {company.about_company}
                  </p>
                )}

                {status === "rejected" && company.rejection_reason && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-rose-700 mb-0.5">
                      Rejection reason
                    </p>
                    <p className="text-xs text-rose-600">
                      {company.rejection_reason}
                    </p>
                  </div>
                )}

                {status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(company)}
                      disabled={busyId === company._id}
                      className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium text-sm rounded-lg transition-colors"
                    >
                      <HiOutlineCheck className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejecting(company);
                        setReason("");
                        setReasonError(null);
                      }}
                      disabled={busyId === company._id}
                      className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-medium text-sm rounded-lg transition-colors"
                    >
                      <HiOutlineXMark className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Reject dialog */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setRejecting(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Reject ${rejecting.name}`}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Reject {rejecting.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              The applicant sees this reason, so be specific about what would
              need to change.
            </p>

            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError(null);
              }}
              maxLength={500}
              autoFocus
              aria-label="Rejection reason"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1 mb-3">
              {reason.length} / 500
            </p>

            {reasonError && (
              <p className="text-sm text-red-600 mb-3" role="alert">
                {reasonError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReject}
                disabled={busyId === rejecting._id}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors"
              >
                {busyId === rejecting._id ? "Rejecting…" : "Reject company"}
              </button>
              <button
                type="button"
                onClick={() => setRejecting(null)}
                className="py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyReviewQueue;
