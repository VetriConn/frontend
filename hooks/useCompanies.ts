import useSWR from "swr";
import {
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

export function useCompany(companyId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    companyId ? `/companies/${companyId}` : null,
    () => getCompanyById(companyId!),
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
export function useAdminCompanies(status: CompanyStatus) {
  const { data, error, isLoading, mutate } = useSWR(
    `/companies/admin/all?status=${status}`,
    () => adminListCompanies({ status }),
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
