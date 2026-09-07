import useSWR from "swr";
import {
  adminListMembers,
  adminGetMember,
  adminSuspendMember,
  adminReinstateMember,
  type AdminMember,
  adminMemberCounts,
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

export const ADMIN_USERS_PAGE_SIZE = 20;

export function useAdminUsers(page = 1) {
  // Server pagination: the backend already skips/limits, and the old
  // limit:100 fetch both rendered a 100-row DOM and silently capped the list.
  const { data, error, isLoading, mutate } = useSWR(
    ["admin-members", page],
    async () => {
      const res = await adminListMembers({
        page,
        limit: ADMIN_USERS_PAGE_SIZE,
      });
      return {
        users: res.members.map(toAdminUser),
        total: res.total,
        totalPages: Math.max(1, Math.ceil(res.total / ADMIN_USERS_PAGE_SIZE)),
      };
    },
    // Page flips keep the previous rows on screen instead of collapsing the
    // table to a skeleton (matches useJobs/useUserProfile).
    { keepPreviousData: true },
  );
  return {
    users: data?.users ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    isError: !!error,
    mutate,
  };
}

/**
 * One member by id, for the detail page. It used to scan the list fetch for
 * the id - which only ever held the first page, so any member beyond it
 * rendered as "not found".
 */
export function useAdminMember(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ["admin-member", userId] : null,
    async () => {
      const member = await adminGetMember(userId!);
      return member ? toAdminUser(member) : null;
    },
  );
  return {
    user: data ?? null,
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

/** Member counts for the users page's summary cards. */
export function useAdminMemberCounts() {
  const { data: counts, mutate } = useSWR(
    "admin-member-counts",
    adminMemberCounts,
  );
  return { counts, mutate };
}
