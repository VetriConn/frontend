"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineNoSymbol,
  HiOutlineEye,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { adminMemberCounts } from "@/lib/api/admin";
import {
  useAdminUsers,
  suspendAdminUser,
  reinstateAdminUser,
  type AdminUser,
} from "@/hooks/useAdminUsers";
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
import ConfirmDialog from "./ConfirmDialog";
import { useToaster } from "@/components/ui/Toaster";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const UserManagement = () => {
  const router = useRouter();
  const { users, isLoading, mutate } = useAdminUsers();
  const { data: counts, mutate: mutateCounts } = useSWR(
    "admin-member-counts",
    adminMemberCounts,
  );
  const { showToast } = useToaster();
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);

  const isSuspending = target?.status === "active";

  const handleConfirm = async (reason?: string) => {
    if (!target) return;
    setBusy(true);
    try {
      if (isSuspending) {
        await suspendAdminUser(target.id, reason ?? "");
        showToast({
          type: "success",
          title: "User suspended",
          description: `${target.full_name} cannot sign in.`,
        });
      } else {
        await reinstateAdminUser(target.id);
        showToast({
          type: "success",
          title: "User reinstated",
          description: `${target.full_name} can sign in again.`,
        });
      }
      const next = users.map((u) =>
        u.id === target.id
          ? { ...u, status: isSuspending ? "suspended" : "active" }
          : u,
      );
      await mutate(next as AdminUser[], false);
      setTarget(null);
    } catch {
      showToast({ type: "error", title: "Could not update user" });
    } finally {
      setBusy(false);
    }
  };

  const rowActions = (u: AdminUser): KebabAction[] => [
    {
      label: "View profile",
      icon: HiOutlineEye,
      onClick: () => router.push(`/admin/users/${u.id}`),
    },
    u.status === "suspended"
      ? {
          label: "Reinstate",
          icon: HiOutlineCheckCircle,
          onClick: () => setTarget(u),
        }
      : {
          label: "Suspend",
          icon: HiOutlineNoSymbol,
          danger: true,
          onClick: () => setTarget(u),
        },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="User Management"
        description="Manage job seeker accounts"
      />

      <AdminStatRow>
        <AdminStatCard
          icon={HiOutlineUsers}
          label="Total members"
          value={counts?.total ?? "—"}
          tone="indigo"
        />
        <AdminStatCard
          icon={HiOutlineCheckCircle}
          label="Active"
          value={counts?.active ?? "—"}
          tone="emerald"
        />
        <AdminStatCard
          icon={HiOutlineNoSymbol}
          label="Suspended"
          value={counts?.suspended ?? "—"}
          tone="rose"
        />
        <AdminStatCard
          icon={HiOutlineUserCircle}
          label="Showing"
          value={isLoading ? "—" : users.length}
          tone="gray"
        />
      </AdminStatRow>

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>User Name</AdminTableTh>
            <AdminTableTh>Email</AdminTableTh>
            <AdminTableTh>Registered</AdminTableTh>
            <AdminTableTh>Applications</AdminTableTh>
            <AdminTableTh>Status</AdminTableTh>
            <AdminTableTh align="right">Actions</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={6} />
                ))
              : users.map((u) => (
                  <AdminTableRow key={u.id}>
                    <AdminTableTd className="font-semibold text-gray-900">
                      {u.full_name}
                    </AdminTableTd>
                    <AdminTableTd className="text-gray-600">
                      {u.email}
                    </AdminTableTd>
                    <AdminTableTd>{formatDate(u.registeredAt)}</AdminTableTd>
                    <AdminTableTd className="tabular-nums">
                      {u.applications}
                    </AdminTableTd>
                    <AdminTableTd>
                      <StatusPill
                        tone={u.status === "suspended" ? "rose" : "emerald"}
                      >
                        {u.status}
                      </StatusPill>
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      <KebabMenu actions={rowActions(u)} />
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>
        {!isLoading && users.length === 0 && (
          <AdminEmptyState
            title="No users yet"
            description="Job seekers will appear here once they create an account."
            icon={HiOutlineUsers}
          />
        )}
      </AdminTablePanel>

      <ConfirmDialog
        open={!!target}
        title={isSuspending ? "Suspend this user?" : "Reinstate this user?"}
        subject={target?.full_name}
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
        onClose={() => (busy ? null : setTarget(null))}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default UserManagement;
