"use client";

import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import useSWR from "swr";
import { getEmployerJobs } from "@/lib/api";
import { useState, useMemo } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlinePlusCircle,
  HiOutlineBuildingOffice2,
  HiOutlineCalendar,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { formatDate } from "@/lib/date-utils";


// ─── Component ───────────────────────────────────────────────────────────────

const EmployerDashboard = () => {
  const { isLoading } = useUserProfile();
  const { data: jobs = [], isLoading: isJobsLoading } = useSWR(
    "employer-jobs-dashboard",
    getEmployerJobs,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const listings = jobs;
  const totalJobs = listings.length;
  const activePosts = listings.filter(
    (job) => job.status === "published",
  ).length;
  const totalApplications = listings.reduce(
    (sum, j) => sum + (j.application_count || 0),
    0,
  );
  const averageApplications =
    totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;

  // Pagination
  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const paginatedListings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return listings.slice(startIndex, startIndex + itemsPerPage);
  }, [listings, currentPage]);

  // Reset to page 1 when listings change
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalJobs, currentPage, totalPages]);

  const STATS = [
    { label: "Total Jobs", value: totalJobs, icon: HiOutlineDocumentText },
    {
      label: "Active Posts",
      value: activePosts,
      icon: HiOutlineBuildingOffice2,
    },
    {
      label: "Avg. Applications",
      value: averageApplications,
      icon: HiOutlineUserGroup,
    },
    {
      label: "Applications",
      value: totalApplications,
      icon: HiOutlineCalendar,
    },
  ];

  if (isLoading || isJobsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-200 mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg md:rounded-xl border border-gray-200 px-4 py-3 md:px-5 md:py-4 flex items-start justify-between"
            >
              <div>
                <p className="text-sm md:text-base text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className="w-5 h-5 text-primary mt-0.5" />
            </div>
          ))}
        </div>

        {/* Your Job Listings */}
        <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-3xl font-semibold text-gray-900">
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
          <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-1">
            No job listings yet
          </h3>
              <p className="text-sm md:text-base text-gray-500 max-w-xs mb-6">
                Create your first job posting to start connecting with
                experienced professionals.
              </p>
              <Link
                href="/dashboard/post-job"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                <HiOutlinePlusCircle className="w-4 h-4 md:w-5 md:h-5" />
                Create Your First Job
              </Link>
            </div>
          ) : (
            /* Table */
            <>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left font-medium text-gray-400 pl-4 pr-3 py-2.5">
                        Job Title
                      </th>
                      <th className="text-left font-medium text-gray-400 px-3 py-2.5">
                        Company
                      </th>
                      <th className="text-left font-medium text-gray-400 px-3 py-2.5">
                        Location
                      </th>
                      <th className="text-left font-medium text-gray-400 px-3 py-2.5">
                        Posted
                      </th>
                      <th className="text-right font-medium text-gray-400 pr-4 pl-3 py-2.5">
                        Applications
                      </th>
                      <th className="text-right font-medium text-gray-400 pr-4 pl-3 py-2.5">
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedListings.map((job) => (
                      <tr
                        key={job._id}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="pl-4 pr-3 py-3 font-medium text-gray-900">
                          {job.role}
                        </td>
                        <td className="px-3 py-3 text-gray-500">
                          {job.company_name}
                        </td>
                        <td className="px-3 py-3 text-gray-500">
                          {job.location || "Remote"}
                        </td>
                        <td className="px-3 py-3 text-gray-500">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="pr-4 pl-3 py-3 text-right text-gray-500">
                          {job.application_count || 0}
                        </td>
                        <td className="pr-4 pl-3 py-3 text-right">
                          {job.status === "published" ? (
                            <Link
                              href={`/jobs/${job._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary-hover font-medium"
                            >
                              <HiOutlineArrowTopRightOnSquare className="w-4 h-4 md:w-5 md:h-5" />
                              Public View
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400">Draft</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, listings.length)} of {listings.length} jobs
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px]"
                    >
                      <HiOutlineChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px]"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <HiOutlineChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Post New Job Button */}
              <div className="flex justify-end mt-4">
                <Link
                  href="/dashboard/post-job"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all shadow-sm group"
                >
                  <HiOutlinePlusCircle className="w-5 h-5 transition-transform group-hover:-rotate-45" />
                  Post a New Job
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
