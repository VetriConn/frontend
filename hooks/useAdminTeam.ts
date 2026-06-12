import useSWR from "swr";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdminMemberRole = "admin" | "super_admin";
export type AdminMemberStatus = "active" | "suspended";
export type AdminInviteStatus = "pending" | "accepted" | "revoked" | "expired";

export interface AdminMember {
  id: string;
  full_name: string;
  email: string;
  picture?: string;
  role: AdminMemberRole;
  status: AdminMemberStatus;
  two_factor_enabled: boolean;
  invitedAt: string;
  joinedAt?: string;
  lastSignInAt?: string;
}

export interface AdminInvite {
  id: string;
  email: string;
  role: AdminMemberRole;
  status: AdminInviteStatus;
  invitedBy: { id: string; name: string };
  invitedAt: string;
  expiresAt: string;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_MEMBERS: AdminMember[] = [
  {
    id: "a-1",
    full_name: "Admin User",
    email: "admin@vetriconn.com",
    role: "super_admin",
    status: "active",
    two_factor_enabled: true,
    invitedAt: "2025-12-01",
    joinedAt: "2025-12-01",
    lastSignInAt: "2026-05-25T08:14:00Z",
  },
  {
    id: "a-2",
    full_name: "Priya Shah",
    email: "priya@vetriconn.com",
    role: "admin",
    status: "active",
    two_factor_enabled: true,
    invitedAt: "2026-01-12",
    joinedAt: "2026-01-13",
    lastSignInAt: "2026-05-24T17:42:00Z",
  },
  {
    id: "a-3",
    full_name: "Marcus Lee",
    email: "marcus@vetriconn.com",
    role: "admin",
    status: "active",
    two_factor_enabled: false,
    invitedAt: "2026-02-04",
    joinedAt: "2026-02-05",
    lastSignInAt: "2026-05-22T09:00:00Z",
  },
  {
    id: "a-4",
    full_name: "Dana Whitford",
    email: "dana@vetriconn.com",
    role: "admin",
    status: "suspended",
    two_factor_enabled: false,
    invitedAt: "2026-03-19",
    joinedAt: "2026-03-20",
    lastSignInAt: "2026-04-30T11:21:00Z",
  },
];

const MOCK_INVITES: AdminInvite[] = [
  {
    id: "inv-1",
    email: "rosa@vetriconn.com",
    role: "admin",
    status: "pending",
    invitedBy: { id: "a-1", name: "Admin User" },
    invitedAt: "2026-05-22",
    expiresAt: "2026-05-29",
  },
  {
    id: "inv-2",
    email: "elias@vetriconn.com",
    role: "admin",
    status: "expired",
    invitedBy: { id: "a-1", name: "Admin User" },
    invitedAt: "2026-04-15",
    expiresAt: "2026-04-22",
  },
];

interface AdminTeamPayload {
  members: AdminMember[];
  invites: AdminInvite[];
}

const fetchTeam = async (): Promise<AdminTeamPayload> => {
  // TODO: GET /api/v1/admin/team
  await new Promise((r) => setTimeout(r, 200));
  return { members: MOCK_MEMBERS, invites: MOCK_INVITES };
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminTeam() {
  const { data, error, isLoading, mutate } = useSWR<AdminTeamPayload>(
    "/admin/team",
    fetchTeam,
  );
  return {
    members: data?.members ?? [],
    invites: data?.invites ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ─── Mutations (mock) ────────────────────────────────────────────────────────

export interface InviteAdminPayload {
  email: string;
  role: AdminMemberRole;
}

export async function inviteAdmin(
  payload: InviteAdminPayload,
): Promise<AdminInvite> {
  // TODO: POST /api/v1/admin/team/invites  body: { email, role }
  await new Promise((r) => setTimeout(r, 350));
  console.log("[mock] invited admin", payload);
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 86400 * 1000);
  return {
    id: `inv-${Date.now()}`,
    email: payload.email,
    role: payload.role,
    status: "pending",
    invitedBy: { id: "a-1", name: "Admin User" },
    invitedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

export async function resendAdminInvite(id: string): Promise<void> {
  // TODO: POST /api/v1/admin/team/invites/:id/resend
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] resent invite", id);
}

export async function revokeAdminInvite(id: string): Promise<void> {
  // TODO: POST /api/v1/admin/team/invites/:id/revoke
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] revoked invite", id);
}

export async function changeAdminRole(
  id: string,
  role: AdminMemberRole,
): Promise<void> {
  // TODO: PATCH /api/v1/admin/team/members/:id  body: { role }
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] changed admin role", id, role);
}

export async function suspendAdminMember(
  id: string,
  reason: string,
): Promise<void> {
  // TODO: POST /api/v1/admin/team/members/:id/suspend  body: { reason }
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] suspended admin", id, reason);
}

export async function reinstateAdminMember(id: string): Promise<void> {
  // TODO: POST /api/v1/admin/team/members/:id/reinstate
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] reinstated admin", id);
}

export async function removeAdminMember(
  id: string,
  reason: string,
): Promise<void> {
  // TODO: DELETE /api/v1/admin/team/members/:id  body: { reason }
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] removed admin", id, reason);
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const ROLE_LABEL: Record<AdminMemberRole, string> = {
  admin: "Admin",
  super_admin: "Super Admin",
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
