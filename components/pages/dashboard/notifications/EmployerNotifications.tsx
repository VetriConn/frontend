"use client";

import React from "react";
import { HiOutlineCheck } from "react-icons/hi2";
import { useNotifications } from "@/hooks/useNotifications";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { NotificationItem } from "@/components/dashboard/notifications/NotificationItem";
import { NotificationsEmptyState } from "@/components/dashboard/notifications/NotificationsEmptyState";

export default function EmployerNotifications() {
  const {
    notifications,
    isLoading,
    markRead,
    removeNotification,
    markAllRead,
  } = useNotifications();

  const employerNotifications = notifications.filter((notification) =>
    ["application_received", "application_reviewed", "system"].includes(
      notification.type,
    ),
  );

  return (
    <RoleGuard allowedRoles={["employer"]}>
      <div className="max-w-170 mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

        {employerNotifications.length > 0 && (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => markAllRead()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <HiOutlineCheck className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        )}

        {isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 text-sm text-gray-500 mb-3">
            Loading notifications...
          </div>
        )}

        <div className="space-y-2">
          {employerNotifications.map((notif) => (
            <NotificationItem
              key={notif._id}
              notification={notif}
              onMarkAsRead={(id) => void markRead(id)}
              onDelete={(id) => void removeNotification(id)}
            />
          ))}

          {!isLoading && employerNotifications.length === 0 && (
            <NotificationsEmptyState />
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
