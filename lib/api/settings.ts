/**
 * Settings API Service
 * Password, account management, data export, and user settings
 */

import { apiFetch, apiFetchBlob, API_BASE_URL } from "./client";

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

// Request data export
export async function requestDataExport(): Promise<Blob> {
  return await apiFetchBlob(`${API_BASE_URL}/api/v1/auth/data-export`, {
    method: "GET",
  });
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
