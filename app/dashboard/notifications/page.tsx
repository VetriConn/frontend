"use client";

import Notifications from "@/components/pages/dashboard/notifications/Notifications";

/**
 * One notifications list. There used to be an employer view and a job-seeker
 * view; the employer one filtered to three notification types, so with a single
 * account each view hid the half of your notifications that belonged to the
 * other role.
 */
export default function NotificationsPage() {
  return <Notifications />;
}
