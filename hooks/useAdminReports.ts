import useSWR from "swr";
import {
  adminListReports,
  adminReportCounts,
  adminResolveReport,
  type AdminReport,
  type ReportStatus,
  type ReportTargetType,
} from "@/lib/api/admin";

export type { AdminReport, ReportStatus, ReportTargetType };

export function useAdminReports(
  status: ReportStatus,
  type?: ReportTargetType,
  page = 1,
) {
  // page/limit used to be dropped here: the queue fetched page 1 of 10 and
  // rows past ten were unreachable while the counters showed true totals.
  const { data, error, isLoading, mutate } = useSWR(
    ["admin-reports", status, type ?? "all", page],
    async () => adminListReports({ status, type, page, limit: 20 }),
  );
  return {
    reports: data?.reports ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: !!error,
    mutate,
  };
}

/** Open-report counts by target type, for the queue's badges. */
export function useReportCounts() {
  const { data, mutate } = useSWR(
    "admin-report-counts",
    async () => await adminReportCounts(),
  );
  return {
    counts: data?.counts ?? {},
    total: data?.total ?? 0,
    mutate,
  };
}

export async function resolveAdminReport(
  id: string,
  status: "resolved" | "dismissed",
): Promise<void> {
  await adminResolveReport(id, status);
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const TARGET_TYPE_LABEL: Record<ReportTargetType, string> = {
  job: "Job",
  company: "Company",
  company_member: "Company member",
};

export const REASON_LABEL: Record<string, string> = {
  scam: "Scam",
  inappropriate: "Inappropriate",
  spam: "Spam",
  abuse: "Abuse",
  other: "Other",
};
