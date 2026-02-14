"use client";
import React from "react";
import Link from "next/link";
import { HiOutlineUser, HiArrowRight } from "react-icons/hi";

interface CompleteProfileCardProps {
  completed: number;
  total: number;
  percentage: number;
}

export const CompleteProfileCard: React.FC<CompleteProfileCardProps> = ({
  completed,
  total,
  percentage,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <HiOutlineUser className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Complete your profile
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            A complete profile helps employers find you faster and match you
            with the right opportunities.
          </p>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {completed} of {total} steps complete
            </span>
            <span className="text-sm font-semibold text-primary">
              {percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
          >
            Complete my profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ReadyToApplyCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-primary"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            You&apos;re ready to apply
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Your profile looks great! We&apos;ve found some positions that match
            your experience and preferences. Take your time browsing —
            there&apos;s no rush.
          </p>

          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 border border-primary text-primary px-5 py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm"
          >
            View all jobs
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
