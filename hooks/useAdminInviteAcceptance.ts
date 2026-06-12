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

// ─── Mock implementations ────────────────────────────────────────────────────
//
// Two real endpoints required:
//   GET  /api/v1/auth/admin-invites/:token   — preview
//   POST /api/v1/auth/admin-invites/:token/accept  — finalize
//
// Both are unauthenticated; the token is the credential.

export async function fetchInvitePreview(
  token: string,
): Promise<InvitePreview> {
  await new Promise((r) => setTimeout(r, 250));
  if (token === "expired") {
    throw new Error("This invite has expired. Ask the inviter for a new one.");
  }
  if (token === "revoked") {
    throw new Error("This invite was revoked.");
  }
  if (token.length < 8) {
    throw new Error("This invite link is invalid.");
  }
  // Mock — pretend the token decodes to:
  return {
    email: "rosa@vetriconn.com",
    role: "admin",
    invitedBy: "Admin User",
    expiresAt: new Date(Date.now() + 6 * 86400 * 1000).toISOString(),
  };
}

export async function acceptAdminInvite(
  payload: AcceptInvitePayload,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
  console.log("[mock] accepted invite", payload);
}
