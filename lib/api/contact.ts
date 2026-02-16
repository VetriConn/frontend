/**
 * Contact API Service
 * Contact form and messaging
 */

import { API_BASE_URL } from "./client";
import type { ContactMessage, MessageResponse } from "@/types/api";

// Send contact message
export async function sendContactMessage(
  messageData: ContactMessage,
): Promise<MessageResponse> {
  console.log("Making message request to:", `${API_BASE_URL}/api/v1/contact`);
  console.log("Message data:", messageData);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });

    console.log("Message response status:", response.status);

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.log("Non-JSON response:", textResponse);
      throw new Error(
        `Server returned non-JSON response: ${response.status} ${response.statusText}. Response: ${textResponse}`,
      );
    }

    const data = await response.json();
    console.log("Message response data:", data);

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to send message");
    }

    return data;
  } catch (error) {
    console.error("Message send error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }

    throw error;
  }
}
