import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";
import type { NotificationItem } from "@/types/api";

/**
 * How many notifications the panel loads at once.
 *
 * The endpoint is paginated — it used to return every notification a user had
 * ever received, which is unbounded. Requesting the page size explicitly keeps
 * that visible here rather than silently inheriting the server default.
 * unreadCount is counted server-side across all rows, so the badge stays
 * accurate regardless of this number.
 *
 * TODO: the notifications page needs a "load more" for anyone past this.
 */
export const NOTIFICATION_PAGE_SIZE = 50;

export async function getNotifications(): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  const response = await apiFetch<
    ApiEnvelope<{ notifications: NotificationItem[]; unreadCount: number }>
  >(
    `${API_BASE_URL}/api/v1/notifications?limit=${NOTIFICATION_PAGE_SIZE}`,
    { method: "GET" },
  );

  return {
    notifications: response.data?.notifications || [],
    unreadCount: response.data?.unreadCount || 0,
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ notification: NotificationItem }>>(
    `${API_BASE_URL}/api/v1/notifications/${id}/read`,
    { method: "PATCH" },
  );
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch<ApiEnvelope<{}>>(
    `${API_BASE_URL}/api/v1/notifications/read-all`,
    {
      method: "PATCH",
    },
  );
}

export async function deleteNotification(id: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ id: string }>>(
    `${API_BASE_URL}/api/v1/notifications/${id}`,
    { method: "DELETE" },
  );
}

export async function clearNotifications(): Promise<void> {
  await apiFetch<ApiEnvelope<{}>>(`${API_BASE_URL}/api/v1/notifications`, {
    method: "DELETE",
  });
}
