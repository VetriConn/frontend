"use client";
import React from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiCurrencyDollar,
} from "react-icons/hi";
import { getRecommendedJobs } from "@/lib/api";

interface RecommendedJobCardProps {
  id: string;
  role: string;
  company_name: string;
  location: string;
  work_type: string;
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 leading-tight">
          {role}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <HiOutlineBriefcase className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{company_name}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <HiOutlineLocationMarker className="w-4 h-4 text-gray-400 shrink-0" />
          <span>{location}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <HiOutlineClock className="w-4 h-4 text-gray-400 shrink-0" />
          <span>{work_type}</span>
        </div>

        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-4">
          <HiCurrencyDollar className="w-4 h-4 shrink-0" />
          <span>{salary_range}</span>
        </div>
      </div>

      <Link
        href={`/jobs/${id}`}
        className="block w-full bg-primary text-white text-center py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
      >
        Apply Now
      </Link>
    </div>
  );
};

export const RecommendedJobs: React.FC = () => {
  const { data, isLoading } = useSWR("/jobs/recommended", getRecommendedJobs);

  const jobs: RecommendedJobCardProps[] = (data || []).map((job) => {
    const salaryRange = job.salary_range?.start_salary?.number
      ? `${job.salary?.symbol || "$"}${Math.round((job.salary_range.start_salary.number || 0) / 1000)}k - ${job.salary?.symbol || "$"}${Math.round((job.salary_range.end_salary.number || 0) / 1000)}k`
      : job.salary?.number
        ? `${job.salary.symbol}${Math.round(job.salary.number / 1000)}k`
        : "Competitive";

    return {
      id: job.id || job._id,
      role: job.role,
      company_name: job.company_name,
      location: job.location || "Canada",
      work_type: "Flexible",
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
          <HiOutlineBriefcase className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Recommended for you
        </h2>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-13">
        Jobs matching your skills and preferences
      </p>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {jobs.map((job) => (
          <RecommendedJobCard key={job.id} {...job} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedJobs;
