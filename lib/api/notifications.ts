import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";
import type { NotificationItem } from "@/types/api";

export async function getNotifications(): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  const response = await apiFetch<
    ApiEnvelope<{ notifications: NotificationItem[]; unreadCount: number }>
  >(`${API_BASE_URL}/api/v1/notifications`, { method: "GET" });

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
