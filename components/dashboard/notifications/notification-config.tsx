import React from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserCircle,
  HiOutlineDocumentCheck,
  HiOutlineInformationCircle,
  HiOutlineUserPlus,
} from "react-icons/hi2";
import { NotificationType } from "@/types/api";

export interface NotificationConfig {
  icon: React.ReactNode;
  dotColor?: string;
  bgColor?: string;
  iconColor?: string;
  borderColor?: string;
}

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  application_sent: {
    icon: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />,
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
  },
  application_received: {
    icon: <HiOutlineUserPlus className="w-5 h-5 text-primary" />,
    iconColor: "text-primary",
    borderColor: "border-l-primary",
    bgColor: "bg-red-50",
    dotColor: "bg-primary",
  },
  job_match: {
    icon: <HiOutlineBriefcase className="w-5 h-5 text-blue-600" />,
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-50",
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
    iconColor: "text-green-500",
    borderColor: "border-l-green-500",
  },
  // The six real backend types that used to fall through to the generic
  // fallback icon (the frontend key set had drifted; three of its old keys
  // were never sent by anything).
  application_status_changed: {
    icon: <HiOutlineDocumentCheck className="w-5 h-5 text-emerald-600" />,
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
    borderColor: "border-l-emerald-500",
  },
  new_application: {
    icon: <HiOutlineUserPlus className="w-5 h-5 text-primary" />,
    dotColor: "bg-red-500",
    bgColor: "bg-red-50",
    iconColor: "text-primary",
    borderColor: "border-l-red-500",
  },
  new_message: {
    icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-purple-600" />,
    dotColor: "bg-purple-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-500",
    borderColor: "border-l-purple-500",
  },
  job_approved: {
    icon: <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />,
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
    borderColor: "border-l-emerald-500",
  },
  job_rejected: {
    icon: <HiOutlineInformationCircle className="w-5 h-5 text-rose-600" />,
    dotColor: "bg-rose-500",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-500",
    borderColor: "border-l-rose-500",
  },
  saved_search_matches: {
    icon: <HiOutlineBriefcase className="w-5 h-5 text-blue-600" />,
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
    borderColor: "border-l-blue-500",
  },
  system: {
    icon: <HiOutlineInformationCircle className="w-5 h-5 text-gray-600" />,
    dotColor: "bg-gray-500",
    bgColor: "bg-gray-100",
    iconColor: "text-gray-500",
    borderColor: "border-l-gray-400",
  },
};
