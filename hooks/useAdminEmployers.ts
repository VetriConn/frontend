import useSWR from "swr";

export type EmployerStatus = "active" | "suspended" | "pending";

export interface AdminEmployer {
  id: string;
  company_name: string;
  industry: string;
  location: string;
  registeredAt: string; // ISO
  status: EmployerStatus;
}

const MOCK: AdminEmployer[] = [
  {
    id: "e-1",
    company_name: "MapleCorp Logistics",
    industry: "Logistics",
    location: "Toronto, ON",
    registeredAt: "2026-01-15",
    status: "active",
  },
  {
    id: "e-2",
    company_name: "Northern Trust Financial",
    industry: "Financial Services",
    location: "Ottawa, ON",
    registeredAt: "2026-01-10",
    status: "active",
  },
  {
    id: "e-3",
    company_name: "CivicWorks Inc.",
    industry: "Government",
    location: "Vancouver, BC",
    registeredAt: "2025-12-28",
    status: "active",
  },
  {
    id: "e-4",
    company_name: "Guardian Services",
    industry: "Security",
    location: "Calgary, AB",
    registeredAt: "2026-02-01",
    status: "suspended",
  },
  {
    id: "e-5",
    company_name: "HealthFirst Clinic",
    industry: "Healthcare",
    location: "Montreal, QC",
    registeredAt: "2026-02-05",
    status: "active",
  },
];

const fetchEmployers = async (): Promise<AdminEmployer[]> => {
  // TODO: GET /api/v1/admin/employers
  await new Promise((r) => setTimeout(r, 200));
  return MOCK;
};

export function useAdminEmployers() {
  const { data, error, isLoading, mutate } = useSWR<AdminEmployer[]>(
    "/admin/employers",
    fetchEmployers,
  );
  return {
    employers: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export async function suspendAdminEmployer(id: string): Promise<void> {
  // TODO: POST /api/v1/admin/employers/:id/suspend
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] suspended employer", id);
}

export async function reinstateAdminEmployer(id: string): Promise<void> {
  // TODO: POST /api/v1/admin/employers/:id/reinstate
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] reinstated employer", id);
}
