"use client";
import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { formatJobSalary } from "@/lib/job-display";
import {
  HiOutlineArrowRight,
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiCurrencyDollar,
} from "react-icons/hi";
import { getRecommendedJobs } from "@/lib/api";
import { useUserProfile } from "@/hooks/useUserProfile";
import clsx from "clsx";
import {
  CARD_SURFACE,
  CARD_FOCUS_WITHIN,
  CARD_TITLE,
  CARD_META_ROW,
  CARD_META_ICON,
} from "./cardStyles";

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
    <article
      className={clsx(
        CARD_SURFACE,
        CARD_FOCUS_WITHIN,
        // h-full + the grid's default stretch makes every card in a row the
        // same height; mt-auto on the action pins it to the bottom, so the
        // buttons line up whatever the content above them does.
        "p-5 flex flex-col h-full",
      )}
    >
      <Link
        href={`/jobs/${id}`}
        className="no-underline text-current focus:outline-none block mb-4"
      >
        {/* One step down the scale: 24px in a 274px card overwhelmed it.
            Two lines are clamped AND reserved, so a one-line title and a
            two-line title leave the rows below starting at the same height —
            it is the raggedness, more than the size, that read as off. */}
        <h3
          className={clsx(CARD_TITLE, "text-lg capitalize line-clamp-2 min-h-[2.75em] mb-2")}
          title={role}
        >
          {role}
        </h3>

        <div className={clsx(CARD_META_ROW, "text-gray-600 mb-2")}>
          <HiOutlineBriefcase className={CARD_META_ICON} />
          <span className="truncate" title={company_name}>
            {company_name}
          </span>
        </div>

        <div className={clsx(CARD_META_ROW, "text-gray-600 mb-2")}>
          <HiOutlineLocationMarker className={CARD_META_ICON} />
          <span>{location}</span>
        </div>

        {work_type && (
          <div className={clsx(CARD_META_ROW, "text-gray-600 mb-2")}>
            <HiOutlineClock className={CARD_META_ICON} />
            <span>{work_type}</span>
          </div>
        )}

        <div className={clsx(CARD_META_ROW, "text-primary font-medium")}>
          <HiCurrencyDollar className="w-4 h-4 shrink-0" />
          <span>{salary_range}</span>
        </div>
      </Link>

      {/* Goes to the application, not back to the job page the card already
          opens. It was a div reading "Apply Now" nested inside the card's own
          link, so it neither applied nor could be reached by keyboard
          separately. Scraped listings redirect on from here to the employer's
          own process. */}
      <Link
        href={`/jobs/${id}/apply`}
        className="mt-auto block w-full bg-primary hover:bg-primary-hover text-white text-center py-2.5 rounded-lg font-medium transition-colors text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Apply Now
      </Link>
    </article>
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
      {/* Header. The heading and the "See all" sit on one row, with the link
          pushed right and baseline-aligned to the heading rather than centred
          against the icon circle. */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
          <HiOutlineBriefcase className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        <h2 className="text-xl md:text-3xl font-semibold text-gray-900 mb-2">
          {hasSignals ? "Recommended for you" : "Latest jobs"}
        </h2>

        {/* Hidden when there is nothing to see all of — a link to a fuller
            list is a false promise while the section is failing or empty. */}
        {!error && jobs.length > 0 && (
          <Link
            href="/dashboard/find-jobs"
            className="ml-auto inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:text-primary-hover no-underline shrink-0"
          >
            See all
            <HiOutlineArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Link>
        )}
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
          {jobs.map((job, index) => (
            <div
              key={job.id}
              className="reveal-on-enter h-full"
              style={{ "--reveal-index": index } as React.CSSProperties}
            >
              <RecommendedJobCard {...job} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
