import useSWR from "swr";
import {
  adminListNotifications,
  adminMarkNotificationRead,
  adminMarkAllNotificationsRead,
} from "@/lib/api/admin";

export type AdminNotificationType =
  | "job_submitted"
  | "employer_registered"
  | "employer_verified"
  | "user_report"
  | "post_flagged";

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
