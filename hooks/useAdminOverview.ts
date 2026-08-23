import useSWR from "swr";
import { adminGetOverview } from "@/lib/api/admin";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminStats {
  jobsPending: number;
  activeJobs: number;
  companies: number;
  users: number;
  /** Extra counters the dashboard can surface as secondary stats/badges. */
  companiesPending: number;
  openReports: number;
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

const EMPTY: AdminOverview = {
  stats: {
    jobsPending: 0,
    activeJobs: 0,
    companies: 0,
    users: 0,
    companiesPending: 0,
    openReports: 0,
  },
  recentActivity: [],
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdminOverview() {
  const { data, error, isLoading, mutate } = useSWR<AdminOverview>(
    "/admin/overview",
    async () => {
      const res = await adminGetOverview();
      return {
        stats: {
          jobsPending: res.stats.jobsPending,
          activeJobs: res.stats.activeJobs,
          companies: res.stats.companies,
          users: res.stats.users,
          companiesPending: res.stats.companiesPending,
          openReports: res.stats.openReports,
        },
        recentActivity: res.recentActivity,
      };
    },
  );

  return {
    data: data ?? EMPTY,
    isLoading,
    isError: !!error,
    mutate,
  };
}
