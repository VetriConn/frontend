"use client";

import React from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
} from "react-icons/hi2";

interface JobResultCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  description: string;
  onApply?: (id: string) => void;
}

export const JobResultCard = ({
  id,
  title,
  company,
  location,
  jobType,
  salary,
  description,
  onApply,
}: JobResultCardProps) => {
  const router = useRouter();

  const handleApplyClick = () => {
    if (onApply) {
      onApply(id);
    } else {
      router.push(`/jobs/${id}`);
    }
  };

  return (
    <article
      className={clsx(
        "bg-white border border-gray-200 rounded-xl p-4 sm:p-6",
        "transition-shadow duration-200 hover:shadow-md",
        "flex flex-col gap-4"
      )}
      aria-labelledby={`job-title-${id}`}
    >
      {/* Job Info Section */}
      <div className="flex-1 min-w-0">
        {/* Job Title - h3 for proper hierarchy under page h1 and section h2 */}
        <h3
          id={`job-title-${id}`}
          className="font-semibold text-lg text-gray-900 mb-3"
        >
          {title}
        </h3>

        {/* Job Meta Info - Stack on mobile, wrap on larger screens */}
        <dl className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-4 sm:gap-y-2 mb-3 text-sm text-gray-600">
          {/* Company */}
          <div className="flex items-center gap-1.5 min-h-[24px]">
            <dt className="sr-only">Company</dt>
            <HiOutlineBuildingOffice2
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              aria-hidden="true"
            />
            <dd>{company}</dd>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 min-h-[24px]">
            <dt className="sr-only">Location</dt>
            <HiOutlineMapPin
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              aria-hidden="true"
            />
            <dd>{location}</dd>
          </div>

          {/* Job Type */}
          <div className="flex items-center gap-1.5 min-h-[24px]">
            <dt className="sr-only">Job Type</dt>
            <HiOutlineBriefcase
              className="w-4 h-4 text-gray-400 flex-shrink-0"
              aria-hidden="true"
            />
            <dd>{jobType}</dd>
          </div>

          {/* Salary */}
          {salary && (
            <div className="flex items-center gap-1.5 min-h-[24px]">
              <dt className="sr-only">Salary</dt>
              <HiOutlineCurrencyDollar
                className="w-4 h-4 text-primary flex-shrink-0"
                aria-hidden="true"
              />
              <dd className="text-primary font-medium">{salary}</dd>
            </div>
          )}
        </dl>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>

      {/* Apply Button Section - Full width on mobile, auto width on desktop */}
      <div className="flex-shrink-0 md:self-start">
        <button
          type="button"
          onClick={handleApplyClick}
          className="btn-primary w-full md:w-auto whitespace-nowrap min-h-[48px]"
          aria-label={`Apply now for ${title} at ${company}`}
        >
          Apply Now
        </button>
      </div>
    </article>
  );
};

export default JobResultCard;
