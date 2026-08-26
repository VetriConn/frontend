import { API_BASE_URL, apiFetch } from "@/lib/api/client";

// ─── Wire ────────────────────────────────────────────────────────────────────
//
// Redeeming an admin invite is unauthenticated — the token in the URL is the
// only credential, and accepting sets the account's real password. The invitee
// (email, name, role) was fixed by the super_admin when the invite was created,
// so the only thing collected here is a password. The account still can't reach
// the console until it completes MFA setup on first sign-in.

export interface AcceptAdminInvitePayload {
  token: string;
  password: string;
}

/** Redeem the invite and set the account's password. */
export async function acceptAdminInvite(
  payload: AcceptAdminInvitePayload,
): Promise<void> {
  await apiFetch(`${API_BASE_URL}/api/v1/admin/invites/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
