/**
 * Shared API client utilities
 * Base URL, auth token management, and common helpers
 */

import { API_CONFIG } from "../api-config";
import type { Attachment, BackendAttachment } from "@/types/api";

export const API_BASE_URL = API_CONFIG.BASE_URL;

// ============================================================================
// Auth Token Management
// ============================================================================

export function storeAuthToken(token: string, rememberMe: boolean = true) {
  if (typeof window !== "undefined") {
    if (rememberMe) {
      localStorage.setItem("authToken", token);
      sessionStorage.removeItem("authToken"); // Clean up other storage
    } else {
      sessionStorage.setItem("authToken", token);
      localStorage.removeItem("authToken"); // Clean up other storage
    }
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
  }
}

// ============================================================================
// Attachment Normalization
// ============================================================================

export function normalizeAttachment(
  backendAttachment: BackendAttachment,
): Attachment {
  return {
    // Backend fields
    _id: backendAttachment._id,
    name: backendAttachment.name,
    url: backendAttachment.url,
    file_type: backendAttachment.file_type,
    file_size: backendAttachment.file_size,
    upload_date: backendAttachment.upload_date,
    description: backendAttachment.description,

    // Frontend compatibility fields
    id: backendAttachment._id || backendAttachment.id,
    type: backendAttachment.file_type || backendAttachment.type,
    size: backendAttachment.file_size || backendAttachment.size,
    uploadedAt: backendAttachment.upload_date || backendAttachment.uploadedAt,
    preview: backendAttachment.preview,
  };
}

export function normalizeAttachments(
  attachments: BackendAttachment[],
): Attachment[] {
  if (!Array.isArray(attachments)) return [];
  return attachments.map(normalizeAttachment);
}
