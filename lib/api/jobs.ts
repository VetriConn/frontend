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

/** Per-source outcome of one scraper run. */
export interface ScraperSourceSummary {
  source: string;
  found: number;
  inserted: number;
  updated: number;
  skipped: number;
}

/**
 * Run the job scraper now instead of waiting for the six-hourly cron.
 * Admin only. `pages` caps how many result pages each source walks.
 */
export async function triggerJobScrape(
  pages?: number,
): Promise<ScraperSourceSummary[]> {
  const query = pages ? `?pages=${pages}` : "";
  const response = await apiFetch<
    ApiEnvelope<ScraperSourceSummary[] | ScraperSourceSummary>
  >(`${API_BASE_URL}/api/v1/jobs/admin/scrape${query}`, { method: "POST" });

  const summary = response.data;
  if (!summary) return [];
  return Array.isArray(summary) ? summary : [summary];
}

// Fetch jobs from database
export interface JobsPage {
  jobs: JobsResponse[];
  /** Absent when the response carried no envelope. */
  pagination?: PaginationMeta;
  /**
   * The server found little for this search and is fetching more from its
   * sources in the background. The results shown are not the final answer.
   */
  searchingMore?: boolean;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export async function getJobs(options?: {
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
  jobType?: string;
  experience?: string;
  arrangement?: string;
}): Promise<JobsPage> {
  const {
    page = 1,
    limit = 10,
    location,
    search,
    jobType,
    experience,
    arrangement,
  } = options || {};

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

  // Both narrow in the database now — they used to be applied in the browser,
  // which is why this had to fetch the whole board.
  if (jobType) {
    queryParams.append("jobType", jobType);
  }

  if (experience) {
    queryParams.append("experience", experience);
  }

  if (arrangement) {
    queryParams.append("arrangement", arrangement);
  }

  const data = await apiFetch<
    JobsResponse[] | PaginatedApiEnvelope<JobsResponse[]>
  >(`${API_BASE_URL}/api/v1/jobs?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Backend wraps jobs in { success, data, pagination }. The pagination block
  // was being discarded, so callers could only ever know how many rows they
  // had received — never how many exist, which is what page controls need.
  if (Array.isArray(data)) return { jobs: data };
  if (data && typeof data === "object" && "data" in data) {
    const payload = data.data;
    if (Array.isArray(payload)) {
      return {
        jobs: payload,
        pagination: (data as PaginatedApiEnvelope<JobsResponse[]>).pagination,
        searchingMore:
          (data as { searching_more?: boolean }).searching_more === true,
      };
    }
  }
  return { jobs: [] };
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
