"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineEnvelope,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineHashtag,
} from "react-icons/hi2";
import {
  useAdminUsers,
  suspendAdminUser,
  reinstateAdminUser,
  type AdminUser,
} from "@/hooks/useAdminUsers";
import { AdminPageHeader, StatusPill } from "./AdminTablePanel";
import ConfirmDialog from "./ConfirmDialog";
import { useToaster } from "@/components/ui/Toaster";

interface Props {
  userId: string;
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

const AdminUserDetail = ({ userId }: Props) => {
  const { users, isLoading, mutate } = useAdminUsers();
  const { showToast } = useToaster();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const user = useMemo<AdminUser | null>(
    () => users.find((u) => u.id === userId) ?? null,
    [users, userId],
  );

  const isSuspending = user?.status === "active";

  const handleConfirm = async (reason?: string) => {
    if (!user) return;
    setBusy(true);
    try {
      if (isSuspending) {
        await suspendAdminUser(user.id, reason ?? "");
        showToast({ type: "success", title: "User suspended" });
      } else {
        await reinstateAdminUser(user.id);
        showToast({ type: "success", title: "User reinstated" });
      }
      const next = users.map((u) =>
        u.id === user.id
          ? { ...u, status: isSuspending ? "suspended" : "active" }
          : u,
      );
      await mutate(next as AdminUser[], false);
      setConfirmOpen(false);
    } catch {
      showToast({ type: "error", title: "Could not update user" });
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
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
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-10 text-center">
          <h1 className="text-base font-semibold text-gray-900">
            User not found
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            The account you&apos;re looking for may have been removed.
          </p>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-primary"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to users
      </Link>

      <AdminPageHeader
        title={user.full_name}
        description="Job seeker account"
        actions={
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
          >
            {isSuspending ? "Suspend User" : "Reinstate User"}
          </button>
        }
      />

      <section className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Activity at a glance.
            </p>
          </div>
          <StatusPill tone={user.status === "active" ? "emerald" : "rose"}>
            {user.status === "active" ? "Active" : "Suspended"}
          </StatusPill>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Field icon={HiOutlineEnvelope} label="Email" value={user.email} />
          <Field
            icon={HiOutlineCalendar}
            label="Registered"
            value={formatDate(user.registeredAt)}
          />
          <Field
            icon={HiOutlineDocumentText}
            label="Applications"
            value={String(user.applications)}
          />
          <Field icon={HiOutlineHashtag} label="ID" value={user.id} />
        </dl>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={isSuspending ? "Suspend this user?" : "Reinstate this user?"}
        subject={user.full_name}
        description={
          isSuspending
            ? "Suspended users cannot sign in or apply to jobs until reinstated."
            : "The user will regain access immediately."
        }
        reasonLabel={isSuspending ? "Reason" : undefined}
        reasonPlaceholder={
          isSuspending ? "Note why this user is being suspended" : undefined
        }
        confirmLabel={isSuspending ? "Suspend User" : "Reinstate User"}
        tone={isSuspending ? "danger" : "neutral"}
        busy={busy}
        onClose={() => (busy ? null : setConfirmOpen(false))}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

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

export default AdminUserDetail;
