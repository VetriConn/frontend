"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBookmarkSlash,
  HiOutlineBookmark,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SavedJob {
  id: string;
  role: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  savedDate: string;
}

// ─── Dummy Data ─────────────────────────────────────────────────────────────────

const DUMMY_SAVED_JOBS: SavedJob[] = [
  {
    id: "sj-1",
    role: "Customer Service Representative",
    company: "Veterans Health Administration",
    location: "Denver, CO",
    jobType: "Remote",
    salary: "$45,000 – $55,000/year",
    savedDate: "December 20, 2024",
  },
  {
    id: "sj-2",
    role: "Administrative Assistant",
    company: "Home Depot Corporate",
    location: "Atlanta, GA",
    jobType: "On-site",
    salary: "$38,000 – $48,000/year",
    savedDate: "December 18, 2024",
  },
  {
    id: "sj-3",
    role: "Part-Time Security Officer",
    company: "Allied Universal Security",
    location: "Phoenix, AZ",
    jobType: "Part-time",
    salary: "$18 – $22/hour",
    savedDate: "December 15, 2024",
  },
  {
    id: "sj-4",
    role: "Veteran Outreach Coordinator",
    company: "American Legion",
    location: "Indianapolis, IN",
    jobType: "Hybrid",
    salary: "$52,000 – $65,000/year",
    savedDate: "December 12, 2024",
  },
];

// ─── Empty State ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <HiOutlineBookmark className="w-9 h-9 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        You haven&apos;t saved any jobs yet
      </h3>
      <p className="text-sm text-gray-500 max-w-[380px] leading-relaxed mb-8">
        Browse jobs and save ones you&apos;d like to apply for later. Your saved
        jobs will appear here for easy access.
      </p>
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline"
      >
        <HiOutlineMagnifyingGlass className="text-base" />
        Browse Jobs
      </Link>
    </div>
  );
}

// ─── Saved Job Card ─────────────────────────────────────────────────────────────

function SavedJobCard({
  job,
  onRemove,
}: {
  job: SavedJob;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4 mobile:flex-col">
        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{job.role}</h3>

          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <HiOutlineBuildingOffice2 className="text-sm shrink-0" />
            <span>{job.company}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <HiOutlineMapPin className="text-sm" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineClock className="text-sm" />
              {job.jobType}
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineCurrencyDollar className="text-sm" />
              {job.salary}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
            <HiOutlineCalendarDays className="text-sm" />
            Saved on {job.savedDate}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0 mobile:flex-row mobile:w-full">
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline"
          >
            <HiOutlineArrowTopRightOnSquare className="text-sm" />
            Apply Now
          </Link>
          <button
            onClick={() => onRemove(job.id)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <HiOutlineBookmarkSlash className="text-sm" />
            Remove from Saved
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(DUMMY_SAVED_JOBS);

  const handleRemove = (id: string) => {
    setSavedJobs((prev) => prev.filter((j) => j.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="font-lato text-[28px] font-bold text-gray-900">
            Saved Jobs
          </h1>
          {savedJobs.length > 0 && (
            <span className="text-sm text-gray-400 mt-2">
              {savedJobs.length} job{savedJobs.length !== 1 && "s"} saved
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Jobs you&apos;ve saved to review or apply for later. Take your time —
          there&apos;s no rush.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8" />

        {/* Content */}
        {savedJobs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <SavedJobCard key={job.id} job={job} onRemove={handleRemove} />
              ))}
            </div>

            {/* Footer message */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-400 text-center">
                Your saved jobs are always here when you need them. Take your
                time to review each opportunity before applying.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
