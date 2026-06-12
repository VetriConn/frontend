import useSWR from "swr";

export type AdminUserStatus = "active" | "suspended";

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  registeredAt: string;
  applications: number;
  status: AdminUserStatus;
}

const MOCK: AdminUser[] = [
  {
    id: "u-1",
    full_name: "James Patterson",
    email: "james.p@email.com",
    registeredAt: "2026-02-10",
    applications: 5,
    status: "active",
  },
  {
    id: "u-2",
    full_name: "Margaret Chen",
    email: "m.chen@email.com",
    registeredAt: "2026-02-08",
    applications: 3,
    status: "active",
  },
  {
    id: "u-3",
    full_name: "Robert Williams",
    email: "r.williams@email.com",
    registeredAt: "2026-01-25",
    applications: 12,
    status: "active",
  },
  {
    id: "u-4",
    full_name: "Linda Thompson",
    email: "l.thompson@email.com",
    registeredAt: "2026-01-20",
    applications: 7,
    status: "active",
  },
  {
    id: "u-5",
    full_name: "David Morrison",
    email: "d.morrison@email.com",
    registeredAt: "2026-02-15",
    applications: 1,
    status: "active",
  },
];

const fetchUsers = async (): Promise<AdminUser[]> => {
  // TODO: GET /api/v1/admin/users
  await new Promise((r) => setTimeout(r, 200));
  return MOCK;
};

export function useAdminUsers() {
  const { data, error, isLoading, mutate } = useSWR<AdminUser[]>(
    "/admin/users",
    fetchUsers,
  );
  return {
    users: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export async function suspendAdminUser(
  id: string,
  reason: string,
): Promise<void> {
  // TODO: POST /api/v1/admin/users/:id/suspend  body: { reason }
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] suspended user", id, "reason:", reason);
}

export async function reinstateAdminUser(id: string): Promise<void> {
  // TODO: POST /api/v1/admin/users/:id/reinstate
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] reinstated user", id);
}
