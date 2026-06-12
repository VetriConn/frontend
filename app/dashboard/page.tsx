"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

// Lazy load dashboard components for better code splitting
const JobSeekerDashboard = dynamic(
  () => import("@/components/pages/dashboard/JobSeekerDashboard"),
  {
    loading: () => <DashboardSkeleton />,
  }
);

const EmployerDashboard = dynamic(
  () => import("@/components/pages/dashboard/EmployerDashboard"),
  {
    loading: () => <DashboardSkeleton />,
  }
);

const Dashboard = () => {
  const { userProfile, isLoading, isError } = useUserProfile();
  const router = useRouter();

  // Admins live under /admin — bounce them out of the seeker/employer dashboard.
  useEffect(() => {
    if (!isLoading && userProfile?.role === "admin") {
      router.replace("/admin");
    }
  }, [isLoading, userProfile, router]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !userProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to load profile
          </h2>
          <p className="text-gray-500 mb-6">Please try logging in again.</p>
          <button
            onClick={() => router.push("/signin")}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Render dashboard based on confirmed role only — never fall through to a default
  if (userProfile.role === "employer") {
    return <EmployerDashboard />;
  }

  if (userProfile.role === "job_seeker") {
    return <JobSeekerDashboard />;
  }

  if (userProfile.role === "admin") {
    // Effect above redirects to /admin; render skeleton during the flip.
    return <DashboardSkeleton />;
  }

  // Role not yet known or unrecognised — hold at skeleton
  return <DashboardSkeleton />;
};

export default Dashboard;
