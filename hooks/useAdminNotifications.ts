import useSWR from "swr";
import {
  adminListNotifications,
  adminMarkNotificationRead,
  adminMarkAllNotificationsRead,
  type AdminNotificationType,
} from "@/lib/api/admin";

// One definition, owned by the API layer - this file's local copy had
// drifted ("employer_verified" was vocabulary nothing sends).
export type { AdminNotificationType } from "@/lib/api/admin";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  message: string;
  createdAt: string; // ISO
  read: boolean;
}

export function useAdminNotifications() {
  const { data, error, isLoading, mutate } = useSWR<AdminNotification[]>(
    "/admin/notifications",
    async () => await adminListNotifications(),
  );
  return {
    notifications: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

/** The item id is the notification's stable key (e.g. "job:<id>"). */
export async function markAdminNotificationRead(id: string): Promise<void> {
  await adminMarkNotificationRead(id);
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  await adminMarkAllNotificationsRead();
}
