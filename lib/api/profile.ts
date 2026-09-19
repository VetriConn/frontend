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
  // No try/catch: the one that was here caught the error and rethrew it
  // unchanged, which is what happens anyway.
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

/**
 * Hand the server the URL of a picture that is already uploaded.
 *
 * This took `File | string` and posted multipart for the File. The bytes do
 * not come through here any more: the profile page signs an upload, sends
 * the crop straight to Cloudinary, and calls this with the secure_url that
 * comes back, so the multipart arm had stopped being reachable and was left
 * behind rather than chosen.
 */
export async function uploadProfilePicture(
  url: string,
): Promise<{ picture_url: string }> {
  const data = await apiFetch<{ data: { picture_url: string } }>(
    `${API_BASE_URL}${API_CONFIG.ENDPOINTS.USER.UPLOAD_PICTURE}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    },
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
