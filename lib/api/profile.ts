/**
 * Profile API Service
 * User profile CRUD and profile picture management
 */

import { API_BASE_URL, normalizeAttachments } from "./client";
import { apiFetch } from "./client";
import { API_CONFIG } from "../api-config";
import type {
  BackendAttachment,
  UserProfile,
  UserProfileResponse,
} from "@/types/api";

// Get user profile
export async function getUserProfile(): Promise<UserProfileResponse> {
  try {
    const data = await apiFetch<UserProfileResponse>(
      `${API_BASE_URL}${API_CONFIG.ENDPOINTS.USER.PROFILE}`,
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

/**
 * What PATCH /auth/profile actually accepts.
 *
 * This was `Partial<UserProfile>` — the RESPONSE shape — so TypeScript was
 * happy to let a caller send `picture`, `password`, `id`, `role`, `email`,
 * `saved_jobs_count` or `emailVerified`. The endpoint's schema is strict and
 * rejects every one of them, so each would have been a 400 at runtime that
 * nothing caught at the keyboard. `picture` is the one that matters: it is
 * refused deliberately, because accepting a client-supplied asset URL is
 * what let one account point at another's image and then delete it.
 *
 * Keep this list matching the server's profileUpdateSchema.
 */
export type ProfileUpdate = Partial<
  Pick<
    UserProfile,
    | "full_name"
    | "bio"
    | "phone_number"
    | "city"
    | "state_province"
    | "country"
    | "job_title"
    | "industry"
    | "years_of_experience"
    | "promotional_emails"
    | "looking_for"
    | "skills"
    | "socials"
    | "work_experience"
    | "education"
    | "certifications"
  >
>;

// PATCH user profile (partial update for profile page)
export async function patchUserProfile(
  profileData: ProfileUpdate,
): Promise<UserProfileResponse> {
  return await apiFetch<UserProfileResponse>(
    `${API_BASE_URL}${API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE}`,
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
  fileOrUrl: File | string,
): Promise<{ picture_url: string }> {
  let init: RequestInit;
  if (typeof fileOrUrl === "string") {
    init = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: fileOrUrl }),
    };
  } else {
    const formData = new FormData();
    formData.append("picture", fileOrUrl);
    init = {
      method: "POST",
      body: formData,
    };
  }

  const data = await apiFetch<{ data: { picture_url: string } }>(
    `${API_BASE_URL}${API_CONFIG.ENDPOINTS.USER.UPLOAD_PICTURE}`,
    init,
  );

  return data.data;
}

// Delete profile picture
export async function deleteProfilePicture(): Promise<void> {
  await apiFetch<{ success: boolean; message: string }>(
    `${API_BASE_URL}${API_CONFIG.ENDPOINTS.USER.DELETE_PICTURE}`,
    {
      method: "DELETE",
    },
  );
}
