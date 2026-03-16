"use client";

import {
  HiCheckCircle,
  HiXCircle,
  HiOutlineUserPlus,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotificationType =
  | "job_approved"
  | "new_application"
  | "new_message"
  | "job_rejected";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "job_approved",
    title: "Job Approved",
    description: 'Your posting "Warehouse Supervisor" is now live.',
    timestamp: "2026-02-15 09:00",
    read: false,
  },
  {
    id: "2",
    type: "new_application",
    title: "New Application",
    description: "Patricia Williams applied for Logistics Coordinator.",
    timestamp: "2026-02-15 08:30",
    read: false,
  },
  {
    id: "3",
    type: "new_message",
    title: "New Message",
    description: "James Mitchell sent you a message.",
    timestamp: "2026-02-15 10:30",
    read: false,
  },
  {
    id: "4",
    type: "job_rejected",
    title: "Job Rejected",
    description:
      'Your posting "Administrative Assistant" was not approved. Please review and resubmit.',
    timestamp: "2026-02-12 14:00",
    read: true,
  },
  {
    id: "5",
    type: "new_application",
    title: "New Application",
    description: "David Thompson applied for Logistics Coordinator.",
    timestamp: "2026-02-12 11:00",
    read: true,
  },
  {
    id: "6",
    type: "job_approved",
    title: "Job Approved",
    description: 'Your posting "Logistics Coordinator" is now live.',
    timestamp: "2026-02-11 09:00",
    read: true,
  },
  {
    id: "7",
    type: "new_application",
    title: "New Application",
    description: "Robert Chen applied for Warehouse Supervisor.",
    timestamp: "2026-02-13 15:00",
    read: true,
  },
];

// ─── Icon + color config ─────────────────────────────────────────────────────

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  {
    icon: typeof HiCheckCircle;
    iconColor: string;
    borderColor: string;
  }
> = {
  job_approved: {
    icon: HiCheckCircle,
    iconColor: "text-green-500",
    borderColor: "border-l-green-500",
  },
  new_application: {
    icon: HiOutlineUserPlus,
    iconColor: "text-primary",
    borderColor: "border-l-primary",
  },
  new_message: {
    icon: HiOutlineChatBubbleLeftRight,
    iconColor: "text-primary",
    borderColor: "border-l-primary",
  },
  job_rejected: {
    icon: HiXCircle,
    iconColor: "text-red-500",
    borderColor: "border-l-red-500",
  },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[680px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

        <div className="space-y-2">
          {MOCK_NOTIFICATIONS.map((notif) => {
            const config = NOTIFICATION_CONFIG[notif.type];
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-lg border border-gray-200 border-l-4 ${config.borderColor} px-5 py-4 flex items-start gap-3 ${
                  !notif.read ? "bg-yellow-50/40" : ""
                }`}
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
                  {notif.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
