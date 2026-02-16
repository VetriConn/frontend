/**
 * Profile API Service
 * User profile CRUD and profile picture management
 */

import { API_BASE_URL, getAuthToken, normalizeAttachments } from "./client";
import type { UserProfile, UserProfileResponse } from "@/types/api";

// Get user profile
export async function getUserProfile(): Promise<UserProfileResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to fetch profile");
    }

    // Normalize attachments if they exist in the profile
    if (data.data && data.data.user && data.data.user.attachments) {
      data.data.user.attachments = normalizeAttachments(
        data.data.user.attachments,
      );
    }

    return data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
}

// PATCH user profile (partial update for profile page)
export async function patchUserProfile(
  profileData: Partial<UserProfile>,
): Promise<UserProfileResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to update profile");
    }

    return data;
  } catch (error) {
    console.error("Profile patch error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to server. Please ensure the backend server is running.`,
      );
    }

    throw error;
  }
}

// Upload profile picture
export async function uploadProfilePicture(
  file: File,
): Promise<{ picture_url: string }> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const formData = new FormData();
  formData.append("picture", file);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/profile-picture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to upload profile picture",
      );
    }

    return data.data;
  } catch (error) {
    console.error("Profile picture upload error:", error);
    throw error;
  }
}

// Delete profile picture
export async function deleteProfilePicture(): Promise<void> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/profile-picture`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to delete profile picture",
      );
    }
  } catch (error) {
    console.error("Profile picture delete error:", error);
    throw error;
  }
}
