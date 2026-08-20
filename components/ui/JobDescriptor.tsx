"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { HiBookmark } from "react-icons/hi2";
import { Job } from "@/types/job";
import { getMyApplications } from "@/lib/api";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { getInitials } from "@/lib/initials";
import { hasApplicationDraft } from "@/lib/applicationDrafts";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMyCompanies } from "@/hooks/useCompanies";
import { withReturnUrl } from "@/lib/auth-redirect";

import {
  formatJobSalary,
  getExternalApplyUrl,
  getSourceLabel,
  splitDescriptionParts,
} from "@/lib/job-display";

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

/**
 * Scraped descriptions arrive as bullet fragments joined with " | ", so they
 * rendered as one run-on paragraph full of pipes. Split them back into the
 * list the source meant; anything without separators stays a paragraph.
 */
const DescriptionBody = ({ text }: { text: string }) => {
  const parts = splitDescriptionParts(text);

  if (parts.length > 1) {
    return (
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600 leading-relaxed">
        {parts.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
      {text}
    </p>
  );
};

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
  source,
  source_name,
  external_url,
  salary_text,
  posted_as,
  company_id,
  poster_id,
}) => {
  const [hasApplied, setHasApplied] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const { isSaved, isMutating, toggleSaved } = useSavedJobs();
  const { userProfile, isLoading: profileLoading } = useUserProfile();

  // Applying is where an anonymous visitor becomes a member, so every route to
  // it is gated — including the redirect out to an external board, which would
  // otherwise send the visitor away before we ever knew who they were.
  const isSignedIn = Boolean(userProfile);
  const signUpToApplyHref = withReturnUrl("/signup", `/jobs/${id}/apply`);
  const { companies } = useMyCompanies();

  // You cannot apply to a job you posted, or one posted by a company you are
  // on the hiring team of. This replaces a check that disabled Apply for the
  // whole employer role — which no longer exists, and was always the wrong
  // question: the same person applies to other people's jobs all the time.
  const isOwnListing =
    (!!poster_id && poster_id === userProfile?.id) ||
    (!!company_id && companies.some((company) => company._id === company_id));

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      try {
        const applications = await getMyApplications();
        if (!isMounted) return;

        const alreadyApplied = applications.some((application) => {
          const jobRef = application.job_id;
          if (typeof jobRef === "string") {
            return jobRef === id;
          }
          return jobRef.id === id || jobRef._id === id;
        });

        setHasApplied(alreadyApplied);
      } catch {
        // ignore - unauthenticated users can still view the page
      }
    };

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function checkDraft() {
      try {
        const result = await hasApplicationDraft(id);
        if (!cancelled) {
          setHasDraft(result);
        }
      } catch (err) {
        console.error("Error checking draft:", err);
      }
    }
    checkDraft();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleToggleSave = async () => {
    if (isMutating(id)) return;
    try {
      await toggleSaved(id);
    } catch {
      // Silently fail — button state stays as-is
    }
  };

  // Aggregated listings carry the source's own salary wording, which is the
  // only form that can express hourly pay correctly.
  const getSalaryDisplay = () =>
    formatJobSalary({ salary, salary_range, salary_text });

  const externalApplyUrl = getExternalApplyUrl({
    source,
    source_name,
    external_url,
    applicationLink,
  });
  const sourceLabel = getSourceLabel({ source, source_name });

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
  const companyInitials = getInitials(company_name, "CO");

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
          <HiOutlineChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
          <span className="text-gray-400">{category}</span>
          <HiOutlineChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
          <span className="text-gray-700 font-medium truncate max-w-50">
            {role}
          </span>
        </nav>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
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
              {company_logo ? (
                <Image
                  src={company_logo}
                  alt={company_name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg object-contain border border-gray-200"
                  sizes="40px"
                  loading="lazy"
                  style={{ aspectRatio: '1' }}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {companyInitials || "CO"}
                  </span>
                </div>
              )}
              <div>
                {/* Only postings made under a vetted Company Page have a
                    profile to link to. Individual postings render as plain
                    text, as before. */}
                {posted_as === "company" && company_id ? (
                  <Link
                    href={`/companies/${company_id}`}
                    className="text-base font-semibold text-gray-900 hover:text-primary no-underline"
                  >
                    {company_name}
                  </Link>
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {company_name}
                  </p>
                )}
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <HiOutlineShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
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
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>

            {/* About This Role */}
            {full_description && (
              <section className="mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-3">
                  About This Role
                </h2>
                <DescriptionBody text={full_description} />
              </section>
            )}

            {/* What You'll Do */}
            {responsibilities.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
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
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
                  What We&apos;re Looking For
                </h2>
                <ul className="space-y-3">
                  {qualifications.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <HiOutlineCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 shrink-0 mt-0.5" />
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
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
                Is This Job Right for You?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {fitCards.map((card, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-xl p-5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mb-3">
                      <HiOutlineHeart className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                    </div>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
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
        <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-5">
          Job Summary
        </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <HiOutlineBriefcase className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Job Title</p>
                      <p className="text-sm font-medium text-gray-900">
                        {role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <HiOutlineBuildingOffice2 className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Company</p>
                      <p className="text-sm font-medium text-gray-900">
                        {company_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <HiOutlineMapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {location || "Canada"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <HiOutlineCalendarDays className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Job Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {derivedJobType}
                      </p>
                    </div>
                  </div>

                  {salaryDisplay && (
                    <div className="flex items-start gap-3">
                      <HiOutlineBanknotes className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 shrink-0" />
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

                {/* The application finishes on another site, so set that
                    expectation before the click — but neutrally, without
                    naming where the listing came from. */}
                {externalApplyUrl && (
                  <p className="text-xs text-gray-500 mb-2.5">
                    You&apos;ll complete your application on the
                    employer&apos;s website.
                  </p>
                )}

                {/* Apply Button */}
                {profileLoading ? (
                  // Held rather than guessed: rendering the signed-out label
                  // first and swapping it a moment later reads as a glitch.
                  <div
                    className="w-full h-11 rounded-lg bg-gray-100 animate-pulse mb-3"
                    aria-hidden="true"
                  />
                ) : !isSignedIn ? (
                  <Link
                    href={signUpToApplyHref}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors no-underline mb-3"
                  >
                    Sign up to apply
                    <HiOutlineArrowLeft className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
                  </Link>
                ) : isOwnListing ? (
                  <button
                    type="button"
                    disabled
                    className="flex items-center justify-center gap-2 w-full bg-gray-200 text-gray-600 font-semibold text-sm py-3 px-4 rounded-lg cursor-not-allowed mb-3"
                  >
                    You posted this job
                  </button>
                ) : externalApplyUrl ? (
                  <a
                    href={externalApplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors no-underline mb-3"
                  >
                    Apply Now
                    <HiOutlineArrowLeft className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
                  </a>
                ) : hasApplied ? (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full bg-gray-200 text-gray-600 font-semibold text-sm py-3 px-4 rounded-lg cursor-not-allowed mb-3"
                  >
                    Already Applied
                  </button>
                ) : (
                  <Link
                    href={`/jobs/${id}/apply`}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors no-underline mb-3"
                  >
                    {hasDraft ? "Continue Draft Application" : "Apply for this Job"}
                    <HiOutlineArrowLeft className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
                  </Link>
                )}

                {/* Save Button */}
                <button
                  onClick={handleToggleSave}
                  disabled={isMutating(id)}
                  className={clsx(
                    "flex items-center justify-center gap-2 w-full font-semibold text-sm py-3 px-4 rounded-lg transition-colors cursor-pointer mb-6",
                    isSaved(id)
                      ? "bg-primary/10 border border-primary text-primary hover:bg-primary/20"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
                    isMutating(id) && "opacity-60 cursor-not-allowed",
                  )}
                >
                  {isSaved(id) ? (
                    <HiBookmark className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <HiOutlineBookmark className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                  {isMutating(id)
                    ? "Saving..."
                    : isSaved(id)
                      ? "Job Saved"
                      : "Save Job"}
                </button>

                {/* Info notices */}
                <div className="space-y-3 pt-5 border-t border-gray-100">
                  <div className="flex items-start gap-2.5">
                    <HiOutlineCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Complete your profile to increase your chances of getting
                      hired
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <HiOutlineCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 shrink-0 mt-0.5" />
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
