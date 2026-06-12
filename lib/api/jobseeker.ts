/**
 * Job Seeker API Service
 *
 * Messaging, Application Drafts, Saved Searches, and Application Tracker.
 */

import { API_BASE_URL, apiFetch, ApiEnvelope, PaginatedApiEnvelope } from "./client";
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

// ── Application Drafts ──────────────────────────────────────────────────────

export interface ApplicationDraftResponse {
  _id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  location: string;
  relevant_experience: string;
  selected_skills: string[];
  earliest_start_date: string;
  preferred_schedule: string;
  work_location_preference: string;
  additional_info: string;
  createdAt: string;
  updatedAt: string;
}

export async function getDrafts(): Promise<ApplicationDraftResponse[]> {
  const response = await apiFetch<
    ApiEnvelope<{ drafts: ApplicationDraftResponse[] }>
  >(`${API_BASE_URL}/api/v1/job-seeker/application-drafts`, { method: "GET" });

  return response.data?.drafts || [];
}

export async function getDraft(
  jobId: string,
): Promise<ApplicationDraftResponse | null> {
  try {
    const response = await apiFetch<
      ApiEnvelope<{ draft: ApplicationDraftResponse }>
    >(`${API_BASE_URL}/api/v1/job-seeker/application-drafts/${jobId}`, {
      method: "GET",
    });
    return response.data?.draft || null;
  } catch {
    // 404 means no draft exists for this job
    return null;
  }
}

export async function upsertDraft(
  jobId: string,
  data: {
    job_title?: string;
    company_name?: string;
    location?: string;
    relevant_experience?: string;
    selected_skills?: string[];
    earliest_start_date?: string;
    preferred_schedule?: string;
    work_location_preference?: string;
    additional_info?: string;
  },
): Promise<ApplicationDraftResponse> {
  const response = await apiFetch<
    ApiEnvelope<{ draft: ApplicationDraftResponse }>
  >(`${API_BASE_URL}/api/v1/job-seeker/application-drafts/${jobId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.data?.draft) {
    throw new Error("Draft not returned by server");
  }

  return response.data.draft;
}

export async function deleteDraft(jobId: string): Promise<void> {
  await apiFetch<ApiEnvelope<{}>>(
    `${API_BASE_URL}/api/v1/job-seeker/application-drafts/${jobId}`,
    { method: "DELETE" },
  );
}

// ── Saved Searches ──────────────────────────────────────────────────────────

export interface SavedSearchResponse {
  _id: string;
  user_id: string;
  name: string;
  filters: {
    keyword: string;
    location: string;
    job_type: string;
    experience_level: string;
  };
  alert_enabled: boolean;
  last_run_at?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getSavedSearches(): Promise<SavedSearchResponse[]> {
  const response = await apiFetch<
    ApiEnvelope<{ searches: SavedSearchResponse[] }>
  >(`${API_BASE_URL}/api/v1/job-seeker/saved-searches`, { method: "GET" });

  return response.data?.searches || [];
}

export async function createSavedSearch(
  name: string,
  filters: {
    keyword?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
  },
): Promise<SavedSearchResponse> {
  const response = await apiFetch<
    ApiEnvelope<{ search: SavedSearchResponse }>
  >(`${API_BASE_URL}/api/v1/job-seeker/saved-searches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, filters }),
  });

  if (!response.data?.search) {
    throw new Error("Search not returned by server");
  }

  return response.data.search;
}

export async function updateSavedSearch(
  id: string,
  data: { name?: string; alertEnabled?: boolean },
): Promise<SavedSearchResponse> {
  const response = await apiFetch<
    ApiEnvelope<{ search: SavedSearchResponse }>
  >(`${API_BASE_URL}/api/v1/job-seeker/saved-searches/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.data?.search) {
    throw new Error("Search not returned by server");
  }

  return response.data.search;
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await apiFetch<ApiEnvelope<{}>>(
    `${API_BASE_URL}/api/v1/job-seeker/saved-searches/${id}`,
    { method: "DELETE" },
  );
}

export async function runSavedSearch(id: string): Promise<SavedSearchResponse> {
  const response = await apiFetch<
    ApiEnvelope<{ search: SavedSearchResponse }>
  >(`${API_BASE_URL}/api/v1/job-seeker/saved-searches/${id}/run`, {
    method: "POST",
  });

  if (!response.data?.search) {
    throw new Error("Search not returned by server");
  }

  return response.data.search;
}

// ── Application Tracker ─────────────────────────────────────────────────────

export interface TrackerEntryResponse {
  _id: string;
  user_id: string;
  source: "vetriconn" | "external";
  application_id?: string;
  job_id?: string;
  job_title: string;
  company_name: string;
  location: string;
  status: "saved" | "applied" | "viewed" | "interview" | "offer" | "rejected" | "withdrawn";
  notes: string;
  applied_at?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getTrackerEntries(options?: {
  page?: number;
  limit?: number;
}): Promise<{ entries: TrackerEntryResponse[]; total: number }> {
  const { page = 1, limit = 50 } = options || {};
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await apiFetch<
    PaginatedApiEnvelope<TrackerEntryResponse[]>
  >(`${API_BASE_URL}/api/v1/job-seeker/application-tracker?${params}`, {
    method: "GET",
  });

  return {
    entries: response.data || [],
    total: response.pagination?.totalItems || 0,
  };
}

export async function createTrackerEntry(data: {
  job_title: string;
  company_name: string;
  location?: string;
  status?: string;
  notes?: string;
  applied_at?: string;
}): Promise<TrackerEntryResponse> {
  const response = await apiFetch<
    ApiEnvelope<{ entry: TrackerEntryResponse }>
  >(`${API_BASE_URL}/api/v1/job-seeker/application-tracker`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.data?.entry) {
    throw new Error("Tracker entry not returned by server");
  }

  return response.data.entry;
}

export async function updateTrackerEntry(
  id: string,
  data: { status?: string; notes?: string },
): Promise<TrackerEntryResponse> {
  const response = await apiFetch<
    ApiEnvelope<{ entry: TrackerEntryResponse }>
  >(`${API_BASE_URL}/api/v1/job-seeker/application-tracker/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.data?.entry) {
    throw new Error("Tracker entry not returned by server");
  }

  return response.data.entry;
}

export async function deleteTrackerEntry(id: string): Promise<void> {
  await apiFetch<ApiEnvelope<{}>>(
    `${API_BASE_URL}/api/v1/job-seeker/application-tracker/${id}`,
    { method: "DELETE" },
  );
}
