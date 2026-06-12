"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  HiOutlineUsers,
  HiOutlineUserPlus,
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import {
  useAdminTeam,
  inviteAdmin,
  resendAdminInvite,
  revokeAdminInvite,
  changeAdminRole,
  suspendAdminMember,
  reinstateAdminMember,
  removeAdminMember,
  ROLE_LABEL,
  type AdminMember,
  type AdminInvite,
  type AdminMemberRole,
} from "@/hooks/useAdminTeam";
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
  StatusPill,
} from "./AdminTablePanel";
import InviteAdminDialog from "./InviteAdminDialog";
import ConfirmDialog from "./ConfirmDialog";
import { useToaster } from "@/components/ui/Toaster";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isSuperAdmin } from "@/lib/admin-permissions";

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatRelative = (iso?: string) => {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Never";
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

// ─── Action menu types ───────────────────────────────────────────────────────

type MemberConfirm =
  | { kind: "promote"; member: AdminMember }
  | { kind: "demote"; member: AdminMember }
  | { kind: "suspend"; member: AdminMember }
  | { kind: "reinstate"; member: AdminMember }
  | { kind: "remove"; member: AdminMember };

const AdminTeam = () => {
  const { userProfile } = useUserProfile();
  const isSuper = isSuperAdmin(userProfile);

  const { members, invites, isLoading, mutate } = useAdminTeam();
  const { showToast } = useToaster();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [confirm, setConfirm] = useState<MemberConfirm | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    pendingInvites: invites.filter((i) => i.status === "pending").length,
    twoFactorOff: members.filter(
      (m) => m.status === "active" && !m.two_factor_enabled,
    ).length,
  };

  const superAdminCount = members.filter(
    (m) => m.role === "super_admin",
  ).length;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleInvite = async (email: string, role: AdminMemberRole) => {
    setInviteBusy(true);
    try {
      const created = await inviteAdmin({ email, role });
      await mutate(
        { members, invites: [created, ...invites] },
        false,
      );
      showToast({
        type: "success",
        title: "Invite sent",
        description: `${email} will receive a one-time link.`,
      });
      setInviteOpen(false);
    } catch {
      showToast({ type: "error", title: "Could not send invite" });
    } finally {
      setInviteBusy(false);
    }
  };

  const handleResend = async (invite: AdminInvite) => {
    try {
      await resendAdminInvite(invite.id);
      showToast({
        type: "success",
        title: "Invite resent",
        description: `${invite.email}`,
      });
    } catch {
      showToast({ type: "error", title: "Could not resend invite" });
    }
  };

  const handleRevoke = async (invite: AdminInvite) => {
    try {
      await revokeAdminInvite(invite.id);
      await mutate(
        {
          members,
          invites: invites.map((i) =>
            i.id === invite.id ? { ...i, status: "revoked" as const } : i,
          ),
        },
        false,
      );
      showToast({ type: "success", title: "Invite revoked" });
    } catch {
      showToast({ type: "error", title: "Could not revoke invite" });
    }
  };

  const handleConfirm = async (reason?: string) => {
    if (!confirm) return;
    setConfirmBusy(true);
    try {
      const m = confirm.member;
      let updated: AdminMember = m;
      switch (confirm.kind) {
        case "promote":
          await changeAdminRole(m.id, "super_admin");
          updated = { ...m, role: "super_admin" };
          showToast({ type: "success", title: `${m.full_name} promoted` });
          break;
        case "demote":
          await changeAdminRole(m.id, "admin");
          updated = { ...m, role: "admin" };
          showToast({ type: "success", title: `${m.full_name} demoted` });
          break;
        case "suspend":
          await suspendAdminMember(m.id, reason ?? "");
          updated = { ...m, status: "suspended" };
          showToast({ type: "success", title: `${m.full_name} suspended` });
          break;
        case "reinstate":
          await reinstateAdminMember(m.id);
          updated = { ...m, status: "active" };
          showToast({ type: "success", title: `${m.full_name} reinstated` });
          break;
        case "remove":
          await removeAdminMember(m.id, reason ?? "");
          await mutate(
            { members: members.filter((x) => x.id !== m.id), invites },
            false,
          );
          showToast({ type: "success", title: `${m.full_name} removed` });
          setConfirm(null);
          return;
      }
      await mutate(
        {
          members: members.map((x) => (x.id === m.id ? updated : x)),
          invites,
        },
        false,
      );
      setConfirm(null);
    } catch {
      showToast({ type: "error", title: "Could not update admin" });
    } finally {
      setConfirmBusy(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const confirmCopy = (() => {
    if (!confirm) return null;
    const name = confirm.member.full_name;
    switch (confirm.kind) {
      case "promote":
        return {
          title: "Promote to Super Admin?",
          description: `${name} will be able to manage the team and view the audit log.`,
          confirmLabel: "Promote",
          tone: "neutral" as const,
          reasonLabel: undefined,
        };
      case "demote":
        return {
          title: "Demote to Admin?",
          description: `${name} will lose access to team management.`,
          confirmLabel: "Demote",
          tone: "neutral" as const,
          reasonLabel: undefined,
        };
      case "suspend":
        return {
          title: "Suspend this admin?",
          description: `${name} will be signed out of all sessions and unable to sign back in.`,
          confirmLabel: "Suspend Admin",
          tone: "danger" as const,
          reasonLabel: "Reason",
        };
      case "reinstate":
        return {
          title: "Reinstate this admin?",
          description: `${name} will regain admin access.`,
          confirmLabel: "Reinstate",
          tone: "neutral" as const,
          reasonLabel: undefined,
        };
      case "remove":
        return {
          title: "Remove this admin?",
          description: `${name} will lose admin access permanently. Their audit history is preserved.`,
          confirmLabel: "Remove Admin",
          tone: "danger" as const,
          reasonLabel: "Reason",
        };
    }
  })();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Admin Team"
        description="Manage who can access the admin console."
        actions={
          isSuper ? (
            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)]"
            >
              <HiOutlineUserPlus className="w-4 h-4" />
              Invite Admin
            </button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          icon={HiOutlineUsers}
          label="Total Admins"
          value={stats.total}
          tone="indigo"
        />
        <StatCard
          icon={HiOutlineShieldCheck}
          label="Active"
          value={stats.active}
          tone="emerald"
        />
        <StatCard
          icon={HiOutlineClock}
          label="Pending Invites"
          value={stats.pendingInvites}
          tone="amber"
        />
        <StatCard
          icon={HiOutlineExclamationTriangle}
          label="2FA Off"
          value={stats.twoFactorOff}
          tone="rose"
        />
      </div>

      {/* Quick link to audit log */}
      {isSuper && (
        <Link
          href="/admin/team/audit-log"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          View audit log
          <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {/* Members */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Members</h2>
        <AdminTablePanel>
          <AdminTable>
            <AdminTableHead>
              <AdminTableTh>Name</AdminTableTh>
              <AdminTableTh>Email</AdminTableTh>
              <AdminTableTh>Role</AdminTableTh>
              <AdminTableTh>Status</AdminTableTh>
              <AdminTableTh>2FA</AdminTableTh>
              <AdminTableTh>Last Sign-in</AdminTableTh>
              <AdminTableTh align="right">Actions</AdminTableTh>
            </AdminTableHead>
            <AdminTableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <AdminRowSkeleton key={i} columns={7} />
                  ))
                : members.map((m) => (
                    <AdminTableRow key={m.id}>
                      <AdminTableTd className="font-semibold text-gray-900">
                        {m.full_name}
                      </AdminTableTd>
                      <AdminTableTd className="text-gray-600">
                        {m.email}
                      </AdminTableTd>
                      <AdminTableTd>
                        <StatusPill
                          tone={m.role === "super_admin" ? "indigo" : "gray"}
                        >
                          {ROLE_LABEL[m.role]}
                        </StatusPill>
                      </AdminTableTd>
                      <AdminTableTd>
                        <StatusPill
                          tone={m.status === "active" ? "emerald" : "rose"}
                        >
                          {m.status === "active" ? "Active" : "Suspended"}
                        </StatusPill>
                      </AdminTableTd>
                      <AdminTableTd>
                        {m.two_factor_enabled ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            On
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-rose-600">
                            Off
                          </span>
                        )}
                      </AdminTableTd>
                      <AdminTableTd className="text-gray-600 tabular-nums">
                        {formatRelative(m.lastSignInAt)}
                      </AdminTableTd>
                      <AdminTableTd align="right">
                        <RowActions>
                          <MemberRowMenu
                            member={m}
                            isSuper={isSuper}
                            currentUserId={
                              (userProfile as { id?: string } | null)?.id
                            }
                            isLastSuperAdmin={
                              m.role === "super_admin" &&
                              superAdminCount <= 1
                            }
                            onAction={(kind) =>
                              setConfirm({ kind, member: m })
                            }
                          />
                        </RowActions>
                      </AdminTableTd>
                    </AdminTableRow>
                  ))}
            </AdminTableBody>
          </AdminTable>
          {!isLoading && members.length === 0 && (
            <AdminEmptyState
              title="No admins yet"
              description="Invite your first admin to get started."
              icon={HiOutlineUsers}
            />
          )}
        </AdminTablePanel>
      </section>

      {/* Invites */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Invites</h2>
        <AdminTablePanel>
          <AdminTable>
            <AdminTableHead>
              <AdminTableTh>Email</AdminTableTh>
              <AdminTableTh>Role</AdminTableTh>
              <AdminTableTh>Status</AdminTableTh>
              <AdminTableTh>Invited By</AdminTableTh>
              <AdminTableTh>Sent</AdminTableTh>
              <AdminTableTh>Expires</AdminTableTh>
              <AdminTableTh align="right">Actions</AdminTableTh>
            </AdminTableHead>
            <AdminTableBody>
              {isLoading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <AdminRowSkeleton key={i} columns={7} />
                  ))
                : invites.map((inv) => (
                    <AdminTableRow key={inv.id}>
                      <AdminTableTd className="font-semibold text-gray-900">
                        {inv.email}
                      </AdminTableTd>
                      <AdminTableTd>{ROLE_LABEL[inv.role]}</AdminTableTd>
                      <AdminTableTd>
                        <StatusPill tone={inviteStatusTone(inv.status)}>
                          {inviteStatusLabel(inv.status)}
                        </StatusPill>
                      </AdminTableTd>
                      <AdminTableTd className="text-gray-600">
                        {inv.invitedBy.name}
                      </AdminTableTd>
                      <AdminTableTd className="text-gray-600">
                        {formatDate(inv.invitedAt)}
                      </AdminTableTd>
                      <AdminTableTd className="text-gray-600">
                        {formatDate(inv.expiresAt)}
                      </AdminTableTd>
                      <AdminTableTd align="right">
                        <RowActions>
                          {isSuper && inv.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleResend(inv)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                              >
                                <HiOutlineEnvelope className="w-3.5 h-3.5 text-gray-500" />
                                Resend
                              </button>
                              <button
                                onClick={() => handleRevoke(inv)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                          {isSuper && inv.status === "expired" && (
                            <button
                              onClick={() => handleResend(inv)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              <HiOutlineEnvelope className="w-3.5 h-3.5 text-gray-500" />
                              Resend
                            </button>
                          )}
                        </RowActions>
                      </AdminTableTd>
                    </AdminTableRow>
                  ))}
            </AdminTableBody>
          </AdminTable>
          {!isLoading && invites.length === 0 && (
            <AdminEmptyState
              title="No invites"
              description="When you invite admins, they'll show up here."
              icon={HiOutlineEnvelope}
            />
          )}
        </AdminTablePanel>
      </section>

      {/* Dialogs */}
      <InviteAdminDialog
        open={inviteOpen}
        busy={inviteBusy}
        canInviteSuperAdmin={isSuper}
        onClose={() => (inviteBusy ? null : setInviteOpen(false))}
        onConfirm={handleInvite}
      />
      {confirm && confirmCopy && (
        <ConfirmDialog
          open
          title={confirmCopy.title}
          subject={confirm.member.email}
          description={confirmCopy.description}
          confirmLabel={confirmCopy.confirmLabel}
          tone={confirmCopy.tone}
          reasonLabel={confirmCopy.reasonLabel}
          reasonPlaceholder={
            confirmCopy.reasonLabel
              ? "Note for the audit log"
              : undefined
          }
          busy={confirmBusy}
          onClose={() => (confirmBusy ? null : setConfirm(null))}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

// ─── Subcomponents ───────────────────────────────────────────────────────────

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "amber" | "emerald" | "indigo" | "rose";
}) => {
  const map = {
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
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

interface MemberRowMenuProps {
  member: AdminMember;
  isSuper: boolean;
  currentUserId?: string;
  /** True if `member` is the only super admin in the org. */
  isLastSuperAdmin: boolean;
  onAction: (
    kind: "promote" | "demote" | "suspend" | "reinstate" | "remove",
  ) => void;
}

const MemberRowMenu = ({
  member,
  isSuper,
  currentUserId,
  isLastSuperAdmin,
  onAction,
}: MemberRowMenuProps) => {
  if (!isSuper) return <span className="text-xs text-gray-400">—</span>;
  const isSelf = currentUserId && member.id === currentUserId;
  if (isSelf) return <span className="text-xs text-gray-400">You</span>;

  // Last super admin can't be demoted, suspended, or removed — that would
  // lock the org out of team management.
  const lockedReason = isLastSuperAdmin
    ? "Can't change the last super admin"
    : null;

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {member.role === "admin" ? (
        <button
          onClick={() => onAction("promote")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Promote
        </button>
      ) : (
        <button
          onClick={() => onAction("demote")}
          disabled={!!lockedReason}
          title={lockedReason ?? undefined}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Demote
        </button>
      )}
      {member.status === "active" ? (
        <button
          onClick={() => onAction("suspend")}
          disabled={!!lockedReason}
          title={lockedReason ?? undefined}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suspend
        </button>
      ) : (
        <button
          onClick={() => onAction("reinstate")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Reinstate
        </button>
      )}
      <button
        onClick={() => onAction("remove")}
        disabled={!!lockedReason}
        title={lockedReason ?? undefined}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Remove
      </button>
    </div>
  );
};

const inviteStatusTone = (
  status: AdminInvite["status"],
): "amber" | "emerald" | "rose" | "gray" => {
  switch (status) {
    case "pending":
      return "amber";
    case "accepted":
      return "emerald";
    case "revoked":
      return "rose";
    case "expired":
      return "gray";
  }
};

const inviteStatusLabel = (status: AdminInvite["status"]) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "revoked":
      return "Revoked";
    case "expired":
      return "Expired";
  }
};

export default AdminTeam;
