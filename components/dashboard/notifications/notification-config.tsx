import React from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentCheck,
  HiOutlineUserPlus,
} from "react-icons/hi2";
import Image from "next/image";
import { NotificationType } from "@/types/api";

/**
 * Vetriconn speaking, rather than a person.
 *
 * public/logo.svg is the maple-leaf mark on its own, 154x154, which is what
 * the favicon uses. The wordmark in public/images/logo.png is the wrong asset
 * here: at the 20px this renders at, "Vetriconn" is a grey smudge.
 *
 * alt is empty on purpose. The notification's title already says what this
 * is, so announcing the logo as well would just repeat the brand name into
 * every system message a screen reader reads.
 *
 * unoptimized because the image optimizer refuses SVG unless
 * dangerouslyAllowSVG is set, and turning that on globally to render one
 * first-party file we control is the wrong trade.
 */
const SystemMark = () => (
  <Image src="/logo.svg" alt="" width={20} height={20} unoptimized className="w-5 h-5" />
);

/** The look shared by every notification that is Vetriconn talking to you. */
const SYSTEM_VOICE = {
  icon: <SystemMark />,
  dotColor: "bg-primary",
  bgColor: "bg-red-50",
  iconColor: "text-primary",
  borderColor: "border-l-primary",
} as const;

interface NotificationConfig {
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
  profile_reminder: SYSTEM_VOICE,
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
  job_approved: SYSTEM_VOICE,
  job_rejected: SYSTEM_VOICE,
  saved_search_matches: SYSTEM_VOICE,
  // The first notification most accounts ever see, so it wears the brand
  // colour rather than the generic grey of `system`.
  welcome: SYSTEM_VOICE,
  system: SYSTEM_VOICE,
};
