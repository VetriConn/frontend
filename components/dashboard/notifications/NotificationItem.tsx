import React from "react";
import Link from "next/link";
import { HiOutlineCheck, HiOutlineTrash } from "react-icons/hi2";
import { NotificationItem as NotificationItemType } from "@/types/api";
import { NOTIFICATION_CONFIG } from "./notification-config";
import { formatRelativeTime } from "@/lib/date-utils";

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.system;

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
            notification.is_read ? "bg-transparent" : (config.dotColor || "bg-primary")
          }`}
        />
      </div>

      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full ${config.bgColor || "bg-gray-100"} flex items-center justify-center shrink-0`}
      >
        {config.icon}
      </div>

      {/* Content */}
      {notification.link ? (
        <Link href={notification.link} className="flex-1 min-w-0 block hover:no-underline">
          <h4
            className={`text-sm leading-snug mb-1 ${
              notification.is_read
                ? "font-medium text-gray-700 hover:text-primary transition-colors"
                : "font-semibold text-gray-900 hover:text-primary transition-colors"
            }`}
          >
            {notification.title}
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            {notification.description}
          </p>
          <span className="text-xs text-gray-400 mt-2 block">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </Link>
      ) : (
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
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      )}

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
