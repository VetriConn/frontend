"use client";

import React, { useMemo, useState } from "react";
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineEye,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserCircle,
  HiOutlineDocumentCheck,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationItem } from "@/types/api";

// ─── Types ──────────────────────────────────────────────────────────────────────

type NotificationType =
  | "application_sent"
  | "application_received"
  | "job_match"
  | "profile_viewed"
  | "new_reply"
  | "employer_message"
  | "profile_reminder"
  | "application_reviewed"
  | "system";

// ─── Notification Config ────────────────────────────────────────────────────────

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; dotColor: string; bgColor: string }
> = {
  application_sent: {
    icon: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />,
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
  },
  job_match: {
    icon: <HiOutlineBriefcase className="w-5 h-5 text-blue-600" />,
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-50",
  },
  profile_viewed: {
    icon: <HiOutlineEye className="w-5 h-5 text-amber-600" />,
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-50",
  },
  new_reply: {
    icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-purple-600" />,
    dotColor: "bg-purple-500",
    bgColor: "bg-purple-50",
  },
  employer_message: {
    icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-primary" />,
    dotColor: "bg-primary",
    bgColor: "bg-red-50",
  },
  profile_reminder: {
    icon: <HiOutlineUserCircle className="w-5 h-5 text-gray-600" />,
    dotColor: "bg-gray-400",
    bgColor: "bg-gray-100",
  },
  application_reviewed: {
    icon: <HiOutlineDocumentCheck className="w-5 h-5 text-emerald-600" />,
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
  },
  application_received: {
    icon: <HiOutlineBriefcase className="w-5 h-5 text-blue-600" />,
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-50",
  },
  system: {
    icon: <HiOutlineInformationCircle className="w-5 h-5 text-gray-600" />,
    dotColor: "bg-gray-500",
    bgColor: "bg-gray-100",
  },
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

// ─── Empty State Component ──────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Empty card header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">No unread notifications</p>
      </div>

      {/* Empty illustration */}
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <HiOutlineBell className="w-7 h-7 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          You&apos;re all caught up
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-[320px] leading-relaxed">
          There are no new notifications at this time. We&apos;ll let you know
          when there&apos;s something important.
        </p>
      </div>
    </div>
  );
}

// ─── Notification Item Component ────────────────────────────────────────────────

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = NOTIFICATION_CONFIG[notification.type as NotificationType];

  return (
    <div
      className={`group flex items-start gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0 transition-colors ${
        notification.is_read ? "bg-white" : "bg-gray-50/60"
      } hover:bg-gray-50`}
    >
      {/* Colored dot indicator */}
      <div className="pt-2 shrink-0">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            notification.is_read ? "bg-transparent" : config.dotColor
          }`}
        />
      </div>

      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center shrink-0`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm leading-snug mb-1 ${
            notification.is_read
              ? "font-medium text-gray-700"
              : "font-semibold text-gray-900"
          }`}
        >
          {notification.title}
        </h4>
        <p className="text-sm text-gray-500 leading-relaxed">
          {notification.description}
        </p>
        <span className="text-xs text-gray-400 mt-2 block">
          {formatTimestamp(notification.createdAt)}
        </span>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
        {!notification.is_read && (
          <button
            onClick={() => onMarkAsRead(notification._id)}
            className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Mark as read"
          >
            <HiOutlineCheck className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    removeNotification,
    clearAll,
  } = useNotifications();
  const [showClearModal, setShowClearModal] = useState(false);

  // Derived counts
  const totalCount = notifications.length;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleMarkAsRead = async (id: string) => {
    await markRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllRead();
  };

  const handleDelete = async (id: string) => {
    await removeNotification(id);
  };

  const handleClearAll = async () => {
    await clearAll();
    setShowClearModal(false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-200 mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-lato text-[28px] font-bold text-gray-900 mb-1">
            Notifications
          </h1>
          <p className="text-gray-500 text-sm">
            Updates about your applications, jobs, and community activity.
          </p>
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-sm text-gray-500">
            Loading notifications...
          </div>
        )}

        {/* Empty or Active State */}
        {totalCount === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              {/* Left: Unread count */}
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {unreadCount} unread notification{unreadCount !== 1 && "s"}
                  </span>
                )}
                <span className="text-sm text-gray-400">
                  {totalCount} total
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <button
                    onClick={() => void handleMarkAllAsRead()}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Mark all as read</span>
                  </button>
                )}
                <button
                  onClick={() => setShowClearModal(true)}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear all</span>
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Footer message */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 text-center">
                You&apos;re viewing all your recent notifications. Older
                notifications are automatically archived.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Clear All Confirmation Modal ─── */}
      {showClearModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setShowClearModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-105 w-full mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Clear all notifications?
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              This will remove all {totalCount} notification
              {totalCount !== 1 && "s"} from your list. You can still find
              important updates in your applications and messages.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Keep Notifications
              </button>
              <button
                onClick={() => void handleClearAll()}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
              >
                Yes, Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
