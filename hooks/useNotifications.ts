import useSWR from "swr";
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api";
import type { NotificationItem } from "@/types/api";

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
}

const EMPTY_STATE: NotificationsState = {
  notifications: [],
  unreadCount: 0,
};

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<NotificationsState>(
    "/notifications",
    getNotifications,
  );

  const state = data || EMPTY_STATE;

  const markRead = async (id: string) => {
    await mutate(
      async (current) => {
        const snapshot = current || EMPTY_STATE;
        await markNotificationRead(id);
        return {
          notifications: snapshot.notifications.map((n) =>
            n._id === id ? { ...n, is_read: true } : n,
          ),
          unreadCount: Math.max(
            0,
            snapshot.notifications.filter((n) => !n.is_read && n._id !== id)
              .length,
          ),
        };
      },
      {
        optimisticData: (current) => {
          const snapshot = current || EMPTY_STATE;
          return {
            notifications: snapshot.notifications.map((n) =>
              n._id === id ? { ...n, is_read: true } : n,
            ),
            unreadCount: Math.max(0, snapshot.unreadCount - 1),
          };
        },
        rollbackOnError: true,
        revalidate: false,
      },
    );
  };

  const markAllRead = async () => {
    await mutate(
      async (current) => {
        const snapshot = current || EMPTY_STATE;
        await markAllNotificationsRead();
        return {
          notifications: snapshot.notifications.map((n) => ({
            ...n,
            is_read: true,
          })),
          unreadCount: 0,
        };
      },
      {
        optimisticData: (current) => {
          const snapshot = current || EMPTY_STATE;
          return {
            notifications: snapshot.notifications.map((n) => ({
              ...n,
              is_read: true,
            })),
            unreadCount: 0,
          };
        },
        rollbackOnError: true,
        revalidate: false,
      },
    );
  };

  const removeNotification = async (id: string) => {
    await mutate(
      async (current) => {
        const snapshot = current || EMPTY_STATE;
        await deleteNotification(id);
        const filtered = snapshot.notifications.filter((n) => n._id !== id);
        return {
          notifications: filtered,
          unreadCount: filtered.filter((n) => !n.is_read).length,
        };
      },
      {
        optimisticData: (current) => {
          const snapshot = current || EMPTY_STATE;
          const filtered = snapshot.notifications.filter((n) => n._id !== id);
          return {
            notifications: filtered,
            unreadCount: filtered.filter((n) => !n.is_read).length,
          };
        },
        rollbackOnError: true,
        revalidate: false,
      },
    );
  };

  const clearAll = async () => {
    await mutate(
      async () => {
        await clearNotifications();
        return EMPTY_STATE;
      },
      {
        optimisticData: EMPTY_STATE,
        rollbackOnError: true,
        revalidate: false,
      },
    );
  };

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading,
    isError: !!error,
    mutate,
    markRead,
    markAllRead,
    removeNotification,
    clearAll,
  };
}
