import { useEffect, useState } from "react";
import { adminCompanyCounts } from "@/lib/api/companies";
import useSWR from "swr";
import {
  getPublicCompanyJobs,
  type PublicCompanyJob,
  getMyCompanies,
  getCompanyById,
  getCompanyJobs,
  adminListCompanies,
  type Company,
  type CompanyStatus,
} from "@/lib/api";

/** Companies the signed-in user is an active member of. */
export function useMyCompanies() {
  const { data, error, isLoading, mutate } = useSWR(
    "/companies/me",
    getMyCompanies,
  );

  const companies: Company[] = data || [];

  return {
    companies,
    /** A company still awaiting admin review, if any. */
    pendingCompany: companies.find((c) => c.status === "pending") || null,
    approvedCompanies: companies.filter((c) => c.status === "approved"),
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useCompany(
  companyId: string | undefined,
  initialData?: Company | null,
) {
  // Seeded from the server render on the public page: paints from the ISR
  // copy instantly while the default mount revalidate runs in the background
  // — that request is what corrects a suspension within seconds when the ISR
  // page is still inside its revalidate window. Member views pass no seed.
  const { data, error, isLoading, mutate } = useSWR(
    companyId ? `/companies/${companyId}` : null,
    () => getCompanyById(companyId!),
    initialData ? { fallbackData: initialData } : undefined,
  );

  return {
    company: data ?? null,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useCompanyJobs(companyId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    companyId ? `/companies/${companyId}/jobs` : null,
    () => getCompanyJobs(companyId!),
  );

  return {
    jobs: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/** Admin review queue, filtered by review status. */
export function useAdminCompanies(
  status: CompanyStatus | "all",
  page = 1,
  limit = 20,
) {
  // "all" omits the status filter entirely, so the endpoint returns every
  // company regardless of standing.
  const filter = status === "all" ? undefined : status;
  const { data, error, isLoading, mutate } = useSWR(
    `/companies/admin/all?status=${status}&page=${page}&limit=${limit}`,
    () => adminListCompanies({ status: filter, page, limit }),
  );

  return {
    companies: data?.companies || [],
    pagination: data?.pagination,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/** A company's live listings for its public profile (no auth). */
export function usePublicCompanyJobs(
  companyId: string | undefined,
  limit = 20,
  initialData?: Awaited<ReturnType<typeof getPublicCompanyJobs>> | null,
) {
  const [page, setPage] = useState(1);
  // The seed is page 1; later pages fetch normally (the accumulate effect
  // dedups the fallback rows that briefly show while a next page loads).
  const { data, error, isLoading } = useSWR(
    companyId ? `/companies/${companyId}/open-jobs?page=${page}&limit=${limit}` : null,
    () => getPublicCompanyJobs(companyId!, page, limit),
    initialData ? { fallbackData: initialData } : undefined,
  );

  // Listings accumulate as the visitor pages, so "load more" appends rather
  // than replacing the section.
  const [all, setAll] = useState<PublicCompanyJob[]>([]);
  useEffect(() => {
    if (!data?.jobs) return;
    setAll((prev) =>
      page === 1 ? data.jobs : [...prev, ...data.jobs.filter((j) => !prev.some((p) => p._id === j._id))],
    );
  }, [data, page]);

  return {
    jobs: page === 1 && !data ? [] : all,
    total: data?.pagination?.totalItems ?? all.length,
    hasMore: data?.pagination?.hasNext ?? false,
    loadMore: () => setPage((p) => p + 1),
    isLoadingMore: isLoading && page > 1,
    isLoading: isLoading && page === 1,
    isError: !!error,
  };
}

/** Vetting counts for the company review queue's summary cards. */
export function useAdminCompanyCounts() {
  const { data: counts, mutate } = useSWR(
    "admin-company-counts",
    adminCompanyCounts,
  );
  return { counts, mutate };
}
