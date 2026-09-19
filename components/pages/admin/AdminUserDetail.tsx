"use client";

import { useState } from "react";
import {
  HiOutlineEnvelope,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineHashtag,
} from "react-icons/hi2";
import {
  useAdminMember,
  suspendAdminUser,
  reinstateAdminUser,
} from "@/hooks/useAdminUsers";
import {
  AdminPageHeader,
  AdminBackLink,
  AdminNotFound,
  AdminDetailField,
  StatusPill,
} from "./AdminTablePanel";
import ConfirmDialog from "./ConfirmDialog";
import { userStandingConfirm } from "./confirmCopy";
import { useToaster } from "@/components/ui/Toaster";
import { formatDate } from "@/lib/date-utils";

interface Props {
  userId: string;
}


const AdminUserDetail = ({ userId }: Props) => {
  const { user, isLoading, mutate } = useAdminMember(userId);
  const { showToast } = useToaster();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

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
      await mutate(
        { ...user, status: isSuspending ? "suspended" : "active" },
        false,
      );
      setConfirmOpen(false);
    } catch {
      showToast({ type: "error", title: "Couldn't update user" });
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
      <AdminNotFound
        title="User not found"
        description="The account you're looking for may have been removed."
        backHref="/admin/users"
        backLabel="Back to users"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdminBackLink href="/admin/users">Back to users</AdminBackLink>

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
          <AdminDetailField
            icon={HiOutlineEnvelope}
            label="Email"
            value={user.email}
          />
          <AdminDetailField
            icon={HiOutlineCalendar}
            label="Registered"
            value={formatDate(user.registeredAt)}
          />
          <AdminDetailField
            icon={HiOutlineDocumentText}
            label="Applications"
            value={String(user.applications)}
          />
          <AdminDetailField
            icon={HiOutlineHashtag}
            label="ID"
            value={user.id}
          />
        </dl>
      </section>

      <ConfirmDialog
        {...userStandingConfirm(isSuspending)}
        open={confirmOpen}
        subject={user.full_name}
        busy={busy}
        onClose={() => (busy ? null : setConfirmOpen(false))}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default AdminUserDetail;
