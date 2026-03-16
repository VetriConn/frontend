/**
 * Jobs API Service
 * Job listing, search, applications, and saved jobs
 */

import {
  apiFetch,
  API_BASE_URL,
  ApiEnvelope,
  PaginatedApiEnvelope,
} from "./client";
import type { ApplicationItem, JobsResponse } from "@/types/api";

// Fetch jobs from database
export async function getJobs(options?: {
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
}): Promise<JobsResponse[]> {
  const { page = 1, limit = 10, location, search } = options || {};

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (location) {
    queryParams.append("location", location);
  }

  if (search) {
    queryParams.append("search", search);
  }

  const data = await apiFetch<
    JobsResponse[] | PaginatedApiEnvelope<JobsResponse[]>
  >(`${API_BASE_URL}/api/v1/jobs?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Backend wraps jobs in { success, data, pagination } — extract the array
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in data) {
    const payload = data.data;
    if (Array.isArray(payload)) return payload;
  }
  return [];
}

// Fetch single job by ID
export async function getJobById(jobId: string): Promise<JobsResponse> {
  const response = await apiFetch<ApiEnvelope<JobsResponse>>(
    `${API_BASE_URL}/api/v1/jobs/${jobId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}

// Submit job application
export async function submitJobApplication(
  jobId: string,
  formData: FormData,
): Promise<{ message: string; applicationId?: string }> {
  if (!formData.get("jobId")) {
    formData.append("jobId", jobId);
  }

  const response = await apiFetch<
    ApiEnvelope<{
      application: {
        id: string;
      };
    }>
  >(`${API_BASE_URL}/api/v1/applications`, {
    method: "POST",
    body: formData,
  });

  return {
    message: response.message,
    applicationId: response.data?.application?.id,
  };
}

export async function getMyApplications(): Promise<ApplicationItem[]> {
  const response = await apiFetch<
    ApiEnvelope<{
      applications: ApplicationItem[];
    }>
  >(`${API_BASE_URL}/api/v1/applications`, {
    method: "GET",
  });

  return response.data?.applications || [];
}

// Save a job
export async function saveJob(jobId: string): Promise<{ message: string }> {
  const response = await apiFetch<ApiEnvelope<{ jobId: string }>>(
    `${API_BASE_URL}/api/v1/auth/saved-jobs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobId }),
    },
  );

  return { message: response.message };
}

// Unsave a job
export async function unsaveJob(jobId: string): Promise<{ message: string }> {
  const response = await apiFetch<ApiEnvelope<{ jobId: string }>>(
    `${API_BASE_URL}/api/v1/auth/saved-jobs/${jobId}`,
    {
      method: "DELETE",
    },
  );

  return { message: response.message };
}

export async function getSavedJobs(): Promise<JobsResponse[]> {
  const response = await apiFetch<
    PaginatedApiEnvelope<{
      jobs: JobsResponse[];
    }>
  >(`${API_BASE_URL}/api/v1/auth/saved-jobs`, {
    method: "GET",
  });

  return response.data?.jobs || [];
}

export async function getRecommendedJobs(): Promise<JobsResponse[]> {
  const response = await apiFetch<
    ApiEnvelope<{
      jobs: JobsResponse[];
    }>
  >(`${API_BASE_URL}/api/v1/jobs/recommended`, {
    method: "GET",
  });

  return response.data?.jobs || [];
}
