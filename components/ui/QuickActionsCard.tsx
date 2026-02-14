"use client";
import React from "react";
import Link from "next/link";
import { HiOutlineBriefcase } from "react-icons/hi";
import {
  HiOutlineCog6Tooth,
  HiOutlineHeart,
  HiOutlineChevronRight,
} from "react-icons/hi2";

interface QuickAction {
  label: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
}

interface QuickActionsCardProps {
  appliedJobsCount?: number;
  savedJobsCount?: number;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  appliedJobsCount = 0,
  savedJobsCount = 0,
}) => {
  const appliedSubtitle =
    appliedJobsCount > 0
      ? `${appliedJobsCount} application${appliedJobsCount === 1 ? "" : "s"}`
      : "No jobs applied for yet";

  const savedSubtitle =
    savedJobsCount > 0
      ? `${savedJobsCount} saved job${savedJobsCount === 1 ? "" : "s"}`
      : "No saved jobs yet";

  const quickActions: QuickAction[] = [
    {
      label: "Account settings",
      subtitle: "Update your information",
      href: "/dashboard/settings",
      icon: <HiOutlineCog6Tooth className="w-5 h-5 text-red-500" />,
    },
    {
      label: "View applied jobs",
      subtitle: appliedSubtitle,
      href: "/dashboard/applied-jobs",
      icon: <HiOutlineBriefcase className="w-5 h-5 text-red-500" />,
    },
    {
      label: "Saved jobs",
      subtitle: savedSubtitle,
      href: "/dashboard/saved-jobs",
      icon: <HiOutlineHeart className="w-5 h-5 text-red-500" />,
    },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hidden lg:block">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>

        <div className="space-y-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              aria-label={action.label}
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-900 block group-hover:text-red-600 transition-colors">
                  {action.label}
                </span>
                <span className="text-xs text-gray-500">{action.subtitle}</span>
              </div>
              <HiOutlineChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
