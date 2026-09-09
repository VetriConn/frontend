"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineNoSymbol,
  HiOutlineEye,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import {
  useAdminMemberCounts,
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
  AdminLoadError,
  AdminPagination,
} from "./AdminTablePanel";
import KebabMenu, { type KebabAction } from "./KebabMenu";
import ConfirmDialog from "./ConfirmDialog";
import { useToaster } from "@/components/ui/Toaster";
import { formatDate } from "@/lib/date-utils";


const UserManagement = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { users, total, totalPages, isLoading, isError, mutate } =
    useAdminUsers(page);
  const { counts } = useAdminMemberCounts();
  const { showToast } = useToaster();

  // If the total shrinks under the current page (last row of the last page
  // acted on elsewhere), fall back to the real last page instead of
  // dead-ending on an empty table.
  useEffect(() => {
    if (!isLoading && page > totalPages) setPage(totalPages);
  }, [isLoading, page, totalPages]);
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
      const next = users.map(
        (u): AdminUser =>
          u.id === target.id
            ? { ...u, status: isSuspending ? "suspended" : "active" }
            : u,
      );
      await mutate({ users: next, total, totalPages }, false);
      setTarget(null);
    } catch {
      showToast({ type: "error", title: "Couldn't update user" });
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
          value={counts?.total ?? "-"}
          tone="indigo"
        />
        <AdminStatCard
          icon={HiOutlineCheckCircle}
          label="Active"
          value={counts?.active ?? "-"}
          tone="emerald"
        />
        <AdminStatCard
          icon={HiOutlineNoSymbol}
          label="Suspended"
          value={counts?.suspended ?? "-"}
          tone="rose"
        />
        <AdminStatCard
          icon={HiOutlineUserCircle}
          label="Showing"
          value={isLoading ? "-" : users.length}
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
                  <AdminTableRow key={u.id} onOpen={() => router.push(`/admin/users/${u.id}`)}>
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
        {!isLoading && isError && (
          <AdminLoadError what="users" onRetry={() => mutate()} />
        )}
        {!isLoading && !isError && users.length === 0 && (
          <AdminEmptyState
            title="No users yet"
            description="Job seekers will appear here once they create an account."
            icon={HiOutlineUsers}
          />
        )}
        <AdminPagination
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: total,
          }}
          onPage={setPage}
        />
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
