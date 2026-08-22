import { API_BASE_URL, apiFetch, type ApiEnvelope } from "@/lib/api/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InvitePreview {
  email: string;
  role: "admin" | "super_admin";
  invitedBy: string;
  expiresAt: string;
}

export interface AcceptInvitePayload {
  token: string;
  full_name: string;
  password: string;
}

// ─── Wire ────────────────────────────────────────────────────────────────────
//
// Both endpoints are unauthenticated — the token in the URL is the only
// credential, and accepting creates the admin account. That makes a leaked
// link equivalent to platform admin, so the server must treat the token as a
// secret: single use, short expiry, revocable, and with the email fixed by the
// invite so the recipient cannot redirect it to another address.
//
// Neither endpoint exists yet; see the API contract handed to the backend.

const INVITES_URL = `${API_BASE_URL}/api/v1/auth/admin-invites`;

/**
 * Read what an invite is for, before asking anyone to set a password.
 * Expired, revoked and unknown tokens must be indistinguishable in the
 * response, so the endpoint cannot be used to probe for live tokens.
 */
export async function fetchInvitePreview(
  token: string,
): Promise<InvitePreview> {
  const response = await apiFetch<ApiEnvelope<InvitePreview>>(
    `${INVITES_URL}/${encodeURIComponent(token)}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("This invite link is no longer valid.");
  }
  return response.data;
}

/**
 * Redeem the invite and create the admin account. The email comes from the
 * invite, never from this payload.
 */
export async function acceptAdminInvite(
  payload: AcceptInvitePayload,
): Promise<void> {
  const { token, ...body } = payload;
  await apiFetch(`${INVITES_URL}/${encodeURIComponent(token)}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
