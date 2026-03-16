"use client";

import React from "react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import {
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlinePlusCircle,
  HiOutlineBuildingOffice2,
} from "react-icons/hi2";

// ─── Types ───────────────────────────────────────────────────────────────────

type JobStatus = "under_review" | "live" | "rejected";

interface JobListing {
  id: string;
  title: string;
  category: string;
  type: string;
  status: JobStatus;
  views: number;
  applications: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_LISTINGS: JobListing[] = [
  {
    id: "1",
    title: "Security Guard",
    category: "Security",
    type: "Full-time",
    status: "under_review",
    views: 58,
    applications: 12,
  },
  {
    id: "2",
    title: "Office Assistant",
    category: "Administrative",
    type: "Part-time",
    status: "live",
    views: 62,
    applications: 11,
  },
  {
    id: "3",
    title: "Warehouse Associate",
    category: "Warehouse & Logistics",
    type: "Full-time",
    status: "rejected",
    views: 53,
    applications: 10,
  },
];

// ─── Status Badge ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; bg: string; text: string }
> = {
  under_review: {
    label: "Under Review",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  live: { label: "Live", bg: "bg-green-50", text: "text-green-700" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-600" },
};

function StatusBadge({ status }: { status: JobStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const EmployerDashboard = () => {
  const { isLoading } = useUserProfile();

  // In a real app these would come from an API
  const listings = MOCK_LISTINGS;
  const totalJobs = listings.length;
  const activePosts = listings.filter((j) => j.status === "live").length;
  const totalViews = listings.reduce((sum, j) => sum + j.views, 0);
  const totalApplications = listings.reduce(
    (sum, j) => sum + j.applications,
    0,
  );

  const STATS = [
    { label: "Total Jobs", value: totalJobs, icon: HiOutlineDocumentText },
    {
      label: "Active Posts",
      value: activePosts,
      icon: HiOutlineBuildingOffice2,
    },
    { label: "Total Views", value: totalViews, icon: HiOutlineEye },
    {
      label: "Applications",
      value: totalApplications,
      icon: HiOutlineUserGroup,
    },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-start justify-between"
            >
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className="w-5 h-5 text-gray-300 mt-0.5" />
            </div>
          ))}
        </div>

        {/* Your Job Listings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Job Listings
            </h2>
            <span className="text-sm text-gray-400">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {listings.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mb-5">
                <HiOutlineBriefcase className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                No job listings yet
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                Create your first job posting to start connecting with
                experienced professionals.
              </p>
              <Link
                href="/dashboard/employer/post-job"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                <HiOutlinePlusCircle className="w-4 h-4" />
                Create Your First Job
              </Link>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-400 pl-6 pr-3 py-2.5">
                      Job Title
                    </th>
                    <th className="text-left font-medium text-gray-400 px-3 py-2.5">
                      Category
                    </th>
                    <th className="text-left font-medium text-gray-400 px-3 py-2.5">
                      Type
                    </th>
                    <th className="text-left font-medium text-gray-400 px-3 py-2.5">
                      Status
                    </th>
                    <th className="text-right font-medium text-gray-400 px-3 py-2.5">
                      Views
                    </th>
                    <th className="text-right font-medium text-gray-400 pr-6 pl-3 py-2.5">
                      Applications
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="pl-6 pr-3 py-3 font-medium text-gray-900">
                        {job.title}
                      </td>
                      <td className="px-3 py-3 text-gray-500">
                        {job.category}
                      </td>
                      <td className="px-3 py-3 text-gray-500">{job.type}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-3 py-3 text-right text-gray-500">
                        {job.views}
                      </td>
                      <td className="pr-6 pl-3 py-3 text-right text-gray-500">
                        {job.applications}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
