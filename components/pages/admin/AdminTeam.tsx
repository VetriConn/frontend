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
  HiOutlineAdjustmentsHorizontal,
  HiOutlineNoSymbol,
  HiOutlineCheckCircle,
  HiOutlineEnvelopeOpen,
  HiOutlineTrash,
} from "react-icons/hi2";
import {
  useAdminTeam,
  inviteAdmin,
  resendAdminInvite,
  revokeAdminInvite,
  changeAdminRole,
  suspendAdminMember,
  reinstateAdminMember,
  ROLE_LABEL,
  type AdminMember,
  type AdminInvite,
  type AdminMemberRole,
} from "@/hooks/useAdminTeam";
import type { AdminStepUp } from "@/lib/api/admin";
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
import KebabMenu, { type KebabAction } from "./KebabMenu";
import InviteAdminDialog from "./InviteAdminDialog";
import ChangeAdminRoleDialog from "./ChangeAdminRoleDialog";
import StepUpDialog, { type StepUpCreds } from "./StepUpDialog";
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

// ─── Step-up action (suspend/reinstate) ──────────────────────────────────────

type StepUpAction = { kind: "suspend" | "reinstate"; member: AdminMember };

const AdminTeam = () => {
  const { userProfile } = useUserProfile();
  const isSuper = isSuperAdmin(userProfile);

  const { members, invites, isLoading, mutate } = useAdminTeam();
  const { showToast } = useToaster();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);

  const [roleTarget, setRoleTarget] = useState<AdminMember | null>(null);
  const [roleBusy, setRoleBusy] = useState(false);

  const [stepUp, setStepUp] = useState<StepUpAction | null>(null);
  const [stepUpBusy, setStepUpBusy] = useState(false);

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

  const currentUserId = (userProfile as { id?: string } | null)?.id;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleInvite = async (
    email: string,
    fullName: string,
    role: AdminMemberRole,
    creds: AdminStepUp,
  ) => {
    setInviteBusy(true);
    try {
      await inviteAdmin({ email, full_name: fullName, role }, creds);
      await mutate();
      showToast({
        type: "success",
        title: "Invite sent",
        description: `${email} will receive a one-time link.`,
      });
      setInviteOpen(false);
    } catch {
      showToast({
        type: "error",
        title: "Could not send invite",
        description: "Check your password/2FA code and try again.",
      });
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
      await mutate();
      showToast({ type: "success", title: "Invite revoked" });
    } catch {
      showToast({ type: "error", title: "Could not revoke invite" });
    }
  };

  const handleRoleConfirm = async (
    role: AdminMemberRole,
    creds: AdminStepUp,
  ) => {
    if (!roleTarget) return;
    setRoleBusy(true);
    try {
      await changeAdminRole(roleTarget.id, role, creds);
      await mutate();
      showToast({
        type: "success",
        title: `${roleTarget.full_name} is now ${ROLE_LABEL[role]}`,
      });
      setRoleTarget(null);
    } catch {
      showToast({
        type: "error",
        title: "Could not change role",
        description: "Check your password/2FA code and try again.",
      });
    } finally {
      setRoleBusy(false);
    }
  };

  const handleStepUpConfirm = async (creds: StepUpCreds) => {
    if (!stepUp) return;
    setStepUpBusy(true);
    const { member, kind } = stepUp;
    try {
      if (kind === "suspend") {
        await suspendAdminMember(member.id, creds.reason ?? "", creds);
        showToast({ type: "success", title: `${member.full_name} suspended` });
      } else {
        await reinstateAdminMember(member.id, creds);
        showToast({ type: "success", title: `${member.full_name} reinstated` });
      }
      await mutate();
      setStepUp(null);
    } catch {
      showToast({
        type: "error",
        title: "Could not update admin",
        description: "Check your password/2FA code and try again.",
      });
    } finally {
      setStepUpBusy(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

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
                            currentUserId={currentUserId}
                            isLastSuperAdmin={
                              m.role === "super_admin" && superAdminCount <= 1
                            }
                            onChangeRole={() => setRoleTarget(m)}
                            onSuspend={() =>
                              setStepUp({ kind: "suspend", member: m })
                            }
                            onReinstate={() =>
                              setStepUp({ kind: "reinstate", member: m })
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
                        {isSuper ? (
                          <KebabMenu
                            label={`Actions for ${inv.email}`}
                            actions={[
                              {
                                label: "Resend invite",
                                icon: HiOutlineEnvelopeOpen,
                                onClick: () => handleResend(inv),
                              },
                              {
                                label: "Revoke invite",
                                icon: HiOutlineTrash,
                                danger: true,
                                onClick: () => handleRevoke(inv),
                              },
                            ]}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
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

      {roleTarget && (
        <ChangeAdminRoleDialog
          open
          busy={roleBusy}
          memberName={roleTarget.full_name}
          currentRole={roleTarget.role}
          onClose={() => (roleBusy ? null : setRoleTarget(null))}
          onConfirm={handleRoleConfirm}
        />
      )}

      {stepUp && (
        <StepUpDialog
          open
          title={
            stepUp.kind === "suspend"
              ? "Suspend this admin?"
              : "Reinstate this admin?"
          }
          description={
            stepUp.kind === "suspend"
              ? `${stepUp.member.full_name} will be signed out everywhere and unable to sign back in.`
              : `${stepUp.member.full_name} will regain admin access.`
          }
          confirmLabel={
            stepUp.kind === "suspend" ? "Suspend Admin" : "Reinstate"
          }
          requireReason={stepUp.kind === "suspend"}
          danger={stepUp.kind === "suspend"}
          busy={stepUpBusy}
          onClose={() => (stepUpBusy ? null : setStepUp(null))}
          onConfirm={handleStepUpConfirm}
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
  onChangeRole: () => void;
  onSuspend: () => void;
  onReinstate: () => void;
}

const MemberRowMenu = ({
  member,
  isSuper,
  currentUserId,
  isLastSuperAdmin,
  onChangeRole,
  onSuspend,
  onReinstate,
}: MemberRowMenuProps) => {
  if (!isSuper) return <span className="text-xs text-gray-400">—</span>;
  const isSelf = currentUserId && member.id === currentUserId;
  if (isSelf) return <span className="text-xs text-gray-400">You</span>;

  // The last super admin can't be demoted or suspended — that would lock the
  // org out of team management.
  const lockedReason = isLastSuperAdmin
    ? "Can't change the last super admin"
    : null;

  const actions: KebabAction[] = [
    {
      label: "Change role",
      icon: HiOutlineAdjustmentsHorizontal,
      onClick: onChangeRole,
      disabled: !!lockedReason,
    },
    member.status === "active"
      ? {
          label: "Suspend",
          icon: HiOutlineNoSymbol,
          danger: true,
          onClick: onSuspend,
          disabled: !!lockedReason,
        }
      : {
          label: "Reinstate",
          icon: HiOutlineCheckCircle,
          onClick: onReinstate,
        },
  ];

  return <KebabMenu actions={actions} label={`Actions for ${member.full_name}`} />;
};

const inviteStatusTone = (
  status: AdminInvite["status"],
): "amber" | "emerald" | "rose" | "gray" => {
  switch (status) {
    case "pending":
      return "amber";
    case "expired":
      return "gray";
    default:
      return "gray";
  }
};

const inviteStatusLabel = (status: AdminInvite["status"]) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "expired":
      return "Expired";
    default:
      return status;
  }
};

export default AdminTeam;
