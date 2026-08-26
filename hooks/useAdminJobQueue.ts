import useSWR from "swr";
import {
  adminListJobs,
  adminApproveJob,
  adminRejectJob,
  getJobById,
  type AdminJobRaw,
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
  salary_range?: string;
  description: string;
  requirements: string[];
  submittedAt: string; // ISO
  approvedAt?: string;
  rejectedAt?: string;
  applications?: number;
  status: AdminJobStatus;
  rejection_reason?: string;
  /** Keyword scam signals from the backend detector — worth a close look. */
  scam_flags?: string[];
  employer: {
    id: string;
    verified: boolean;
  };
}

// ─── Mapping (raw lean job → view model) ─────────────────────────────────────

function deriveStatus(j: AdminJobRaw): AdminJobStatus {
  if (j.moderation_status) return j.moderation_status;
  if (j.is_approved) return "approved";
  if (j.rejected_at) return "rejected";
  return "pending";
}

export function toAdminJob(j: AdminJobRaw): AdminJob {
  return {
    id: j._id,
    role: j.role,
    company_name: j.company_name,
    company_logo: j.company_logo,
    location: j.location || "Canada",
    employment_type:
      fieldLabel(JOB_TYPE_LABELS, j.job_type) ?? (j.job_type || "—"),
    salary_range:
      formatJobSalary(
        {
          salary: j.salary,
          salary_range: j.salary_range,
          salary_text: j.salary_text,
          payment_type: j.payment_type,
        } as Parameters<typeof formatJobSalary>[0],
        "full",
      ) ?? undefined,
    description: j.full_description || j.description || "",
    requirements: j.qualifications ?? [],
    submittedAt: j.createdAt || "",
    approvedAt: j.approved_at,
    rejectedAt: j.rejected_at,
    applications: j.application_count,
    status: deriveStatus(j),
    rejection_reason: j.rejection_reason,
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

export async function approveAdminJob(id: string): Promise<void> {
  await adminApproveJob(id);
}

export async function rejectAdminJob(
  id: string,
  reason: string,
): Promise<void> {
  await adminRejectJob(id, reason);
}

/**
 * Take a live (approved) listing down. The backend expresses this as a reject
 * with a reason — it moves the job out of the published set and back into the
 * moderated states.
 */
export async function unpublishAdminJob(
  id: string,
  reason: string,
): Promise<void> {
  await adminRejectJob(id, reason);
}
