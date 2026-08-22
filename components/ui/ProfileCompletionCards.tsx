"use client";
import React from "react";
import Link from "next/link";
import { HiArrowRight, HiX } from "react-icons/hi";

interface CompleteProfileCardProps {
  completed: number;
  total: number;
  percentage: number;
  /** When provided, a dismiss control appears. */
  onDismiss?: () => void;
}

export const CompleteProfileCard: React.FC<CompleteProfileCardProps> = ({
  completed,
  total,
  percentage,
  onDismiss,
}) => {
  return (
    // A slim single-line nudge — title, inline progress, action, and a dismiss.
    // The full reminder lives permanently on the profile page, so the dashboard
    // only needs the lightest prompt. Wraps at narrow widths or scaled text.
    <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 px-4 py-3 mb-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-sm md:text-base font-semibold text-gray-900 whitespace-nowrap">
          Complete your profile
        </span>

        <div className="flex flex-1 items-center gap-3 min-w-[160px]">
          <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
            {completed} of {total} ·{" "}
            <span className="font-semibold text-primary">{percentage}%</span>
          </span>
        </div>

        <Link
          href="/dashboard/profile"
          className="min-h-[44px] inline-flex items-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Complete my profile
        </Link>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss — finish your profile any time from your profile page"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <HiX className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export const ReadyToApplyCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6 mb-6">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-1">
            You&apos;re ready to apply
          </h3>
          <p className="text-sm md:text-base text-gray-500 mb-4">
            Your profile looks great! We&apos;ve found some positions that match
            your experience and preferences. Take your time browsing —
            there&apos;s no rush.
          </p>

          <Link
            href="/dashboard/find-jobs"
            className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm min-h-[44px]"
          >
            View all jobs
            <HiArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
