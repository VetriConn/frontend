"use client";
import React from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineArrowLeft,
  HiOutlineBookmark,
  HiOutlineChevronRight,
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineHeart,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { Job } from "@/types/job";

type JobDescriptorProps = Job;

const tagColorMap: Record<string, string> = {
  flutter: "bg-blue-50 text-blue-700 border-blue-200",
  mobile: "bg-purple-50 text-purple-700 border-purple-200",
  ios: "bg-emerald-50 text-emerald-700 border-emerald-200",
  android: "bg-amber-50 text-amber-700 border-amber-200",
  dart: "bg-cyan-50 text-cyan-700 border-cyan-200",
  react: "bg-sky-50 text-sky-700 border-sky-200",
  web: "bg-rose-50 text-rose-700 border-rose-200",
};

const defaultTagColors = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-rose-50 text-rose-700 border-rose-200",
];

const fitCards = [
  {
    title: "Veteran-Friendly",
    description:
      "This employer actively recruits and supports Canadian veterans in their transition to civilian careers.",
  },
  {
    title: "Skills Match",
    description:
      "Your military experience and leadership skills align well with this role's requirements.",
  },
  {
    title: "Growth Opportunity",
    description:
      "This position offers career advancement paths and professional development programs.",
  },
  {
    title: "Benefits Package",
    description:
      "Comprehensive benefits including health, dental, pension matching, and transition support.",
  },
];

const JobDescriptor: React.FC<JobDescriptorProps> = ({
  id,
  role,
  company_name,
  company_logo,
  location,
  salary,
  salary_range,
  tags,
  full_description,
  responsibilities,
  qualifications,
  applicationLink,
}) => {
  const formatSalary = (salaryObj: {
    symbol: string;
    number?: number;
    currency: string;
  }) => {
    if (!salaryObj.number) return null;
    return `${salaryObj.symbol}${(salaryObj.number / 1000).toFixed(0)}K`;
  };

  const getSalaryDisplay = () => {
    if (
      salary_range?.start_salary?.number &&
      salary_range?.end_salary?.number
    ) {
      const start = formatSalary(salary_range.start_salary);
      const end = formatSalary(salary_range.end_salary);
      if (start && end) return `${start} – ${end}/year`;
    }
    if (salary?.number) {
      const formatted = formatSalary(salary);
      if (formatted) return `${formatted}/year`;
    }
    return null;
  };

  // Derive job type from tags if possible
  const jobTypeTags = [
    "Full-Time",
    "Part-Time",
    "Contract",
    "Freelance",
    "Internship",
  ];
  const derivedJobType =
    tags.find((t) =>
      jobTypeTags.some((jt) => jt.toLowerCase() === t.name.toLowerCase()),
    )?.name || "Full-Time";

  // Derive a category from the first tag or fallback
  const category = tags.length > 0 ? tags[0].name : "General";

  const salaryDisplay = getSalaryDisplay();

  const metaItems = [
    { icon: HiOutlineMapPin, label: location || "Canada" },
    { icon: HiOutlineBriefcase, label: derivedJobType },
    ...(salaryDisplay
      ? [{ icon: HiOutlineBanknotes, label: salaryDisplay }]
      : []),
    { icon: HiOutlineCalendarDays, label: "Posted recently" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 tablet:px-4 tablet:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <Link
            href="/dashboard/jobs"
            className="hover:text-gray-700 transition-colors no-underline text-gray-500"
          >
            Jobs
          </Link>
          <HiOutlineChevronRight className="text-xs text-gray-400" />
          <span className="text-gray-400">{category}</span>
          <HiOutlineChevronRight className="text-xs text-gray-400" />
          <span className="text-gray-700 font-medium truncate max-w-50">
            {role}
          </span>
        </nav>

        {/* Back link */}
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8 no-underline"
        >
          <HiOutlineArrowLeft className="text-base" />
          Back to all jobs
        </Link>

        {/* Two-column layout */}
        <div className="flex gap-8 items-start tablet:flex-col">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className={clsx(
                    "px-3 py-1 rounded-full text-xs font-semibold border",
                    tag.color && tagColorMap[tag.color]
                      ? tagColorMap[tag.color]
                      : defaultTagColors[i % defaultTagColors.length],
                  )}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight tablet:text-2xl">
              {role}
            </h1>

            {/* Company info */}
            <div className="flex items-center gap-3 mb-6">
              {company_logo && company_logo !== "/images/company-logo.jpg" ? (
                <img
                  src={company_logo}
                  alt={company_name}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <HiOutlineBuildingOffice2 className="text-lg text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {company_name}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <HiOutlineShieldCheck className="text-sm text-emerald-500" />
                  Trusted employer
                </p>
              </div>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-gray-200">
              {metaItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3.5 py-2"
                >
                  <item.icon className="text-base text-gray-400" />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>

            {/* About This Role */}
            {full_description && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  About This Role
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {full_description}
                </p>
              </section>
            )}

            {/* What You'll Do */}
            {responsibilities.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  What You&apos;ll Do
                </h2>
                <ul className="space-y-3">
                  {responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* What We're Looking For */}
            {qualifications.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  What We&apos;re Looking For
                </h2>
                <ul className="space-y-3">
                  {qualifications.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <HiOutlineCheckCircle className="text-lg text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Is This Job Right for You? */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Is This Job Right for You?
              </h2>
              <div className="grid grid-cols-2 gap-4 tablet:grid-cols-1">
                {fitCards.map((card, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-xl p-5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mb-3">
                      <HiOutlineHeart className="text-lg text-red-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="w-80 shrink-0 tablet:w-full">
            <div className="sticky top-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-bold text-gray-900 mb-5">
                  Job Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <HiOutlineBriefcase className="text-base text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Job Title</p>
                      <p className="text-sm font-medium text-gray-900">
                        {role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <HiOutlineBuildingOffice2 className="text-base text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Company</p>
                      <p className="text-sm font-medium text-gray-900">
                        {company_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <HiOutlineMapPin className="text-base text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {location || "Canada"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <HiOutlineCalendarDays className="text-base text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Job Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {derivedJobType}
                      </p>
                    </div>
                  </div>

                  {salaryDisplay && (
                    <div className="flex items-start gap-3">
                      <HiOutlineBanknotes className="text-base text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">
                          Pay Range
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {salaryDisplay}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                {applicationLink ? (
                  <a
                    href={applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors no-underline mb-3"
                  >
                    Apply Now
                    <HiOutlineArrowLeft className="rotate-180 text-base" />
                  </a>
                ) : (
                  <Link
                    href={`/jobs/${id}/apply`}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors no-underline mb-3"
                  >
                    Apply for this Job
                    <HiOutlineArrowLeft className="rotate-180 text-base" />
                  </Link>
                )}

                {/* Save Button */}
                <button className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 font-semibold text-sm py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer mb-6">
                  <HiOutlineBookmark className="text-base" />
                  Save Job
                </button>

                {/* Info notices */}
                <div className="space-y-3 pt-5 border-t border-gray-100">
                  <div className="flex items-start gap-2.5">
                    <HiOutlineCheckCircle className="text-base text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Complete your profile to increase your chances of getting
                      hired
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <HiOutlineCheckCircle className="text-base text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Be one of the first to apply — early applicants are 3x
                      more likely to get noticed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptor;
