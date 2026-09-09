import useSWR from "swr";
import {
  adminListJobs,
  adminApproveJob,
  adminRejectJob,
  getJobById,
  type AdminJobRaw,
  adminJobCounts,
} from "@/lib/api/jobs";
import { formatJobSalary } from "@/lib/job-display";
import { fieldLabel, JOB_TYPE_LABELS } from "@/lib/job-fields";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdminJobStatus = "pending" | "approved" | "rejected";

export interface AdminJob {
  id: string;
  role: string;
  company_name: string;
  company_logo?: string;
  location: string;
  employment_type: string;
  /** Pay, already formatted for display — not the removed salary_range column. */
  pay?: string;
  description: string;
  requirements: string[];
  submittedAt: string; // ISO
  approvedAt?: string;
  rejectedAt?: string;
  applications?: number;
  status: AdminJobStatus;
  rejection_reason?: string;
  /** __v the row was loaded at; decisions are preconditioned on it. */
  version?: number;
  /** Keyword scam signals from the backend detector — worth a close look. */
  scam_flags?: string[];
  employer: {
    id: string;
    verified: boolean;
  };
}

// ─── Mapping (raw lean job → view model) ─────────────────────────────────────

function deriveStatus(j: AdminJobRaw): AdminJobStatus {
  // moderation_status is the single verdict field (schema default "pending",
  // no pre-default documents exist); the old is_approved/rejected_at
  // fallback chain disagreed with the employer surface and is gone with it.
  return j.moderation_status ?? "pending";
}

export function toAdminJob(j: AdminJobRaw): AdminJob {
  return {
    id: j._id,
    role: j.role,
    company_name: j.company_name,
    company_logo: j.company_logo,
    location: j.location || "Canada",
    employment_type:
      fieldLabel(JOB_TYPE_LABELS, j.job_type) ?? (j.job_type || "-"),
    // No cast needed now that pay is one object with one shape everywhere —
    // this used to assemble four loose fields and assert the result matched.
    pay: formatJobSalary({ compensation: j.compensation }, "full") ?? undefined,
    description: j.description || "",
    requirements: j.qualifications ?? [],
    submittedAt: j.createdAt || "",
    approvedAt: j.approved_at,
    rejectedAt: j.rejected_at,
    applications: j.application_count,
    status: deriveStatus(j),
    rejection_reason: j.rejection_reason,
    version: j.__v,
    scam_flags: j.scam_flags,
    // No per-poster verification flag on the job; a company posting is the
    // closest "vetted" signal we have here.
    employer: {
      id: j.poster_id || j.company_id || "",
      verified: j.posted_as === "company",
    },
  };
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAdminJobQueue(
  status: AdminJobStatus | "all",
  page = 1,
  limit = 20,
) {
  const { data, error, isLoading, mutate } = useSWR(
    ["admin-jobs", status, page, limit],
    async () => {
      // "all" omits the approval filter, returning every moderation state.
      const res = await adminListJobs(
        status === "all" ? undefined : status,
        page,
        limit,
      );
      return { jobs: res.jobs.map(toAdminJob), pagination: res.pagination };
    },
  );

  return {
    jobs: data?.jobs ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useAdminJob(id: string) {
  const { data, error, isLoading, mutate } = useSWR<AdminJob | null>(
    id ? ["admin-job", id] : null,
    async () => toAdminJob((await getJobById(id)) as unknown as AdminJobRaw),
  );
  return {
    job: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function approveAdminJob(
  id: string,
  expectedVersion?: number,
): Promise<void> {
  await adminApproveJob(id, expectedVersion);
}

export async function rejectAdminJob(
  id: string,
  reason: string,
  expectedVersion?: number,
): Promise<void> {
  await adminRejectJob(id, reason, expectedVersion);
}

/**
 * Take a live (approved) listing down. The backend expresses this as a reject
 * with a reason — it moves the job out of the published set and back into the
 * moderated states.
 */
export async function unpublishAdminJob(
  id: string,
  reason: string,
  expectedVersion?: number,
): Promise<void> {
  await adminRejectJob(id, reason, expectedVersion);
}

/** Moderation counts for the jobs page's summary cards, one shared fetch. */
export function useAdminJobCounts() {
  const { data: counts, mutate } = useSWR("admin-job-counts", adminJobCounts);
  return { counts, mutate };
}
