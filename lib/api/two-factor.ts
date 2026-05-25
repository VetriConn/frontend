/**
 * Two-Factor Authentication API Service
 *
 * Backend endpoints (see PublicBETODO.txt §8 / AdminBETODO.txt §2.a):
 *   POST /api/v1/auth/2fa/setup       — start enrollment
 *   POST /api/v1/auth/2fa/verify      — confirm enrollment
 *   POST /api/v1/auth/2fa/disable     — turn off (requires password)
 *   POST /api/v1/auth/2fa/challenge   — sign-in second factor
 *   POST /api/v1/auth/2fa/recovery-codes — regenerate codes
 *
 * Until the backend lands these, this module ships a small mock layer
 * that produces deterministic-looking output so the UI is fully usable
 * end-to-end. Swap each function body for an `apiFetch` call once the
 * real endpoints are live — the signatures already match.
 */

import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";

const USE_MOCK = true;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TwoFactorSetupResponse {
  /** Data URL for the QR code the user scans in their authenticator app. */
  qrCodeDataUrl: string;
  /** Plain shared secret, shown as a fallback for users who can't scan. */
  secret: string;
  /** One-time recovery codes, only shown once at enrollment. */
  recoveryCodes: string[];
}

// ─── Mock helpers ───────────────────────────────────────────────────────────

const generateMockCode = () =>
  Array.from({ length: 4 })
    .map(() =>
      Math.random()
        .toString(36)
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 4)
        .toUpperCase(),
    )
    .join("-");

const generateMockSecret = () =>
  Array.from({ length: 32 })
    .map(() =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"[Math.floor(Math.random() * 32)],
    )
    .join("");

const buildPlaceholderQr = (label: string) =>
  // 200x200 SVG placeholder. The real backend returns a proper data URL or
  // image URL; the UI doesn't care which.
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
      <rect width='200' height='200' fill='white' stroke='#e5e7eb'/>
      <text x='100' y='100' font-family='monospace' font-size='12'
            text-anchor='middle' dominant-baseline='middle' fill='#1f2937'>
        ${label}
      </text>
    </svg>`,
  )}`;

// ─── Endpoints ──────────────────────────────────────────────────────────────

export async function startTwoFactorSetup(): Promise<TwoFactorSetupResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 350));
    return {
      qrCodeDataUrl: buildPlaceholderQr("Scan in your authenticator"),
      secret: generateMockSecret(),
      recoveryCodes: Array.from({ length: 10 }, () => generateMockCode()),
    };
  }
  const response = await apiFetch<ApiEnvelope<TwoFactorSetupResponse>>(
    `${API_BASE_URL}/api/v1/auth/2fa/setup`,
    { method: "POST" },
  );
  return response.data;
}

export async function verifyTwoFactorSetup(code: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    if (!/^\d{6}$/.test(code)) {
      throw new Error("Enter the 6-digit code from your authenticator app.");
    }
    return;
  }
  await apiFetch<ApiEnvelope<{ success: boolean }>>(
    `${API_BASE_URL}/api/v1/auth/2fa/verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    },
  );
}

export async function disableTwoFactor(password: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    if (!password.trim()) {
      throw new Error("Enter your password to confirm.");
    }
    return;
  }
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
 * Used at sign-in once 2FA is enrolled. Not wired into the existing
 * sign-in form yet — this is a frontend hook waiting for the backend
 * partial-session flow described in AdminBETODO.txt §2.a.
 */
export async function challengeTwoFactor(code: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    if (!/^\d{6}$/.test(code)) {
      throw new Error("Enter the 6-digit code from your authenticator app.");
    }
    return;
  }
  await apiFetch<ApiEnvelope<{ success: boolean }>>(
    `${API_BASE_URL}/api/v1/auth/2fa/challenge`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    },
  );
}

export async function regenerateRecoveryCodes(
  password: string,
): Promise<string[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    if (!password.trim()) {
      throw new Error("Enter your password to confirm.");
    }
    return Array.from({ length: 10 }, () => generateMockCode());
  }
  const response = await apiFetch<
    ApiEnvelope<{ recoveryCodes: string[] }>
  >(`${API_BASE_URL}/api/v1/auth/2fa/recovery-codes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return response.data.recoveryCodes;
}
