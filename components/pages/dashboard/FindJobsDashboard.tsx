"use client";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PROVINCES } from "@/lib/job-fields";
import { pickGreeting } from "@/lib/greeting";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { HiMagnifyingGlass, HiChevronDown } from "react-icons/hi2";

// Dynamically import profile cards for better optimization
const CompleteProfileCard = dynamic(
  () =>
    import("@/components/ui/ProfileCompletionCards").then(
      (mod) => mod.CompleteProfileCard,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 animate-pulse h-[100px]" />
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

// One compact field style for the whole filter row — keeps a 44px touch
// target (this is the dashboard, where accessibility settings scale text) and
// the theme's focus ring.
const FILTER_FIELD =
  "w-full min-h-[44px] px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm " +
  "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

const WORK_TYPES = [
  { value: "all", label: "All" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
] as const;

// The profile nudge, once dismissed, stays gone for three days — the full
// reminder lives permanently on the profile page, so there's no need to keep
// it in the way here.
const PROFILE_REMINDER_KEY = "vetriconn-profile-reminder-until";
const PROFILE_REMINDER_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

// Quick shortcuts under the search — the kinds of work this board's audience
// looks for most. Each runs the search as a keyword.
const POPULAR_SEARCHES = [
  "Security",
  "Driving",
  "Administration",
  "Customer Service",
  "Skilled Trades",
];

const FindJobsDashboard = () => {
  const { userProfile, profileCompletion, isLoading } = useUserProfile();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState<"all" | "remote" | "onsite">("all");
  const [experienceLevel, setExperienceLevel] = useState("");

  // A rotating, time-and-country greeting — a fresh one each visit. Falls back
  // to a plain "Greetings, {name}" when no country is set.
  const greeting = useMemo(
    () => pickGreeting(userProfile?.full_name, userProfile?.country),
    [userProfile?.full_name, userProfile?.country],
  );

  const isProfileComplete = profileCompletion.percentage === 100;

  // Read once on mount so a still-snoozed nudge never flashes in.
  const [reminderVisible, setReminderVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return Date.now() >= Number(localStorage.getItem(PROFILE_REMINDER_KEY) || 0);
    } catch {
      return true;
    }
  });

  const dismissReminder = () => {
    try {
      localStorage.setItem(
        PROFILE_REMINDER_KEY,
        String(Date.now() + PROFILE_REMINDER_SNOOZE_MS),
      );
    } catch {
      // A storage failure just means the nudge returns next visit — harmless.
    }
    setReminderVisible(false);
  };

  const handleFindJobs = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (location) params.set("location", location);
    // Work arrangement, under its own param. This used to go out as "type",
    // which find-jobs forwards to the backend as jobType — so the Remote
    // button silently filtered for a job *type* called "remote" and matched
    // nothing.
    if (workType !== "all") params.set("arrangement", workType);
    if (experienceLevel) params.set("experience", experienceLevel);
    window.location.href = `/dashboard/find-jobs${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const quickSearch = (term: string) => {
    window.location.href = `/dashboard/find-jobs?q=${encodeURIComponent(term)}`;
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Header — a rotating, localized greeting; "Find Your Next
            Opportunity" moved up here from the search card it used to title. */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            {greeting}
          </h1>
          <p className="text-gray-500 mt-1">Find Your Next Opportunity</p>
        </div>

        {/* Search & filters — a clean, cohesive panel. Labels stay (this is
            the dashboard, where the accessibility text size can scale) and
            every control keeps a 44px target; the row wraps rather than
            clipping. Popular shortcuts sit below. */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5 mb-6">
          <div className="flex flex-wrap items-end gap-3 md:gap-4">
            {/* Job Search */}
            <div className="flex-1 min-w-56">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                Job Search
              </label>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search jobs by title or keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFindJobs();
                  }}
                  className={`${FILTER_FIELD} pl-10`}
                />
              </div>
            </div>

            {/* Location */}
            <div className="min-w-44">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                Location
              </label>
              <div className="relative">
                <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`${FILTER_FIELD} pl-10 pr-9 appearance-none cursor-pointer`}
                >
                  {/* Province codes match the state_province column the
                      backend filters on. Name slugs matched nothing, and
                      "Remote" is a work arrangement, not a location. */}
                  <option value="">All Locations</option>
                  {PROVINCES.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                Work Type
              </label>
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                {WORK_TYPES.map((wt) => (
                  <button
                    key={wt.value}
                    type="button"
                    onClick={() => setWorkType(wt.value)}
                    aria-pressed={workType === wt.value}
                    className={`min-h-[44px] rounded-md px-3 text-sm font-medium transition-colors ${
                      workType === wt.value
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {wt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="min-w-40">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                Experience Level
              </label>
              <div className="relative">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className={`${FILTER_FIELD} pr-9 appearance-none cursor-pointer`}
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Find Jobs */}
            <button
              type="button"
              onClick={handleFindJobs}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <HiMagnifyingGlass className="w-4 h-4" />
              Find jobs
            </button>
          </div>

          {/* Popular searches */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-400">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => quickSearch(term)}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* The profile nudge shows only while incomplete AND not snoozed;
            once complete, the ready-to-apply card takes its place. */}
        {isProfileComplete ? (
          <ReadyToApplyCard />
        ) : reminderVisible ? (
          <CompleteProfileCard
            completed={profileCompletion.completed}
            total={profileCompletion.total}
            percentage={profileCompletion.percentage}
            onDismiss={dismissReminder}
          />
        ) : null}

        {/* Recommended Jobs Section */}
        <RecommendedJobs />
      </div>
    </div>
  );
};

export default FindJobsDashboard;
