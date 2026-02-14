"use client";
import React from "react";
import Link from "next/link";
import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineClock, HiCurrencyDollar } from "react-icons/hi";

// Dummy data for recommended jobs (will be replaced with API call to /recommended-jobs)
const DUMMY_RECOMMENDED_JOBS = [
  {
    id: "1",
    role: "Customer Service Representative",
    company_name: "TechSupport Solutions",
    location: "Remote",
    work_type: "Part-time, Flexible hours",
    salary_range: "$18 - $22 per hour",
  },
  {
    id: "2",
    role: "Administrative Assistant",
    company_name: "Community Health Center",
    location: "Austin, TX",
    work_type: "Part-time, 20 hrs/week",
    salary_range: "$20 - $25 per hour",
  },
  {
    id: "3",
    role: "Retail Associate",
    company_name: "Home & Garden Co.",
    location: "Denver, CO",
    work_type: "Flexible schedule",
    salary_range: "$16 - $19 per hour",
  },
  {
    id: "4",
    role: "Virtual Tutor",
    company_name: "LearnBright Academy",
    location: "Remote",
    work_type: "Part-time, Set your hours",
    salary_range: "$25 - $35 per hour",
  },
  {
    id: "5",
    role: "Data Entry Specialist",
    company_name: "DataFlow Inc.",
    location: "Remote",
    work_type: "Part-time, Flexible",
    salary_range: "$17 - $21 per hour",
  },
  {
    id: "6",
    role: "Bookkeeper",
    company_name: "Small Business Services",
    location: "Chicago, IL",
    work_type: "Part-time, 15 hrs/week",
    salary_range: "$22 - $28 per hour",
  },
  {
    id: "7",
    role: "Customer Support Agent",
    company_name: "Online Retail Co.",
    location: "Remote",
    work_type: "Full-time, Shifts available",
    salary_range: "$18 - $24 per hour",
  },
  {
    id: "8",
    role: "Technical Writer",
    company_name: "SoftDocs LLC",
    location: "Remote",
    work_type: "Contract, Flexible",
    salary_range: "$30 - $40 per hour",
  },
];

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
        <h3 className="font-semibold text-gray-900 mb-3 leading-tight">{role}</h3>
        
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <HiOutlineBriefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{company_name}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <HiOutlineLocationMarker className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <HiOutlineClock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{work_type}</span>
        </div>
        
        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-4">
          <HiCurrencyDollar className="w-4 h-4 flex-shrink-0" />
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
  // TODO: Replace with actual API call to /recommended-jobs
  // const { data, isLoading, error } = useSWR('/recommended-jobs', fetchRecommendedJobs);
  
  const jobs = DUMMY_RECOMMENDED_JOBS;
  const isLoading = false;

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
        <h2 className="text-lg font-semibold text-gray-900">Recommended for you</h2>
      </div>
      <p className="text-gray-500 text-sm mb-6 ml-[52px]">Jobs matching your skills and preferences</p>
      
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
