"use client";
import React from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import JobSeekerDashboard from "@/components/pages/dashboard/JobSeekerDashboard";
import EmployerDashboard from "@/components/pages/dashboard/EmployerDashboard";
import { useRouter } from "next/navigation";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

const Dashboard = () => {
  const { userProfile, isLoading, isError } = useUserProfile();
  const router = useRouter();

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

  // Render dashboard based on role
  if (userProfile.role === "employer") {
    return <EmployerDashboard />;
  }

  // Default to job seeker dashboard
  return <JobSeekerDashboard />;
};

export default Dashboard;
