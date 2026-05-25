"use client";

import { useState } from "react";
import { HiOutlineUsers } from "react-icons/hi2";
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
  RowActions,
  ViewAction,
  DangerAction,
} from "./AdminTablePanel";
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
  const { users, isLoading, mutate } = useAdminUsers();
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="User Management"
        description="Manage job seeker accounts"
      />

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>User Name</AdminTableTh>
            <AdminTableTh>Email</AdminTableTh>
            <AdminTableTh>Registered</AdminTableTh>
            <AdminTableTh>Applications</AdminTableTh>
            <AdminTableTh align="right">Actions</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={5} />
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
                    <AdminTableTd align="right">
                      <RowActions>
                        <ViewAction href={`/admin/users/${u.id}`} />
                        <DangerAction
                          label={
                            u.status === "suspended" ? "Reinstate" : "Suspend"
                          }
                          onClick={() => setTarget(u)}
                        />
                      </RowActions>
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
