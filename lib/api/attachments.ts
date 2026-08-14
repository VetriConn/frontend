/**
 * Attachments API Service
 * Profile document upload, listing, updating, and deletion
 */

import { apiFetch, API_BASE_URL, ApiEnvelope } from "./client";
import type { Attachment } from "@/types/api";

export async function uploadAttachment(
  file: File,
  description?: string,
): Promise<{ attachment: Attachment; user_attachments: Attachment[] }> {
  const formData = new FormData();
  formData.append("file", file);
  if (description?.trim()) {
    formData.append("description", description.trim());
  }

  const response = await apiFetch<
    ApiEnvelope<{ attachment: Attachment; user_attachments: Attachment[] }>
  >(`${API_BASE_URL}/api/v1/attachments/upload`, {
    method: "POST",
    body: formData,
  });

  return {
    attachment: response.data.attachment,
    user_attachments: response.data.user_attachments,
  };
}

/**
 * Get all attachments for the current user.
 */
export async function getUserAttachments(): Promise<Attachment[]> {
  const response = await apiFetch<
    ApiEnvelope<{ attachments: Attachment[] }>
  >(`${API_BASE_URL}/api/v1/attachments`, {
    method: "GET",
  });

  return response.data?.attachments || [];
}

/**
 * Update attachment metadata (name and/or description).
 */
export async function updateAttachment(
  attachmentId: string,
  data: { name?: string; description?: string },
): Promise<Attachment[]> {
  const response = await apiFetch<
    ApiEnvelope<{ attachments: Attachment[] }>
  >(`${API_BASE_URL}/api/v1/attachments/${attachmentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.data?.attachments || [];
}

/**
 * Delete an attachment by ID.
 */
export async function deleteAttachment(
  attachmentId: string,
): Promise<Attachment[]> {
  const response = await apiFetch<
    ApiEnvelope<{ attachments: Attachment[] }>
  >(`${API_BASE_URL}/api/v1/attachments/${attachmentId}`, {
    method: "DELETE",
  });

  return response.data?.attachments || [];
}
