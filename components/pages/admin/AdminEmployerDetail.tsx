"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineHashtag,
} from "react-icons/hi2";
import {
  useAdminEmployers,
  suspendAdminEmployer,
  reinstateAdminEmployer,
  type AdminEmployer,
} from "@/hooks/useAdminEmployers";
import { AdminPageHeader, StatusPill } from "./AdminTablePanel";
import ConfirmDialog from "./ConfirmDialog";
import { useToaster } from "@/components/ui/Toaster";

interface Props {
  employerId: string;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AdminEmployerDetail = ({ employerId }: Props) => {
  const { employers, isLoading, mutate } = useAdminEmployers();
  const { showToast } = useToaster();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const employer = useMemo<AdminEmployer | null>(
    () => employers.find((e) => e.id === employerId) ?? null,
    [employers, employerId],
  );

  const isSuspending = employer?.status === "active";

  const handleConfirm = async () => {
    if (!employer) return;
    setBusy(true);
    try {
      if (isSuspending) {
        await suspendAdminEmployer(employer.id);
        showToast({
          type: "success",
          title: "Employer suspended",
        });
      } else {
        await reinstateAdminEmployer(employer.id);
        showToast({ type: "success", title: "Employer reinstated" });
      }
      const next = employers.map((e) =>
        e.id === employer.id
          ? { ...e, status: isSuspending ? "suspended" : "active" }
          : e,
      );
      await mutate(next as AdminEmployer[], false);
      setConfirmOpen(false);
    } catch {
      showToast({ type: "error", title: "Could not update employer" });
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!employer) {
    return (
      <NotFound
        backHref="/admin/employers"
        title="Employer not found"
        description="The employer you're looking for may have been removed."
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/employers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-primary"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to employers
      </Link>

      <AdminPageHeader
        title={employer.company_name}
        description="Employer account"
        actions={
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
          >
            {isSuspending ? "Suspend Employer" : "Reinstate Employer"}
          </button>
        }
      />

      <section className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Profile pulled from the employer&apos;s account.
            </p>
          </div>
          <StatusPill
            tone={
              employer.status === "active"
                ? "emerald"
                : employer.status === "suspended"
                  ? "rose"
                  : "amber"
            }
          >
            {employer.status === "active"
              ? "Active"
              : employer.status === "suspended"
                ? "Suspended"
                : "Pending"}
          </StatusPill>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Field
            icon={HiOutlineBuildingOffice2}
            label="Industry"
            value={employer.industry}
          />
          <Field
            icon={HiOutlineMapPin}
            label="Location"
            value={employer.location}
          />
          <Field
            icon={HiOutlineCalendar}
            label="Registered"
            value={formatDate(employer.registeredAt)}
          />
          <Field icon={HiOutlineHashtag} label="ID" value={employer.id} />
        </dl>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={
          isSuspending ? "Suspend this employer?" : "Reinstate this employer?"
        }
        subject={employer.company_name}
        description={
          isSuspending
            ? "Suspended employers cannot post jobs or message applicants until reinstated."
            : "The employer will regain full access immediately."
        }
        reasonLabel={isSuspending ? "Reason" : undefined}
        reasonPlaceholder={
          isSuspending
            ? "Briefly note why this employer is being suspended"
            : undefined
        }
        confirmLabel={isSuspending ? "Suspend Employer" : "Reinstate Employer"}
        tone={isSuspending ? "danger" : "neutral"}
        busy={busy}
        onClose={() => (busy ? null : setConfirmOpen(false))}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

// ─── Shared subcomponents ────────────────────────────────────────────────────

const Field = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="h-5 w-32 bg-gray-100 rounded animate-shimmer" />
    <div className="h-8 w-2/3 bg-gray-100 rounded animate-shimmer" />
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3">
      <div className="h-4 w-1/3 bg-gray-100 rounded animate-shimmer" />
      <div className="h-3 w-2/3 bg-gray-100 rounded animate-shimmer" />
      <div className="h-3 w-1/2 bg-gray-100 rounded animate-shimmer" />
    </div>
  </div>
);

const NotFound = ({
  backHref,
  title,
  description,
}: {
  backHref: string;
  title: string;
  description: string;
}) => (
  <div className="max-w-2xl mx-auto py-10">
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-10 text-center">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:text-primary-hover"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Go back
      </Link>
    </div>
  </div>
);

export default AdminEmployerDetail;
