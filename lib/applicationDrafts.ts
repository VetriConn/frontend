/**
 * Application Drafts — Async API layer
 *
 * Previously localStorage-only; now backed by the
 * /api/v1/application-drafts endpoints.
 */

import {
  getDrafts,
  getDraft,
  upsertDraft,
  deleteDraft,
  type ApplicationDraftResponse,
} from "@/lib/api/jobseeker";

export interface ApplicationDraftRecord {
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  relevantExperience?: string;
  selectedSkills?: string[];
  earliestStartDate?: string;
  preferredSchedule?: string;
  workLocationPreference?: string;
  additionalInfo?: string;
  savedAt?: string;
}

/**
 * Map backend response (snake_case) to frontend shape (camelCase).
 */
function mapFromBackend(raw: ApplicationDraftResponse): ApplicationDraftRecord {
  return {
    jobId: raw.job_id,
    jobTitle: raw.job_title || undefined,
    companyName: raw.company_name || undefined,
    location: raw.location || undefined,
    relevantExperience: raw.relevant_experience || undefined,
    selectedSkills: raw.selected_skills?.length ? raw.selected_skills : undefined,
    earliestStartDate: raw.earliest_start_date || undefined,
    preferredSchedule: raw.preferred_schedule || undefined,
    workLocationPreference: raw.work_location_preference || undefined,
    additionalInfo: raw.additional_info || undefined,
    savedAt: raw.updatedAt || undefined,
  };
}

/**
 * Fetch a single draft for a given job.
 * Returns null if no draft exists.
 */
export async function getApplicationDraft(
  jobId: string,
): Promise<ApplicationDraftRecord | null> {
  const raw = await getDraft(jobId);
  if (!raw) return null;
  return mapFromBackend(raw);
}

/**
 * Check whether a draft exists for a given job.
 * Uses a lightweight GET — returns boolean.
 */
export async function hasApplicationDraft(jobId: string): Promise<boolean> {
  const raw = await getDraft(jobId);
  return raw !== null;
}

/**
 * Save (create or update) a draft for a given job.
 */
export async function saveApplicationDraft(
  jobId: string,
  draft: ApplicationDraftRecord,
): Promise<void> {
  await upsertDraft(jobId, {
    job_title: draft.jobTitle,
    company_name: draft.companyName,
    location: draft.location,
    relevant_experience: draft.relevantExperience,
    selected_skills: draft.selectedSkills,
    earliest_start_date: draft.earliestStartDate,
    preferred_schedule: draft.preferredSchedule,
    work_location_preference: draft.workLocationPreference,
    additional_info: draft.additionalInfo,
  });
}

/**
 * Delete a draft for a given job.
 */
export async function removeApplicationDraft(jobId: string): Promise<void> {
  try {
    await deleteDraft(jobId);
  } catch {
    // Silently ignore 404 — draft may not exist
  }
}

/**
 * List all application drafts for the current user, sorted newest first.
 */
export async function listApplicationDrafts(): Promise<ApplicationDraftRecord[]> {
  const rawList = await getDrafts();
  return rawList.map(mapFromBackend);
}
