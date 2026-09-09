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
import {
  fieldLabel,
  JOB_TYPE_LABELS,
  INDUSTRY_LABELS,
  WORK_ARRANGEMENT_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  MIN_QUALIFICATION_LABELS,
  SECURITY_CLEARANCE_LABELS,
  WORK_SCHEDULE_LABELS,
  PHYSICAL_DEMAND_LABELS,
  LANGUAGE_LABELS,
  BENEFIT_LABELS,
  SCREENING_QUESTION_TYPE_LABELS,
} from "@/lib/job-fields";
import { formatDate } from "@/lib/date-utils";

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
  /** The Tasks list. Present on the public page and absent here until now. */
  responsibilities: string[];
  requirements: string[];
  /**
   * Everything else the employer submitted, carried through so the reviewer
   * sees at least what a candidate will. The inclusion claims especially:
   * "veteran-friendly" and "accessible" are promises this board makes on an
   * employer's behalf to the people least able to absorb a false one, and
   * they were being approved unseen.
   */
  details: Array<{ label: string; value: string }>;
  /** What applicants are asked before they can apply. */
  screening: Array<{ question: string; type: string; required: boolean }>;
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


/** A row only appears when the employer actually supplied it. */
function postingDetails(j: AdminJobRaw): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  const add = (label: string, value: string | undefined | null) => {
    if (value) rows.push({ label, value });
  };
  const yes = (label: string, value: boolean | undefined) => {
    if (value) rows.push({ label, value: "Yes" });
  };

  add("Category", fieldLabel(INDUSTRY_LABELS, j.job_category));
  add("Work arrangement", fieldLabel(WORK_ARRANGEMENT_LABELS, j.work_arrangement));
  add("Experience level", fieldLabel(EXPERIENCE_LEVEL_LABELS, j.experience_level));
  add("Minimum qualification", fieldLabel(MIN_QUALIFICATION_LABELS, j.min_qualification));
  add("Security clearance", fieldLabel(SECURITY_CLEARANCE_LABELS, j.security_clearance));
  add("Work schedule", fieldLabel(WORK_SCHEDULE_LABELS, j.work_schedule));
  add("Physical demands", fieldLabel(PHYSICAL_DEMAND_LABELS, j.physical_demands));
  add("Skills", j.skills);
  add(
    "Languages",
    (j.languages ?? []).map((l) => fieldLabel(LANGUAGE_LABELS, l) ?? l).join(", "),
  );
  add(
    "Benefits",
    (j.benefits ?? []).map((b) => fieldLabel(BENEFIT_LABELS, b) ?? b).join(", "),
  );
  add("Certifications", (j.certifications ?? []).join(", "));
  add("Openings", j.openings ? String(j.openings) : undefined);
  add("Application deadline", j.application_deadline ? formatDate(j.application_deadline) : undefined);
  add("Expected start", j.start_date ? formatDate(j.start_date) : undefined);

  // Claims, grouped last because they are what a reviewer is really deciding
  // about — the rest is description, these are undertakings.
  yes("Veteran-friendly", j.veteran_friendly);
  yes("Open to returners", j.open_to_returners);
  yes("Accommodations offered", j.accommodations_offered);
  yes("Physically accessible", j.physically_accessible);
  yes("Visa sponsorship", j.visa_sponsorship);
  yes("Driver's licence required", j.requires_drivers_license);

  return rows;
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
    responsibilities: j.responsibilities ?? [],
    requirements: j.qualifications ?? [],
    details: postingDetails(j),
    screening: (j.screening_questions ?? []).map((q) => ({
      question: q.question,
      type: fieldLabel(SCREENING_QUESTION_TYPE_LABELS, q.type) ?? q.type,
      required: q.required ?? false,
    })),
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
  /** False on the External tab, where this queue is not what is on screen. */
  enabled = true,
) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? ["admin-jobs", status, page, limit] : null,
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
