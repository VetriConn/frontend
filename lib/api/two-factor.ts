/**
 * Two-Factor Authentication API Service
 *
 * Backend endpoints:
 *   POST /api/v1/auth/2fa/setup                       — start enrollment
 *   POST /api/v1/auth/2fa/verify-setup                — confirm enrollment
 *   POST /api/v1/auth/2fa/disable                     — turn off (requires password)
 *   POST /api/v1/auth/2fa/verify                      — sign-in second factor
 *   POST /api/v1/auth/2fa/regenerate-recovery-codes   — regenerate codes
 */

import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TwoFactorSetupResponse {
  /** Data URL for the QR code the user scans in their authenticator app. */
  qrCodeDataUrl: string;
  /** Plain shared secret, shown as a fallback for users who can't scan. */
  secret: string;
  /** One-time recovery codes, only shown once at enrollment. */
  recoveryCodes: string[];
}

// ─── Endpoints ──────────────────────────────────────────────────────────────

export async function startTwoFactorSetup(): Promise<TwoFactorSetupResponse> {
  const response = await apiFetch<ApiEnvelope<{ qr_code: string; secret: string; issuer: string }>>(
    `${API_BASE_URL}/api/v1/auth/2fa/setup`,
    { method: "POST" },
  );
  return {
    qrCodeDataUrl: response.data.qr_code,
    secret: response.data.secret,
    recoveryCodes: [],
  };
}

export async function verifyTwoFactorSetup(code: string): Promise<string[]> {
  const response = await apiFetch<ApiEnvelope<{ recovery_codes: string[] }>>(
    `${API_BASE_URL}/api/v1/auth/2fa/verify-setup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    },
  );
  return response.data.recovery_codes;
}

export async function disableTwoFactor(password: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ success: boolean }>>(
    `${API_BASE_URL}/api/v1/auth/2fa/disable`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    },
  );
}

/**
 * Used at sign-in once 2FA is enrolled.
 */
export async function challengeTwoFactor(code: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ success: boolean }>>(
    `${API_BASE_URL}/api/v1/auth/2fa/verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    },
  );
}

/**
 * Used at sign-in to authenticate using a backup recovery code.
 */
export async function challengeTwoFactorRecovery(recoveryCode: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ success: boolean }>>(
    `${API_BASE_URL}/api/v1/auth/2fa/recovery`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recovery_code: recoveryCode }),
    },
  );
}

export async function regenerateRecoveryCodes(
  password: string,
): Promise<string[]> {
  const response = await apiFetch<
    ApiEnvelope<{ recovery_codes: string[] }>
  >(`${API_BASE_URL}/api/v1/auth/2fa/regenerate-recovery-codes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return response.data.recovery_codes;
}
