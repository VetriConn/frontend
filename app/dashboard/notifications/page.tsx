"use client";

import React, { useState, useMemo } from "react";
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
} from "react-icons/hi2";

// ─── Types ──────────────────────────────────────────────────────────────────────

type NotificationType =
  | "application_sent"
  | "job_match"
  | "profile_viewed"
  | "new_reply"
  | "employer_message"
  | "profile_reminder"
  | "application_reviewed";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string; // relative time string
  isRead: boolean;
}

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
};

// ─── Dummy Notifications ────────────────────────────────────────────────────────

const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "application_sent",
    title: "Application Sent Successfully",
    description:
      "Your application for Customer Support Assistant at Rosewell Services was sent successfully.",
    timestamp: "2 hours ago",
    isRead: false,
  },
  {
    id: "2",
    type: "job_match",
    title: "New Job Match",
    description:
      "A new job matching your preferences is available: Part-time Administrative Assistant at Veterans Community Center.",
    timestamp: "3 hours ago",
    isRead: false,
  },
  {
    id: "3",
    type: "profile_viewed",
    title: "Profile Viewed",
    description:
      "An employer at Senior Living Solutions viewed your profile. They may reach out soon.",
    timestamp: "Yesterday",
    isRead: false,
  },
  {
    id: "4",
    type: "new_reply",
    title: "New Reply to Your Post",
    description:
      'Someone replied to your community post: "Tips for returning to work after retirement".',
    timestamp: "Yesterday",
    isRead: false,
  },
  {
    id: "5",
    type: "employer_message",
    title: "Message from Employer",
    description:
      "You received a new message from Golden Years Healthcare regarding your application.",
    timestamp: "2 days ago",
    isRead: false,
  },
  {
    id: "6",
    type: "profile_reminder",
    title: "Profile Reminder",
    description:
      "Complete your profile to improve your chances of being noticed by employers. Add your skills and experience.",
    timestamp: "4 days ago",
    isRead: false,
  },
  {
    id: "7",
    type: "application_reviewed",
    title: "Application Reviewed",
    description:
      "Good news! Your application for Library Assistant has been reviewed by the hiring team.",
    timestamp: "4 days ago",
    isRead: false,
  },
];

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
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = NOTIFICATION_CONFIG[notification.type];

  return (
    <div
      className={`group flex items-start gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0 transition-colors ${
        notification.isRead ? "bg-white" : "bg-gray-50/60"
      } hover:bg-gray-50`}
    >
      {/* Colored dot indicator */}
      <div className="pt-2 shrink-0">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            notification.isRead ? "bg-transparent" : config.dotColor
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
            notification.isRead
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
          {notification.timestamp}
        </span>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Mark as read"
          >
            <HiOutlineCheck className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
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
  const [notifications, setNotifications] =
    useState<Notification[]>(DUMMY_NOTIFICATIONS);
  const [showClearModal, setShowClearModal] = useState(false);

  // Derived counts
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const totalCount = notifications.length;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setShowClearModal(false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-lato text-[28px] font-bold text-gray-900 mb-1">
            Notifications
          </h1>
          <p className="text-gray-500 text-sm">
            Updates about your applications, jobs, and community activity.
          </p>
        </div>

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
                    onClick={handleMarkAllAsRead}
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
                  key={notification.id}
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setShowClearModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-[420px] w-full mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
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
                onClick={handleClearAll}
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
