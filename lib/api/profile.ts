/**
 * Profile API Service
 * User profile CRUD and profile picture management
 */

import { API_BASE_URL, normalizeAttachments } from "./client";
import { apiFetch } from "./client";
import type {
  BackendAttachment,
  UserProfile,
  UserProfileResponse,
} from "@/types/api";

// Get user profile
export async function getUserProfile(): Promise<UserProfileResponse> {
  try {
    const data = await apiFetch<UserProfileResponse>(
      `${API_BASE_URL}/api/v1/auth/profile`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Normalize attachments if they exist in the profile
    if (data.data && data.data.user && data.data.user.attachments) {
      const attachmentsForNormalization: BackendAttachment[] =
        data.data.user.attachments.map((attachment) => ({
          ...attachment,
          upload_date:
            typeof attachment.upload_date === "string"
              ? attachment.upload_date
              : attachment.upload_date?.toISOString(),
        }));

      data.data.user.attachments = normalizeAttachments(
        attachmentsForNormalization,
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// PATCH user profile (partial update for profile page)
export async function patchUserProfile(
  profileData: Partial<UserProfile>,
): Promise<UserProfileResponse> {
  return await apiFetch<UserProfileResponse>(
    `${API_BASE_URL}/api/v1/auth/profile`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    },
  );
}

// Upload profile picture
export async function uploadProfilePicture(
  file: File,
): Promise<{ picture_url: string }> {
  const formData = new FormData();
  formData.append("picture", file);

  const data = await apiFetch<{ data: { picture_url: string } }>(
    `${API_BASE_URL}/api/v1/auth/profile-picture`,
    {
      method: "POST",
      body: formData,
    },
  );

  return data.data;
}

// Delete profile picture
export async function deleteProfilePicture(): Promise<void> {
  await apiFetch<{ success: boolean; message: string }>(
    `${API_BASE_URL}/api/v1/auth/profile-picture`,
    {
      method: "DELETE",
    },
  );
}
