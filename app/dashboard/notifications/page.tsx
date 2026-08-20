"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import EmployerNotifications from "@/components/pages/dashboard/notifications/EmployerNotifications";
import JobSeekerNotifications from "@/components/pages/dashboard/notifications/JobSeekerNotifications";

/**
 * Notifications is one destination for everyone — the employer and job seeker
 * views are the same feature over different data, so they share a URL and
 * this picks the right one. Each view keeps its own RoleGuard, so this
 * choice is presentation only and not the authorisation boundary.
 */
export default function NotificationsPage() {
  const { userProfile, isLoading } = useUserProfile();

  if (isLoading) return <DashboardSkeleton />;

  return userProfile?.role === "employer" || userProfile?.role === "admin" ? (
    <EmployerNotifications />
  ) : (
    <JobSeekerNotifications />
  );
}
