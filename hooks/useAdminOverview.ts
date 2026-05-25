import useSWR from "swr";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminStats {
  jobsPending: number;
  activeJobs: number;
  employers: number;
  users: number;
}

export interface AdminActivityItem {
  id: string;
  title: string;
  company: string;
  status: "pending" | "approved" | "rejected";
  date: string; // ISO
}

export interface AdminOverview {
  stats: AdminStats;
  recentActivity: AdminActivityItem[];
}

// ─── Mock data (replace with real API) ───────────────────────────────────────
//
// When the backend exposes GET /api/v1/admin/overview, swap the fetcher below
// for `apiFetch`. The shape is intentionally aligned with what the endpoint
// should return so the swap is a one-liner.

const MOCK_OVERVIEW: AdminOverview = {
  stats: {
    jobsPending: 12,
    activeJobs: 86,
    employers: 34,
    users: 215,
  },
  recentActivity: [
    {
      id: "1",
      title: "Part-Time Warehouse Associate",
      company: "MapleCorp",
      status: "pending",
      date: "2026-02-24",
    },
    {
      id: "2",
      title: "Customer Service Rep",
      company: "Northern Trust",
      status: "approved",
      date: "2026-02-23",
    },
    {
      id: "3",
      title: "Security Guard",
      company: "Guardian Services",
      status: "rejected",
      date: "2026-02-22",
    },
    {
      id: "4",
      title: "Administrative Assistant",
      company: "CivicWorks",
      status: "pending",
      date: "2026-02-22",
    },
    {
      id: "5",
      title: "Library Aide",
      company: "City of Ottawa",
      status: "approved",
      date: "2026-02-21",
    },
  ],
};

const fetchAdminOverview = async (): Promise<AdminOverview> => {
  // TODO: wire to backend
  // return apiFetch<AdminOverview>(`${API_BASE_URL}/api/v1/admin/overview`);
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_OVERVIEW;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminOverview() {
  const { data, error, isLoading, mutate } = useSWR<AdminOverview>(
    "/admin/overview",
    fetchAdminOverview,
  );

  return {
    data: data ?? { stats: { jobsPending: 0, activeJobs: 0, employers: 0, users: 0 }, recentActivity: [] },
    isLoading,
    isError: !!error,
    mutate,
  };
}
