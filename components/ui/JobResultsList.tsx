"use client";

import React from "react";
import { Job } from "@/types/job";
import { formatJobSalary } from "@/lib/job-display";
import { JobResultCard } from "./JobResultCard";
import { Skeleton } from "./Skeleton";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";

interface JobResultsListProps {
  jobs: Job[];
  /** Total matches across all pages; falls back to the page length. */
  totalCount?: number;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  onApply?: (id: string) => void;
}

// Skeleton component for job result cards
const JobResultCardSkeleton = () => (
  <div
    className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
    aria-hidden="true"
  >
    <div className="flex-1 min-w-0">
      {/* Title skeleton */}
      <Skeleton width="60%" height="24px" borderRadius="4px" className="mb-3" />
      {/* Meta info skeleton */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
        <Skeleton width="100px" height="16px" borderRadius="4px" />
        <Skeleton width="80px" height="16px" borderRadius="4px" />
        <Skeleton width="70px" height="16px" borderRadius="4px" />
        <Skeleton width="90px" height="16px" borderRadius="4px" />
      </div>
      {/* Description skeleton */}
      <Skeleton width="100%" height="16px" borderRadius="4px" className="mb-1" />
      <Skeleton width="80%" height="16px" borderRadius="4px" />
    </div>
    {/* Button skeleton */}
    <div className="flex-shrink-0 md:self-center">
      <Skeleton width="100px" height="40px" borderRadius="8px" />
    </div>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
    role="status"
    aria-label="No jobs found"
  >
    <div className="mb-6" aria-hidden="true">
      <HiOutlineMagnifyingGlass className="w-16 h-16 text-gray-300" />
    </div>
    <h3 className="text-lg md:text-2xl font-semibold text-gray-700 mb-2">No jobs found</h3>
          <p className="text-sm md:text-base text-gray-500 max-w-md">
            We couldn&apos;t find any jobs matching your criteria. Try adjusting your
      filters or search terms.
    </p>
  </div>
);

// Error state component
const ErrorState = ({
  onRetry,
}: {
  onRetry?: () => void;
}) => (
  <div
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
    role="alert"
    aria-label="Error loading jobs"
  >
    <div className="mb-6" aria-hidden="true">
      <FaExclamationTriangle className="text-5xl text-amber-500 opacity-80" />
    </div>
    <h3 className="text-lg md:text-2xl font-semibold text-gray-700 mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-500 max-w-md mb-6">
      We encountered an error while loading jobs. Please try again.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-primary text-white py-3 px-6 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
      >
        <FaRedo className="text-sm" aria-hidden="true" />
        Try Again
      </button>
    )}
  </div>
);

// Salary rules live in lib/job-display so the list, the detail page and the
// recommendations panel can't drift apart again. Returns "" rather than null
// because JobResultCard hides the row on an empty string.
const formatSalary = (job: Job): string => formatJobSalary(job, "full") ?? "";

// Helper function to get job type from tags
/**
 * The employment type a listing actually states, or null.
 *
 * This returned "Full-time" whenever nothing matched — and since scraped jobs
 * carried no tags at all, that was every listing on the board. Not one of the
 * real listings states an employment type, so the label was wrong every time
 * it was shown. The scraper derives these now; an absent one renders nothing.
 */
const getJobType = (job: Job): string | null => {
  const employmentTypes = [
    "full-time", "part-time", "casual", "seasonal", "contract",
  ];
  const found = job.tags.find((tag) =>
    employmentTypes.includes(tag.name.toLowerCase()),
  );
  if (!found) return null;
  return found.name.charAt(0).toUpperCase() + found.name.slice(1);
};

export const JobResultsList = ({
  jobs,
  totalCount,
  isLoading,
  isError,
  onRetry,
  onApply,
}: JobResultsListProps) => {
  // Show loading skeletons
  if (isLoading && jobs.length === 0) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading jobs">
        {/* Results counter skeleton */}
        <div className="mb-4">
          <Skeleton width="120px" height="20px" borderRadius="4px" />
        </div>
        {/* Job card skeletons */}
        <div role="status" aria-label="Loading job listings">
          <span className="sr-only">Loading job listings...</span>
          {[...Array(6)].map((_, index) => (
            <JobResultCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  // Show empty state
  if (jobs.length === 0) {
    return <EmptyState />;
  }

  return (
    <section
      className="space-y-4"
      aria-label="Job search results"
    >
      {/* Results counter - aria-live for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-sm text-gray-600 mb-4"
      >
        {/* The count of MATCHES, not of rows on screen. This read jobs.length,
            which was the whole board back when the page fetched all of it and
            sliced in the browser — and would now say 10 regardless. */}
        {totalCount ?? jobs.length} {(totalCount ?? jobs.length) === 1 ? "job" : "jobs"} found
      </div>

      {/* Job cards list */}
      <div className="space-y-4" role="list" aria-label="Job listings">
        {jobs.map((job, index) => (
          <div
            key={job.id}
            role="listitem"
            className="reveal-on-enter"
            style={{ "--reveal-index": index } as React.CSSProperties}
          >
            <JobResultCard
              id={job.id}
              title={job.role}
              company={job.company_name}
              location={job.location}
              jobType={getJobType(job)}
              salary={formatSalary(job)}
              description={job.full_description}
              onApply={onApply}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default JobResultsList;
