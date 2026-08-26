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

// Once a dead session is detected we send the user to sign in exactly once —
// concurrent failing requests must not stack up redirects.
let redirectingToSignin = false;

/**
 * Endpoints where a 401/403 is an expected answer to a fresh attempt (wrong
 * password, bad/expired token in an email link) rather than an expired session,
 * so they must NOT trigger the auto sign-out.
 */
function isPreAuthEndpoint(url: string): boolean {
  return (
    /\/api\/v1\/auth\/(login|register|two-factor|forgot-password|reset-password|verify-email|resend-verification|check-verification|check-email)/i.test(
      url,
    ) || /\/invites\/accept/i.test(url)
  );
}

/**
 * A previously-valid session has expired or been revoked. Rather than leaving
 * the page stuck on error/loading states, send the user to sign in and bring
 * them back to where they were afterward.
 */
function handleExpiredSession(): void {
  if (typeof window === "undefined" || redirectingToSignin) return;
  const path = window.location.pathname;
  if (path.startsWith("/signin")) return;
  // Only bounce out of the authenticated areas. A 401 while browsing public
  // pages (an anonymous visitor) is normal and must not force a sign-in.
  if (!path.startsWith("/dashboard") && !path.startsWith("/admin")) return;
  redirectingToSignin = true;
  // `redirect` is the return-url param the sign-in page reads (RETURN_URL_PARAM).
  const back = path + window.location.search;
  window.location.assign(
    `/signin?reason=session-expired&redirect=${encodeURIComponent(back)}`,
  );
}

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
    // Custom header the backend requires on cookie-authenticated mutations
    // (CSRF defense — a cross-site form/simple request cannot set it).
    const headers = new Headers(init.headers);
    if (!headers.has("X-Requested-With")) {
      headers.set("X-Requested-With", "XMLHttpRequest");
    }
    const response = await fetch(url, {
      credentials: "include",
      ...init,
      headers,
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

      // A dead session (401, or the "invalid/expired token" 403) on any
      // authenticated request → sign the user out cleanly instead of leaving
      // the UI wedged. Login/verify flows are excluded so their own errors show.
      const sessionExpired =
        response.status === 401 ||
        (response.status === 403 && /invalid or expired token/i.test(message));
      if (sessionExpired && !isPreAuthEndpoint(url)) {
        handleExpiredSession();
      }

      throw new Error(message);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to the server. Please try again.`,
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
    const headers = new Headers(init.headers);
    if (!headers.has("X-Requested-With")) {
      headers.set("X-Requested-With", "XMLHttpRequest");
    }
    const response = await fetch(url, {
      credentials: "include",
      ...init,
      headers,
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
        `Network error: Unable to connect to the backend server. Please ensure the server is running.`,
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
