import useSWR from "swr";
import {
  adminGetTeam,
  adminInvite,
  adminResendInvite,
  adminRevokeInvite,
  adminChangeRole,
  adminSuspendAdmin,
  adminReinstateAdmin,
  type AdminRole,
  type AdminStepUp,
  type AdminTeamMember,
  type AdminTeamInvite,
} from "@/lib/api/admin";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdminMemberRole = AdminRole; // super_admin | reviewer | moderator | billing
export type AdminMemberStatus = "active" | "suspended";
export type AdminInviteStatus = "pending" | "accepted" | "revoked" | "expired";

export type AdminMember = AdminTeamMember;
export type AdminInvite = AdminTeamInvite;

// ─── Hook ────────────────────────────────────────────────────────────────────

interface AdminTeamPayload {
  members: AdminMember[];
  invites: AdminInvite[];
}

export function useAdminTeam() {
  const { data, error, isLoading, mutate } = useSWR<AdminTeamPayload>(
    "/admin/team",
    async () => await adminGetTeam(),
  );
  return {
    members: data?.members ?? [],
    invites: data?.invites ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ─── Mutations ───────────────────────────────────────────────────────────────
//
// Every mutating call except resend/revoke requires step-up (password + a TOTP
// code when 2FA is on). The UI collects those and passes them through here.

export interface InviteAdminPayload {
  email: string;
  full_name: string;
  role: AdminMemberRole;
}

/** Issue an admin invite. Step-up required. */
export async function inviteAdmin(
  payload: InviteAdminPayload,
  creds: AdminStepUp,
): Promise<void> {
  await adminInvite({
    email: payload.email,
    full_name: payload.full_name,
    admin_role: payload.role,
    ...creds,
  });
}

/** Re-send a pending invite, issuing a fresh token and expiry. */
export async function resendAdminInvite(id: string): Promise<void> {
  await adminResendInvite(id);
}

/** Invalidate a pending invite so its token can no longer be redeemed. */
export async function revokeAdminInvite(id: string): Promise<void> {
  await adminRevokeInvite(id);
}

/** Change an admin's tier. Step-up required. */
export async function changeAdminRole(
  id: string,
  role: AdminMemberRole,
  creds: AdminStepUp,
): Promise<void> {
  await adminChangeRole(id, role, creds);
}

/** Suspend an admin's access without deleting the account. Step-up required. */
export async function suspendAdminMember(
  id: string,
  reason: string,
  creds: AdminStepUp,
): Promise<void> {
  await adminSuspendAdmin(id, reason, creds);
}

/** Reinstate a suspended admin. Step-up required. */
export async function reinstateAdminMember(
  id: string,
  creds: AdminStepUp,
): Promise<void> {
  await adminReinstateAdmin(id, creds);
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const ADMIN_ROLES: AdminMemberRole[] = [
  "super_admin",
  "reviewer",
  "moderator",
  "billing",
];

export const ROLE_LABEL: Record<AdminMemberRole, string> = {
  super_admin: "Super Admin",
  reviewer: "Reviewer",
  moderator: "Moderator",
  billing: "Billing",
};

export const ROLE_DESCRIPTION: Record<AdminMemberRole, string> = {
  super_admin:
    "Full access, including team management and the audit log.",
  reviewer: "Reviews and approves jobs, companies, and scraper runs.",
  moderator: "Moderates users, company members, reports, and community posts.",
  billing: "Manages subscriptions and billing.",
};

export const MEMBER_STATUS_LABEL: Record<AdminMemberStatus, string> = {
  active: "Active",
  suspended: "Suspended",
};

export const INVITE_STATUS_LABEL: Record<AdminInviteStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  revoked: "Revoked",
  expired: "Expired",
};
