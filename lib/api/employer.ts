import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";
import type {
  ApplicationItem,
  EmployerDraftPayload,
  EmployerJobDetail,
  EmployerJobSummary,
  EmployerThreadDetail,
  EmployerThreadMessage,
  EmployerThreadSummary,
} from "@/types/api";

export interface CreateEmployerJobInput {
  role: string;
  description: string;
  skills?: string;
  experience_level?: string;
  physical_demands?: string;
  salary_min?: string;
  salary_max?: string;
  payment_type?: string;
  city?: string;
  country?: string;
  work_schedule?: string;
  employment_type?: string;
  job_type?: string;
  job_category?: string;
  status?: "draft" | "published";
  company_name?: string;
  company_logo?: string;
  draft_payload?: EmployerDraftPayload;
}

export async function getEmployerJobs(): Promise<EmployerJobSummary[]> {
  const response = await apiFetch<ApiEnvelope<{ jobs: EmployerJobSummary[] }>>(
    `${API_BASE_URL}/api/v1/employer/jobs`,
    { method: "GET" },
  );

  return response.data?.jobs || [];
}

export async function getEmployerApplications(): Promise<ApplicationItem[]> {
  const response = await apiFetch<
    ApiEnvelope<{ applications: ApplicationItem[] }>
  >(`${API_BASE_URL}/api/v1/employer/applications`, { method: "GET" });

  return response.data?.applications || [];
}

export async function getEmployerJobById(
  jobId: string,
): Promise<EmployerJobDetail> {
  const response = await apiFetch<ApiEnvelope<{ job: EmployerJobDetail }>>(
    `${API_BASE_URL}/api/v1/employer/jobs/${jobId}`,
    {
      method: "GET",
    },
  );

  if (!response.data?.job) {
    throw new Error("Job not returned by server");
  }

  return response.data.job;
}

export async function createEmployerJob(
  payload: CreateEmployerJobInput,
): Promise<EmployerJobSummary> {
  const response = await apiFetch<ApiEnvelope<{ job: EmployerJobSummary }>>(
    `${API_BASE_URL}/api/v1/employer/jobs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.data?.job) {
    throw new Error("Job not returned by server");
  }

  return response.data.job;
}

export async function updateEmployerJob(
  jobId: string,
  payload: Partial<CreateEmployerJobInput>,
): Promise<EmployerJobSummary> {
  const response = await apiFetch<ApiEnvelope<{ job: EmployerJobSummary }>>(
    `${API_BASE_URL}/api/v1/employer/jobs/${jobId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.data?.job) {
    throw new Error("Updated job not returned by server");
  }

  return response.data.job;
}

export async function deleteEmployerJob(jobId: string): Promise<void> {
  await apiFetch<ApiEnvelope<null>>(
    `${API_BASE_URL}/api/v1/employer/jobs/${jobId}`,
    {
      method: "DELETE",
    },
  );
}

export async function updateEmployerApplicationStatus(
  applicationId: string,
  status: "pending" | "reviewed" | "accepted" | "rejected",
): Promise<ApplicationItem> {
  const response = await apiFetch<
    ApiEnvelope<{ application: ApplicationItem }>
  >(`${API_BASE_URL}/api/v1/employer/applications/${applicationId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.data?.application) {
    throw new Error("Application not returned by server");
  }

  return response.data.application;
}

export async function uploadEmployerCompanyAsset(
  assetType: "logo" | "banner",
  file: File,
): Promise<{ asset_url: string; asset_type: "logo" | "banner" }> {
  const formData = new FormData();
  formData.append("asset", file);

  const response = await apiFetch<
    ApiEnvelope<{ asset_url: string; asset_type: "logo" | "banner" }>
  >(`${API_BASE_URL}/api/v1/employer/company-assets/${assetType}`, {
    method: "POST",
    body: formData,
  });

  if (!response.data?.asset_url || !response.data?.asset_type) {
    throw new Error("Asset upload did not return URL");
  }

  return response.data;
}

export async function getEmployerMessageThreads(): Promise<
  EmployerThreadSummary[]
> {
  const response = await apiFetch<
    ApiEnvelope<{ threads: EmployerThreadSummary[] }>
  >(`${API_BASE_URL}/api/v1/employer/messages/threads`, { method: "GET" });

  return response.data?.threads || [];
}

export async function getEmployerThreadMessages(
  applicationId: string,
): Promise<{
  thread: EmployerThreadDetail;
  messages: EmployerThreadMessage[];
}> {
  const response = await apiFetch<
    ApiEnvelope<{
      thread: EmployerThreadDetail;
      messages: EmployerThreadMessage[];
    }>
  >(`${API_BASE_URL}/api/v1/employer/messages/${applicationId}`, {
    method: "GET",
  });

  return {
    thread: response.data?.thread,
    messages: response.data?.messages || [],
  };
}

export async function sendEmployerMessage(
  applicationId: string,
  content: string,
): Promise<EmployerThreadMessage> {
  const response = await apiFetch<
    ApiEnvelope<{ message: EmployerThreadMessage }>
  >(`${API_BASE_URL}/api/v1/employer/messages/${applicationId}`, {
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

export async function sendEmployerAttachmentMessage(
  applicationId: string,
  file: File,
  content?: string,
): Promise<EmployerThreadMessage> {
  const formData = new FormData();
  formData.append("attachment", file);
  if (content?.trim()) {
    formData.append("content", content.trim());
  }

  const response = await apiFetch<
    ApiEnvelope<{ message: EmployerThreadMessage }>
  >(`${API_BASE_URL}/api/v1/employer/messages/${applicationId}/attachments`, {
    method: "POST",
    body: formData,
  });

  if (!response.data?.message) {
    throw new Error("Attachment message not returned by server");
  }

  return response.data.message;
}
