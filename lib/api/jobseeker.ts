/**
 * Job Seeker Messaging API Service
 *
 * Mirrors the employer messaging endpoints in `./employer.ts` but with the
 * thread keyed on the employer side (since the seeker is the "current user").
 */

import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";
import type { JobSeekerThreadMessage } from "@/types/api";

export interface JobSeekerThreadSummary {
  application_id: string;
  employer: {
    user_id?: string;
    company_name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
  };
  job: {
    role: string;
    company_name: string;
  };
  applied_at?: string;
  last_message?: {
    _id: string;
    sender: "job_seeker" | "employer";
    content: string;
    attachment_url?: string;
    attachment_name?: string;
    createdAt: string;
  } | null;
}

export type JobSeekerThreadDetail = JobSeekerThreadSummary;

export type { JobSeekerThreadMessage };

export async function getJobSeekerMessageThreads(): Promise<
  JobSeekerThreadSummary[]
> {
  const response = await apiFetch<
    ApiEnvelope<{ threads: JobSeekerThreadSummary[] }>
  >(`${API_BASE_URL}/api/v1/job-seeker/messages/threads`, { method: "GET" });

  return response.data?.threads || [];
}

export async function getJobSeekerThreadMessages(
  applicationId: string,
): Promise<{
  thread: JobSeekerThreadDetail;
  messages: JobSeekerThreadMessage[];
}> {
  const response = await apiFetch<
    ApiEnvelope<{
      thread: JobSeekerThreadDetail;
      messages: JobSeekerThreadMessage[];
    }>
  >(`${API_BASE_URL}/api/v1/job-seeker/messages/${applicationId}`, {
    method: "GET",
  });

  return {
    thread: response.data?.thread,
    messages: response.data?.messages || [],
  };
}

export async function sendJobSeekerMessage(
  applicationId: string,
  content: string,
): Promise<JobSeekerThreadMessage> {
  const response = await apiFetch<
    ApiEnvelope<{ message: JobSeekerThreadMessage }>
  >(`${API_BASE_URL}/api/v1/job-seeker/messages/${applicationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.data?.message) {
    throw new Error("Message not returned by server");
  }

  return response.data.message;
}

export async function sendJobSeekerAttachmentMessage(
  applicationId: string,
  file: File,
  content?: string,
): Promise<JobSeekerThreadMessage> {
  const formData = new FormData();
  formData.append("attachment", file);
  if (content?.trim()) {
    formData.append("content", content.trim());
  }

  const response = await apiFetch<
    ApiEnvelope<{ message: JobSeekerThreadMessage }>
  >(
    `${API_BASE_URL}/api/v1/job-seeker/messages/${applicationId}/attachments`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.data?.message) {
    throw new Error("Attachment message not returned by server");
  }

  return response.data.message;
}
