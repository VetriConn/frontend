import useSWR from "swr";
import { API_BASE_URL, apiFetch, type ApiEnvelope } from "@/lib/api/client";

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

// ─── Wire ────────────────────────────────────────────────────────────────────
//
// Endpoints live under /api/v1/admin/team and do not exist yet — see the
// API contract handed to the backend. Until they ship every call here fails
// with a 404, which the UI surfaces as an error rather than pretending to
// succeed. That is deliberate: the previous mock versions logged to the
// console and returned success, so the team page looked functional while
// changing nothing.

const TEAM_URL = `${API_BASE_URL}/api/v1/admin/team`;

const jsonRequest = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

interface AdminTeamPayload {
  members: AdminMember[];
  invites: AdminInvite[];
}

const fetchTeam = async (): Promise<AdminTeamPayload> => {
  const response = await apiFetch<ApiEnvelope<AdminTeamPayload>>(TEAM_URL, {
    method: "GET",
  });
  return {
    members: response.data?.members ?? [],
    invites: response.data?.invites ?? [],
  };
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

// ─── Mutations ───────────────────────────────────────────────────────────────

export interface InviteAdminPayload {
  email: string;
  role: AdminMemberRole;
}

/** Issue an admin invite. Only a super admin may invite another super admin. */
export async function inviteAdmin(
  payload: InviteAdminPayload,
): Promise<AdminInvite> {
  const response = await apiFetch<ApiEnvelope<AdminInvite>>(
    `${TEAM_URL}/invites`,
    jsonRequest("POST", payload),
  );
  return response.data;
}

/** Re-send a pending invite, issuing a fresh token and expiry. */
export async function resendAdminInvite(id: string): Promise<void> {
  await apiFetch(`${TEAM_URL}/invites/${id}/resend`, jsonRequest("POST"));
}

/** Invalidate a pending invite so its token can no longer be redeemed. */
export async function revokeAdminInvite(id: string): Promise<void> {
  await apiFetch(`${TEAM_URL}/invites/${id}/revoke`, jsonRequest("POST"));
}

/** Promote or demote an admin. The last super admin cannot be demoted. */
export async function changeAdminRole(
  id: string,
  role: AdminMemberRole,
): Promise<void> {
  await apiFetch(`${TEAM_URL}/members/${id}`, jsonRequest("PATCH", { role }));
}

/** Suspend an admin's access without deleting the account. Reason is audited. */
export async function suspendAdminMember(
  id: string,
  reason: string,
): Promise<void> {
  await apiFetch(
    `${TEAM_URL}/members/${id}/suspend`,
    jsonRequest("POST", { reason }),
  );
}

export async function reinstateAdminMember(id: string): Promise<void> {
  await apiFetch(`${TEAM_URL}/members/${id}/reinstate`, jsonRequest("POST"));
}

/** Revoke admin rights entirely. Reason is audited. */
export async function removeAdminMember(
  id: string,
  reason: string,
): Promise<void> {
  await apiFetch(`${TEAM_URL}/members/${id}`, jsonRequest("DELETE", { reason }));
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
