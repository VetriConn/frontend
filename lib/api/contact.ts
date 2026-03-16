/**
 * Contact API Service
 * Contact form and messaging
 */

import { apiFetch, API_BASE_URL } from "./client";
import { API_CONFIG } from "@/lib/api-config";
import type { ContactMessage, MessageResponse } from "@/types/api";

// Send contact message
export async function sendContactMessage(
  messageData: ContactMessage,
): Promise<MessageResponse> {
  // Send contact messages to the backend endpoint so the backend (which
  // already has Resend configured) performs the actual email send.
  // `API_CONFIG.ENDPOINTS.CONTACT.SEND` contains the endpoint path.
  const contactUrl = `${API_BASE_URL}${API_CONFIG.ENDPOINTS.CONTACT.SEND}`;

  return await apiFetch<MessageResponse>(contactUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  });
}
