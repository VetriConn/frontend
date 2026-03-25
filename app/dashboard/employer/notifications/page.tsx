"use client";

import React from "react";
import {
  HiCheckCircle,
  HiOutlineUserPlus,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheck,
  HiOutlineXMark,
} from "react-icons/hi2";
import { useNotifications } from "@/hooks/useNotifications";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotificationType =
  | "application_received"
  | "application_reviewed"
  | "system";

// ─── Icon + color config ─────────────────────────────────────────────────────

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  {
    icon: typeof HiCheckCircle;
    iconColor: string;
    borderColor: string;
  }
> = {
  application_reviewed: {
    icon: HiCheckCircle,
    iconColor: "text-green-500",
    borderColor: "border-l-green-500",
  },
  application_received: {
    icon: HiOutlineUserPlus,
    iconColor: "text-primary",
    borderColor: "border-l-primary",
  },
  system: {
    icon: HiOutlineChatBubbleLeftRight,
    iconColor: "text-gray-500",
    borderColor: "border-l-gray-400",
  },
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString();
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-170 mx-auto px-6 py-8">
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
          {employerNotifications.map((notif) => {
            const config =
              NOTIFICATION_CONFIG[notif.type as NotificationType] ||
              NOTIFICATION_CONFIG.system;
            const Icon = config.icon;

            return (
              <div
                key={notif._id}
                className={`bg-white rounded-lg border border-gray-200 border-l-4 ${config.borderColor} px-5 py-4 flex items-start gap-3 ${
                  !notif.is_read ? "bg-yellow-50/40" : ""
                }`}
                onClick={() => {
                  if (!notif.is_read) {
                    void markRead(notif._id);
                  }
                }}
              >
                {/* Icon */}
                <Icon
                  className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {notif.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {notif.description}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                  {formatTimestamp(notif.createdAt)}
                </span>

                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={(event) => {
                    event.stopPropagation();
                    void removeNotification(notif._id);
                  }}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {!isLoading && employerNotifications.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
              No notifications yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
