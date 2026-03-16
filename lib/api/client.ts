/**
 * Shared API client utilities
 * Base URL, request helpers, and common utilities
 */

import { API_CONFIG } from "../api-config";
import type { Attachment, BackendAttachment } from "@/types/api";

export const API_BASE_URL = API_CONFIG.BASE_URL;

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedApiEnvelope<T> extends ApiEnvelope<T> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

type ApiFetchInit = RequestInit & {
  skipContentTypeHeaderCheck?: boolean;
};

function getErrorMessageFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const maybeMessage = (payload as { message?: unknown }).message;
  if (typeof maybeMessage === "string" && maybeMessage.trim()) {
    return maybeMessage;
  }

  const maybeError = (payload as { error?: unknown }).error;
  if (typeof maybeError === "string" && maybeError.trim()) {
    return maybeError;
  }

  return null;
}

export async function apiFetch<T>(
  url: string,
  init: ApiFetchInit = {},
): Promise<T> {
  try {
    const response = await fetch(url, {
      credentials: "include",
      ...init,
    });

    const contentType = response.headers.get("content-type") || "";
    const shouldTreatAsJson =
      init.skipContentTypeHeaderCheck ||
      contentType.includes("application/json");

    let payload: unknown = null;
    if (response.status !== 204) {
      if (shouldTreatAsJson) {
        payload = await response.json();
      } else {
        const textPayload = await response.text();
        throw new Error(
          `Server returned non-JSON response: ${response.status} ${response.statusText}. Response: ${textPayload}`,
        );
      }
    }

    if (!response.ok) {
      const message =
        getErrorMessageFromPayload(payload) ||
        `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }

    throw error;
  }
}

export async function apiFetchBlob(
  url: string,
  init: RequestInit = {},
): Promise<Blob> {
  try {
    const response = await fetch(url, {
      credentials: "include",
      ...init,
    });

    if (!response.ok) {
      const maybeJson = await response.json().catch(() => null);
      const message = getErrorMessageFromPayload(maybeJson) || "Request failed";
      throw new Error(message);
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
