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

// ─── Admin job moderation ────────────────────────────────────────────────────

/** The raw job record the admin moderation endpoints return (lean docs). */
export interface AdminJobRaw {
  _id: string;
  id?: string;
  role: string;
  company_name: string;
  company_logo?: string;
  location?: string;
  job_type?: string;
  salary?: { number?: number; currency?: string; symbol?: string };
  salary_range?: {
    start_salary?: { number?: number };
    end_salary?: { number?: number };
  };
  salary_text?: string;
  payment_type?: string;
  description?: string;
  full_description?: string;
  responsibilities?: string[];
  qualifications?: string[];
  moderation_status?: "pending" | "approved" | "rejected";
  is_approved?: boolean;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  scam_flags?: string[];
  application_count?: number;
  createdAt?: string;
  poster_id?: string;
  company_id?: string;
  posted_as?: string;
}

/** List jobs for the review queue, filtered by moderation state. */
export async function adminListJobs(
  approval: "pending" | "approved" | "rejected",
): Promise<AdminJobRaw[]> {
  const response = await apiFetch<PaginatedApiEnvelope<AdminJobRaw[]>>(
    `${API_BASE_URL}/api/v1/jobs/admin/all?approval=${approval}&limit=100`,
    { method: "GET" },
  );
  return response.data ?? [];
}

/** Approve a pending job (id is the Mongo _id). */
export async function adminApproveJob(id: string): Promise<void> {
  await apiFetch<ApiEnvelope<unknown>>(
    `${API_BASE_URL}/api/v1/jobs/admin/${id}/approve`,
    { method: "PATCH" },
  );
}

/** Reject a pending job with a reason. */
export async function adminRejectJob(
  id: string,
  reason: string,
): Promise<void> {
  await apiFetch<ApiEnvelope<unknown>>(
    `${API_BASE_URL}/api/v1/jobs/admin/${id}/reject`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  );
}

/** Approve several jobs at once. */
export async function adminBulkApproveJobs(ids: string[]): Promise<void> {
  await apiFetch<ApiEnvelope<unknown>>(
    `${API_BASE_URL}/api/v1/jobs/admin/bulk-approve`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    },
  );
}

/** Reject several jobs at once with a shared reason. */
export async function adminBulkRejectJobs(
  ids: string[],
  reason: string,
): Promise<void> {
  await apiFetch<ApiEnvelope<unknown>>(
    `${API_BASE_URL}/api/v1/jobs/admin/bulk-reject`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, reason }),
    },
  );
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
