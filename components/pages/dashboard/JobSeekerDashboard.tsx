"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useUserProfile } from "@/hooks/useUserProfile";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { HiMagnifyingGlass } from "react-icons/hi2";

// Dynamically import profile cards for better optimization
const CompleteProfileCard = dynamic(
  () =>
    import("@/components/ui/ProfileCompletionCards").then(
      (mod) => mod.CompleteProfileCard,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-pulse h-[180px]" />
    ),
  },
);

const ReadyToApplyCard = dynamic(
  () =>
    import("@/components/ui/ProfileCompletionCards").then(
      (mod) => mod.ReadyToApplyCard,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-pulse h-[150px]" />
    ),
  },
);

// Dynamically import RecommendedJobs component (fetches its own data)
const RecommendedJobs = dynamic(
  () => import("@/components/ui/RecommendedJobs"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-xl p-6 h-[400px] animate-pulse" />
    ),
  },
);

const JobSeekerDashboard = () => {
  const { profileCompletion, isLoading } = useUserProfile();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState<"all" | "remote" | "onsite">("all");
  const [experienceLevel, setExperienceLevel] = useState("");

  const isProfileComplete = profileCompletion.percentage === 100;

  const handleFindJobs = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (location) params.set("location", location);
    if (workType !== "all") params.set("type", workType);
    if (experienceLevel) params.set("experience", experienceLevel);
    window.location.href = `/dashboard/jobs${params.toString() ? `?${params.toString()}` : ""}`;
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Your Dashboard
          </h1>
          <p className="text-gray-500">
            Here&apos;s what&apos;s happening with your job search today.
          </p>
        </div>

        {/* Find Your Next Opportunity Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Find Your Next Opportunity
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Search for jobs that match your skills and preferences
          </p>

          <div className="flex flex-wrap gap-4 items-end">
            {/* Job Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Search
              </label>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs by title or keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none bg-white cursor-pointer"
                >
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="ontario">Ontario</option>
                  <option value="quebec">Quebec</option>
                  <option value="british-columbia">British Columbia</option>
                  <option value="alberta">Alberta</option>
                  <option value="manitoba">Manitoba</option>
                  <option value="saskatchewan">Saskatchewan</option>
                  <option value="nova-scotia">Nova Scotia</option>
                  <option value="new-brunswick">New Brunswick</option>
                </select>
              </div>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Type
              </label>
              <div className="flex rounded-lg overflow-hidden bg-gray-100">
                <button
                  onClick={() => setWorkType("all")}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-lg ${
                    workType === "all"
                      ? "bg-primary text-white"
                      : "bg-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setWorkType("remote")}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-lg ${
                    workType === "remote"
                      ? "bg-primary text-white"
                      : "bg-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Remote
                </button>
                <button
                  onClick={() => setWorkType("onsite")}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-lg ${
                    workType === "onsite"
                      ? "bg-primary text-white"
                      : "bg-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  On-site
                </button>
              </div>
            </div>

            {/* Experience Level */}
            <div className="min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none bg-white cursor-pointer"
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            {/* Find Jobs Button */}
            <button
              onClick={handleFindJobs}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
            >
              Find jobs
            </button>
          </div>
        </div>

        {/* Conditional Cards - Only one shows at a time */}
        {!isProfileComplete ? (
          <CompleteProfileCard
            completed={profileCompletion.completed}
            total={profileCompletion.total}
            percentage={profileCompletion.percentage}
          />
        ) : (
          <ReadyToApplyCard />
        )}

        {/* Recommended Jobs Section */}
        <RecommendedJobs />
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
