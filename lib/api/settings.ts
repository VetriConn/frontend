/**
 * Settings API Service
 * Password, account management, data export, and user settings
 */

import { API_BASE_URL } from "./client";

// Change password
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/change-password`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to change password",
      );
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }
    throw error;
  }
}

// Request data export
export async function requestDataExport(): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/data-export`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message || "Failed to export data",
      );
    }
    return await response.blob();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }
    throw error;
  }
}

// Deactivate account
export async function deactivateAccount(
  password: string,
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/account`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to deactivate account",
      );
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }
    throw error;
  }
}

// Update user settings
export async function updateUserSettings(
  settings: Record<string, unknown>,
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(settings),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to update settings",
      );
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }
    throw error;
  }
}
