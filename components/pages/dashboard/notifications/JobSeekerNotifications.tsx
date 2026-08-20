"use client";

import React, { useState } from "react";
import { HiOutlineCheck, HiOutlineTrash } from "react-icons/hi2";
import { useNotifications } from "@/hooks/useNotifications";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { NotificationItem } from "@/components/dashboard/notifications/NotificationItem";
import { NotificationsEmptyState } from "@/components/dashboard/notifications/NotificationsEmptyState";

export default function JobSeekerNotifications() {
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
    <RoleGuard allowedRoles={["job_seeker"]}>
      <div className="max-w-200 mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-lato text-xl md:text-3xl font-bold text-gray-900 mb-1">
            Notifications
          </h1>
          <p className="text-gray-500 text-sm">
            Updates about your applications, jobs, and community activity.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              {totalCount} total
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-primary text-xs font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <HiOutlineCheck className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
            {totalCount > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <HiOutlineTrash className="w-4 h-4" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-gray-500 font-medium">
                Loading notifications...
              </p>
            </div>
          ) : totalCount > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <NotificationItem
                  key={notif._id}
                  notification={notif}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <NotificationsEmptyState />
          )}
        </div>

        {/* Clear All Confirmation Modal */}
        {showClearModal && (
          <div className="fixed inset-0 z-100 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <HiOutlineTrash className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-semibold text-gray-900">
                        Clear all notifications
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete all notifications?
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
