/**
 * Jobs you posted, and the people who applied to them.
 */

import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";
import type {
  ApplicationItem,
  PostedJobDetail,
  PostedJobSummary,
} from "@/types/api";
import type {
  Industry,
  JobType,
  WorkArrangement,
  ExperienceLevel,
  PhysicalDemands,
  WorkSchedule,
  PaymentType,
  MinQualification,
  SecurityClearance,
  Language,
  Benefit,
  Currency,
  ScreeningQuestion,
  JobFaq,
} from "@/lib/job-fields";

/**
 * The POST /jobs body, mirroring the backend's createJobSchema exactly.
 *
 * Vocabulary fields are typed to the shared vocabularies; the empty string is
 * legal on every one of them and means "clear" — the form submits its whole
 * state, so a select put back to "Select …" must be able to unset the column.
 * company_name/company_logo are gone: the server always derives branding, and
 * declaring them here merely hid that they were being stripped.
 */
export interface CreateJobInput {
  role: string;
  description: string;
  // The split description lists — "What You'll Do" and "What We're Looking For".
  responsibilities?: string[];
  qualifications?: string[];
  skills?: string;
  experience_level?: ExperienceLevel | "";
  physical_demands?: PhysicalDemands | "";
  salary_min?: string;
  salary_max?: string;
  payment_type?: PaymentType | "";
  city?: string;
  // Free text: a province/state code where we enumerate regions, or a
  // free-text region elsewhere. Empty clears the column.
  state_province?: string;
  country?: string;
  work_schedule?: WorkSchedule | "";
  work_arrangement?: WorkArrangement | "";
  job_type?: JobType | "";
  job_category?: Industry | "";
  // Phase-1 job-builder fields.
  currency?: Currency | "";
  min_qualification?: MinQualification | "";
  security_clearance?: SecurityClearance | "";
  requires_drivers_license?: boolean;
  visa_sponsorship?: boolean;
  veteran_friendly?: boolean;
  accommodations_offered?: boolean;
  physically_accessible?: boolean;
  open_to_returners?: boolean;
  languages?: Language[];
  benefits?: Benefit[];
  certifications?: string[];
  openings?: number;
  application_deadline?: string;
  start_date?: string;
  // Phase-2 job-builder fields.
  screening_questions?: ScreeningQuestion[];
  faqs?: JobFaq[];
  hiring_stages?: string[];
  status?: "draft" | "published";
  /**
   * Post under a vetted Company Page rather than the employer's own profile.
   * The server verifies active owner/admin membership of an approved company
   * and derives company branding from it. Omit to post as an individual.
   */
  company_id?: string;
}

export async function getMyPostings(): Promise<PostedJobSummary[]> {
  const response = await apiFetch<ApiEnvelope<{ jobs: PostedJobSummary[] }>>(
    `${API_BASE_URL}/api/v1/jobs/mine`,
    { method: "GET" },
  );

  return response.data?.jobs || [];
}

export async function getReceivedApplications(): Promise<ApplicationItem[]> {
  const response = await apiFetch<
    ApiEnvelope<{ applications: ApplicationItem[] }>
  >(`${API_BASE_URL}/api/v1/jobs/mine/applications`, { method: "GET" });

  return response.data?.applications || [];
}

/** A candidate's professional profile, as surfaced to the reviewing employer. */
export interface CandidateProfile {
  bio?: string;
  job_title?: string;
  industry?: string;
  years_of_experience?: string;
  work_experience?: {
    company?: string;
    position?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }[];
  education?: {
    institution?: string;
    degree?: string;
    field_of_study?: string;
    start_year?: string;
    end_year?: string;
  }[];
  certifications?: { name?: string; issuing_organization?: string }[];
  skills?: string[];
  city?: string;
  state_province?: string;
  country?: string;
  socials?: { linkedin?: string; twitter?: string; github?: string };
}

export interface ReceivedApplicationDetail {
  application: ApplicationItem;
  candidate: CandidateProfile | null;
}

export async function getReceivedApplication(
  applicationId: string,
): Promise<ReceivedApplicationDetail> {
  const response = await apiFetch<ApiEnvelope<ReceivedApplicationDetail>>(
    `${API_BASE_URL}/api/v1/jobs/mine/applications/${applicationId}`,
    { method: "GET" },
  );
  if (!response.data?.application) {
    throw new Error("Application not returned by server");
  }
  return response.data;
}

export async function getMyPosting(
  jobId: string,
): Promise<PostedJobDetail> {
  const response = await apiFetch<ApiEnvelope<{ job: PostedJobDetail }>>(
    `${API_BASE_URL}/api/v1/jobs/mine/${jobId}`,
    {
      method: "GET",
    },
  );

  if (!response.data?.job) {
    throw new Error("Job not returned by server");
  }

  return response.data.job;
}

export async function createPosting(
  payload: CreateJobInput,
): Promise<PostedJobSummary> {
  const response = await apiFetch<ApiEnvelope<{ job: PostedJobSummary }>>(
    `${API_BASE_URL}/api/v1/jobs`,
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

export async function updatePosting(
  jobId: string,
  payload: Partial<CreateJobInput>,
): Promise<PostedJobSummary> {
  const response = await apiFetch<ApiEnvelope<{ job: PostedJobSummary }>>(
    `${API_BASE_URL}/api/v1/jobs/${jobId}`,
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

export async function deletePosting(jobId: string): Promise<void> {
  await apiFetch<ApiEnvelope<null>>(
    `${API_BASE_URL}/api/v1/jobs/${jobId}`,
    {
      method: "DELETE",
    },
  );
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "pending" | "reviewed" | "accepted" | "rejected",
): Promise<ApplicationItem> {
  const response = await apiFetch<
    ApiEnvelope<{ application: ApplicationItem }>
  >(`${API_BASE_URL}/api/v1/jobs/applications/${applicationId}/status`, {
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


