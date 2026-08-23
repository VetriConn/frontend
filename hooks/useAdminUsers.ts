import useSWR from "swr";
import {
  adminListMembers,
  adminSuspendMember,
  adminReinstateMember,
  type AdminMember,
} from "@/lib/api/admin";

export type AdminUserStatus = "active" | "suspended";

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  registeredAt: string;
  applications: number;
  status: AdminUserStatus;
}

function toAdminUser(m: AdminMember): AdminUser {
  return {
    id: m._id,
    full_name: m.full_name,
    email: m.email,
    registeredAt: m.createdAt ?? "",
    applications: m.application_count ?? 0,
    status: m.status === "suspended" ? "suspended" : "active",
  };
}

export function useAdminUsers() {
  const { data, error, isLoading, mutate } = useSWR<AdminUser[]>(
    ["admin-members"],
    async () => (await adminListMembers({ limit: 100 })).members.map(toAdminUser),
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
  await adminSuspendMember(id, reason);
}

export async function reinstateAdminUser(id: string): Promise<void> {
  await adminReinstateMember(id);
}
