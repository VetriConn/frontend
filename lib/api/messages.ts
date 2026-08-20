import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";

/**
 * One messaging surface for one account.
 *
 * A thread hangs off an application, and the server decides which end of it
 * you are on — there is no separate endpoint for applying and for hiring, and
 * nothing here declares a side.
 */

/** Which end of a thread the signed-in account is on. */
export type ThreadSide = "applicant" | "employer";

export interface ThreadMessage {
  _id: string;
  sender: ThreadSide;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_mime_type?: string;
  attachment_size?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ThreadCounterpart {
  user_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  selected_skills?: string[];
  additional_info?: string;
}

export interface ThreadSummary {
  application_id: string;
  side: ThreadSide;
  job: { role: string; company_name: string; company_logo?: string };
  counterpart: ThreadCounterpart;
  applied_at?: string;
  application_status?: string;
  last_message: string;
  last_message_at?: string;
  unread_count: number;
}

export interface ThreadDetail extends Omit<ThreadSummary, "last_message" | "unread_count"> {
  job: ThreadSummary["job"] & { location?: string };
}

const MESSAGES_URL = `${API_BASE_URL}/api/v1/messages`;

/** Every thread this account is on, both sides, newest first. */
export async function getMessageThreads(): Promise<ThreadSummary[]> {
  const response = await apiFetch<ApiEnvelope<{ threads: ThreadSummary[] }>>(
    `${MESSAGES_URL}/threads`,
    { method: "GET" },
  );
  return response.data?.threads || [];
}

/** Opening a thread marks the other side's messages read. */
export async function getThreadMessages(applicationId: string): Promise<{
  thread: ThreadDetail | undefined;
  messages: ThreadMessage[];
}> {
  const response = await apiFetch<
    ApiEnvelope<{ thread: ThreadDetail; messages: ThreadMessage[] }>
  >(`${MESSAGES_URL}/${applicationId}`, { method: "GET" });

  return {
    thread: response.data?.thread,
    messages: response.data?.messages || [],
  };
}

export async function sendThreadMessage(
  applicationId: string,
  content: string,
): Promise<ThreadMessage | undefined> {
  const response = await apiFetch<ApiEnvelope<{ message: ThreadMessage }>>(
    `${MESSAGES_URL}/${applicationId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );
  return response.data?.message;
}

/**
 * Multipart under the field name `attachment`; Content-Type is left to the
 * browser so the boundary is set correctly. The server validates the file in
 * memory before anything is hosted.
 */
export async function sendThreadAttachment(
  applicationId: string,
  file: File,
  content?: string,
): Promise<ThreadMessage | undefined> {
  const formData = new FormData();
  formData.append("attachment", file);
  if (content) formData.append("content", content);

  const response = await apiFetch<ApiEnvelope<{ message: ThreadMessage }>>(
    `${MESSAGES_URL}/${applicationId}/attachments`,
    { method: "POST", body: formData },
  );
  return response.data?.message;
}
