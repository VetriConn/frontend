import useSWR from "swr";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdminJobStatus = "pending" | "approved" | "rejected";

export interface AdminJob {
  id: string;
  role: string;
  company_name: string;
  company_logo?: string;
  location: string;
  employment_type: string; // "Part-Time" | "Full-Time" | "Contract" ...
  salary_range?: string;
  description: string;
  requirements: string[];
  submittedAt: string; // ISO
  /** Set when status === "approved". */
  approvedAt?: string;
  /** Set when status === "rejected". */
  rejectedAt?: string;
  /** Application count (approved listings only). */
  applications?: number;
  status: AdminJobStatus;
  rejection_reason?: string;
  employer: {
    id: string;
    verified: boolean;
  };
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const PENDING: AdminJob[] = [
  {
    id: "j-1001",
    role: "Part-Time Warehouse Associate",
    company_name: "MapleCorp Logistics",
    location: "Toronto, ON",
    employment_type: "Part-Time",
    salary_range: "$18-$22/hr",
    description:
      "We are looking for a reliable warehouse associate to help with inventory management, packaging, and shipping. Ideal for someone who enjoys physical work and has attention to detail. Flexible morning shifts available.",
    requirements: [
      "Must be able to lift up to 30 lbs",
      "Basic computer skills",
      "Reliable transportation",
      "Previous warehouse experience preferred but not required",
    ],
    submittedAt: "2026-02-24",
    status: "pending",
    employer: { id: "e-1", verified: true },
  },
  {
    id: "j-1002",
    role: "Customer Service Representative",
    company_name: "Northern Trust",
    location: "Ottawa, ON",
    employment_type: "Full-Time",
    salary_range: "$22-$26/hr",
    description:
      "Front-line customer service role handling inbound calls, account inquiries, and routine support. Veteran-friendly culture with structured onboarding and ongoing coaching.",
    requirements: [
      "Strong written and verbal communication",
      "Comfortable with phone-based work",
      "High school diploma or equivalent",
    ],
    submittedAt: "2026-02-23",
    status: "pending",
    employer: { id: "e-2", verified: true },
  },
  {
    id: "j-1003",
    role: "Administrative Assistant",
    company_name: "CivicWorks",
    location: "Hamilton, ON",
    employment_type: "Part-Time",
    salary_range: "$20/hr",
    description:
      "Administrative support for a small civic non-profit. Calendar management, light bookkeeping, and document preparation. Hybrid schedule.",
    requirements: [
      "Proficiency with Microsoft Office",
      "Excellent organizational skills",
      "Discretion with sensitive information",
    ],
    submittedAt: "2026-02-22",
    status: "pending",
    employer: { id: "e-3", verified: false },
  },
];

const APPROVED: AdminJob[] = [
  {
    id: "j-0901",
    role: "Customer Service Rep",
    company_name: "Northern Trust",
    location: "Ottawa, ON",
    employment_type: "Full-Time",
    salary_range: "$22-$26/hr",
    description: "Front-line customer service role.",
    requirements: ["Strong communication"],
    submittedAt: "2026-02-21",
    approvedAt: "2026-02-23",
    applications: 14,
    status: "approved",
    employer: { id: "e-2", verified: true },
  },
  {
    id: "j-0902",
    role: "Library Aide",
    company_name: "City of Ottawa",
    location: "Ottawa, ON",
    employment_type: "Part-Time",
    salary_range: "$19/hr",
    description: "Assist patrons and shelve materials.",
    requirements: ["Comfortable on feet"],
    submittedAt: "2026-02-20",
    approvedAt: "2026-02-21",
    applications: 8,
    status: "approved",
    employer: { id: "e-4", verified: true },
  },
  {
    id: "j-0903",
    role: "Delivery Driver",
    company_name: "SwiftShip",
    location: "Toronto, ON",
    employment_type: "Full-Time",
    salary_range: "$24/hr",
    description: "Local route delivery.",
    requirements: ["Class G license"],
    submittedAt: "2026-02-19",
    approvedAt: "2026-02-20",
    applications: 22,
    status: "approved",
    employer: { id: "e-6", verified: true },
  },
  {
    id: "j-0904",
    role: "Receptionist",
    company_name: "HealthFirst Clinic",
    location: "Montreal, QC",
    employment_type: "Part-Time",
    salary_range: "$20/hr",
    description: "Greet patients, manage scheduling.",
    requirements: ["Bilingual English/French"],
    submittedAt: "2026-02-18",
    approvedAt: "2026-02-19",
    applications: 6,
    status: "approved",
    employer: { id: "e-5", verified: true },
  },
  {
    id: "j-0905",
    role: "Groundskeeper",
    company_name: "Evergreen Parks",
    location: "Calgary, AB",
    employment_type: "Seasonal",
    salary_range: "$21/hr",
    description: "Park maintenance and landscaping.",
    requirements: ["Outdoor work"],
    submittedAt: "2026-02-17",
    approvedAt: "2026-02-18",
    applications: 11,
    status: "approved",
    employer: { id: "e-7", verified: true },
  },
];

const REJECTED: AdminJob[] = [
  {
    id: "j-0801",
    role: "Security Guard",
    company_name: "Guardian Services",
    location: "Mississauga, ON",
    employment_type: "Contract",
    description: "Overnight site security with rotating shifts.",
    requirements: ["Valid security license"],
    submittedAt: "2026-02-21",
    rejectedAt: "2026-02-22",
    status: "rejected",
    rejection_reason: "Missing salary information",
    employer: { id: "e-5", verified: false },
  },
  {
    id: "j-0802",
    role: "Data Entry Clerk",
    company_name: "InfoCorp",
    location: "Remote",
    employment_type: "Part-Time",
    description: "Routine data entry tasks.",
    requirements: ["Typing 40 wpm"],
    submittedAt: "2026-02-19",
    rejectedAt: "2026-02-20",
    status: "rejected",
    rejection_reason: "Vague job description",
    employer: { id: "e-8", verified: false },
  },
  {
    id: "j-0803",
    role: "Cleaning Staff",
    company_name: "Unknown LLC",
    location: "Toronto, ON",
    employment_type: "Full-Time",
    description: "Office cleaning rotation.",
    requirements: ["Reliable transportation"],
    submittedAt: "2026-02-17",
    rejectedAt: "2026-02-18",
    status: "rejected",
    rejection_reason: "Employer not verified",
    employer: { id: "e-9", verified: false },
  },
];

const fetchAdminJobs = async (status: AdminJobStatus): Promise<AdminJob[]> => {
  // TODO: wire to real backend
  // return apiFetch<AdminJob[]>(
  //   `${API_BASE_URL}/api/v1/admin/jobs?status=${status}`
  // );
  await new Promise((r) => setTimeout(r, 200));
  if (status === "pending") return PENDING;
  if (status === "approved") return APPROVED;
  return REJECTED;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminJobQueue(status: AdminJobStatus) {
  const { data, error, isLoading, mutate } = useSWR<AdminJob[]>(
    `/admin/jobs?status=${status}`,
    () => fetchAdminJobs(status),
  );

  return {
    jobs: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

const fetchAdminJobById = async (id: string): Promise<AdminJob | null> => {
  // TODO: GET /api/v1/admin/jobs/:id
  await new Promise((r) => setTimeout(r, 200));
  const all = [...PENDING, ...APPROVED, ...REJECTED];
  return all.find((j) => j.id === id) ?? null;
};

export function useAdminJob(id: string) {
  const { data, error, isLoading, mutate } = useSWR<AdminJob | null>(
    id ? `/admin/jobs/${id}` : null,
    () => fetchAdminJobById(id),
  );
  return {
    job: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}

// ─── Mock mutation handlers (replace with real API) ──────────────────────────

export async function approveAdminJob(id: string): Promise<void> {
  // TODO: POST /api/v1/admin/jobs/:id/approve
  await new Promise((r) => setTimeout(r, 350));
  console.log("[mock] approved job", id);
}

export async function rejectAdminJob(
  id: string,
  reason: string,
): Promise<void> {
  // TODO: POST /api/v1/admin/jobs/:id/reject  body: { reason }
  await new Promise((r) => setTimeout(r, 350));
  console.log("[mock] rejected job", id, "reason:", reason);
}

export async function unpublishAdminJob(
  id: string,
  reason: string,
): Promise<void> {
  // TODO: POST /api/v1/admin/jobs/:id/unpublish  body: { reason }
  await new Promise((r) => setTimeout(r, 350));
  console.log("[mock] unpublished job", id, "reason:", reason);
}
