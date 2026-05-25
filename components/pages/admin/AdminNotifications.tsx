"use client";

import clsx from "clsx";
import {
  HiOutlineBell,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineFlag,
} from "react-icons/hi2";
import {
  useAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminNotification,
  type AdminNotificationType,
} from "@/hooks/useAdminNotifications";
import { AdminPageHeader } from "./AdminTablePanel";
import { useToaster } from "@/components/ui/Toaster";

const ICONS: Record<
  AdminNotificationType,
  React.ComponentType<{ className?: string }>
> = {
  job_submitted: HiOutlineBriefcase,
  employer_registered: HiOutlineBuildingOffice2,
  employer_verified: HiOutlineShieldCheck,
  user_report: HiOutlineExclamationTriangle,
  post_flagged: HiOutlineFlag,
};

const ICON_TONE: Record<AdminNotificationType, string> = {
  job_submitted: "bg-rose-50 text-rose-600 ring-rose-100",
  employer_registered: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  employer_verified: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  user_report: "bg-amber-50 text-amber-600 ring-amber-100",
  post_flagged: "bg-rose-50 text-rose-600 ring-rose-100",
};

const formatRelative = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString();
};

const NotificationRow = ({
  n,
  onMarkRead,
}: {
  n: AdminNotification;
  onMarkRead: (id: string) => void;
}) => {
  const Icon = ICONS[n.type];
  return (
    <li
      className={clsx(
        "group relative flex items-center gap-4 px-5 md:px-6 py-4 transition-colors",
        n.read
          ? "bg-white hover:bg-gray-50/70"
          : "bg-rose-50/30 hover:bg-rose-50/50",
      )}
    >
      <div
        className={clsx(
          "w-10 h-10 rounded-xl ring-1 flex items-center justify-center shrink-0",
          ICON_TONE[n.type],
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            "text-sm truncate",
            n.read ? "text-gray-600" : "font-semibold text-gray-900",
          )}
        >
          {n.message}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatRelative(n.createdAt)}
        </p>
      </div>

      {!n.read && (
        <button
          onClick={() => onMarkRead(n.id)}
          className="shrink-0 inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-primary"
          aria-label="Mark as read"
          title="Mark as read"
        />
      )}
    </li>
  );
};

const AdminNotifications = () => {
  const { notifications, isLoading, mutate } = useAdminNotifications();
  const { showToast } = useToaster();

  const unread = notifications.filter((n) => !n.read);

  const handleMarkOne = async (id: string) => {
    try {
      await markAdminNotificationRead(id);
      await mutate(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        false,
      );
    } catch {
      showToast({ type: "error", title: "Could not mark as read" });
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAdminNotificationsRead();
      await mutate(
        notifications.map((n) => ({ ...n, read: true })),
        false,
      );
      showToast({ type: "success", title: "All caught up" });
    } catch {
      showToast({ type: "error", title: "Could not update notifications" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Stay updated on platform activity"
        actions={
          unread.length > 0 ? (
            <button
              onClick={handleMarkAll}
              className="inline-flex items-center gap-2 bg-white text-gray-800 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Mark all as read
            </button>
          ) : undefined
        }
      />

      <section className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
        {isLoading ? (
          <ul className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="px-6 py-4 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-gray-100 animate-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-100 rounded animate-shimmer" />
                  <div className="h-3 w-1/4 bg-gray-100 rounded animate-shimmer" />
                </div>
              </li>
            ))}
          </ul>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-4">
              <HiOutlineBell className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              You&apos;re all caught up
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              New platform activity will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <NotificationRow key={n.id} n={n} onMarkRead={handleMarkOne} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminNotifications;
