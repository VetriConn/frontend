/**
 * Settings API Service
 * Password, account management, data export, and user settings
 */

import { apiFetch, API_BASE_URL, ApiEnvelope } from "./client";

// Change password
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>(
    `${API_BASE_URL}/api/v1/auth/change-password`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    },
  );
}

/**
 * A request for a data archive, and what became of it.
 *
 * Deliberately no storage identity here. The archive lives in private storage
 * behind a URL signed per download for an authenticated caller; the browser
 * only ever knows the id of the request.
 */
export interface DataExportRecord {
  id: string;
  status: "requested" | "building" | "ready" | "failed" | "expired";
  requested_at: string;
  completed_at?: string;
  expires_at?: string;
  size_bytes?: number;
  is_partial?: boolean;
  omitted_count?: number;
  counts?: Record<string, number>;
  error_message?: string;
}

/**
 * Ask for an archive. POST, because it creates one.
 *
 * Answers 202 with a new request, or 200 with an existing one when there is
 * already a build in flight or a recent archive still downloadable — the
 * caller gets a record either way and does not need to tell the cases apart.
 */
export async function requestDataExport(): Promise<
  ApiEnvelope<DataExportRecord>
> {
  return await apiFetch<ApiEnvelope<DataExportRecord>>(
    `${API_BASE_URL}/api/v1/auth/data-export`,
    {
      method: "POST",
    },
  );
}

/** The most recent request, or null if this account has never asked. */
export async function getDataExportStatus(): Promise<
  ApiEnvelope<DataExportRecord | null>
> {
  return await apiFetch<ApiEnvelope<DataExportRecord | null>>(
    `${API_BASE_URL}/api/v1/auth/data-export`,
    {
      method: "GET",
    },
  );
}

/**
 * Where to send the browser to download an archive.
 *
 * A plain navigation rather than a fetch: the endpoint redirects to a signed
 * storage URL, and following that through fetch would pull the whole archive
 * into memory only to hand it back to the browser again.
 */
export function dataExportDownloadUrl(id: string): string {
  return `${API_BASE_URL}/api/v1/auth/data-export/${id}/download`;
}

// Deactivate account
export async function deactivateAccount(
  password: string,
): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>(
    `${API_BASE_URL}/api/v1/auth/account`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    },
  );
}

// Update user settings
export async function updateUserSettings(
  settings: Record<string, unknown>,
): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>(
    `${API_BASE_URL}/api/v1/auth/settings`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    },
  );
}
