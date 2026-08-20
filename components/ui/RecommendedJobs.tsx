"use client";
import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { formatJobSalary } from "@/lib/job-display";
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiCurrencyDollar,
} from "react-icons/hi";
import { getRecommendedJobs } from "@/lib/api";
import { useUserProfile } from "@/hooks/useUserProfile";

interface RecommendedJobCardProps {
  id: string;
  role: string;
  company_name: string;
  location: string;
  work_type?: string;
  salary_range: string;
}

const RecommendedJobCard: React.FC<RecommendedJobCardProps> = ({
  id,
  role,
  company_name,
  location,
  work_type,
  salary_range,
}) => {
  return (
    <Link
      href={`/jobs/${id}`}
      className="group bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow no-underline text-current"
    >
      <div>
        {/* One step down the scale: 24px in a 274px card overwhelmed it.
            Two lines are clamped AND reserved, so a one-line title and a
            two-line title leave the rows below starting at the same height —
            it is the raggedness, more than the size, that read as off. */}
        <h3
          className="text-lg font-semibold text-gray-900 leading-snug tracking-tight capitalize line-clamp-2 min-h-[2.75em] mb-2"
          title={role}
        >
          {role}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <HiOutlineBriefcase className="w-4 h-4 md:w-5 md:h-5 text-gray-400 shrink-0" />
          <span className="truncate">{company_name}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <HiOutlineLocationMarker className="w-4 h-4 md:w-5 md:h-5 text-gray-400 shrink-0" />
          <span>{location}</span>
        </div>

        {work_type && (
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            <HiOutlineClock className="w-4 h-4 md:w-5 md:h-5 text-gray-400 shrink-0" />
            <span>{work_type}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-4">
          <HiCurrencyDollar className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
          <span>{salary_range}</span>
        </div>
      </div>

      <div className="block w-full bg-primary text-white text-center py-2.5 rounded-lg font-medium group-hover:bg-primary-hover transition-colors text-sm">
        Apply Now
      </div>
    </Link>
  );
};

export const RecommendedJobs: React.FC = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "/jobs/recommended",
    getRecommendedJobs,
  );
  const { userProfile } = useUserProfile();

  // Personalisation only exists when the profile gives the ranking something
  // to work with. Without it the API falls back to the newest listings, and
  // the header should say that instead of claiming a match happened.
  const hasSignals = Boolean(
    userProfile?.industry?.trim() ||
      userProfile?.job_title?.trim() ||
      userProfile?.city?.trim() ||
      userProfile?.state_province?.trim(),
  );

  const jobs: RecommendedJobCardProps[] = (data || []).map((job) => {
    // "Competitive" only when we genuinely have no figure — a scraped listing
    // usually does, just as free text ("$18.50 hourly") rather than a number.
    const salaryRange = formatJobSalary(job) ?? "Competitive";

    return {
      id: job.id || job._id,
      role: job.role,
      company_name: job.company_name,
      // Scraped locations arrive as "Location Montréal (QC)" — the word is
      // baked into the data, and next to the pin icon it read twice.
      location: (job.location || "Canada").replace(/^location\s+/i, ""),
      salary_range: salaryRange,
    };
  });

  if (isLoading) {
    const { RecommendedJobsSkeleton } = require("@/components/ui/Skeleton");
    return <RecommendedJobsSkeleton />;
  }

  return (
    <div className=" rounded-xl py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
          <HiOutlineBriefcase className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
              <h2 className="text-xl md:text-3xl font-semibold text-gray-900 mb-2">
                {hasSignals ? "Recommended for you" : "Latest jobs"}
              </h2>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-13">
        {hasSignals ? (
          "Ranked by how well they match your profile and location"
        ) : (
          <>
            The newest openings across Canada —{" "}
            <Link
              href="/dashboard/profile"
              className="text-primary hover:underline"
            >
              complete your profile
            </Link>{" "}
            to get matches
          </>
        )}
      </p>

      {/* A failed request used to render as this exact section with a silent
          empty grid under it — indistinguishable from "no jobs". Say what
          happened and offer the retry. */}
      {error && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            We couldn&apos;t load jobs right now.
          </p>
          <button
            type="button"
            onClick={() => mutate()}
            className="py-2 px-4 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {!error && jobs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">
            No open listings at the moment. New jobs are added throughout the
            day — check back soon.
          </p>
        </div>
      )}

      {!error && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {jobs.map((job) => (
            <RecommendedJobCard key={job.id} {...job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
