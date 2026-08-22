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
  HiOutlineAcademicCap,
  HiOutlineGlobeAlt,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineIdentification,
} from "react-icons/hi2";
import { HiBookmark, HiHeart } from "react-icons/hi2";
import { Job } from "@/types/job";
import { getMyApplications } from "@/lib/api";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { getInitials } from "@/lib/initials";
import { hasApplicationDraft } from "@/lib/applicationDrafts";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMyCompanies } from "@/hooks/useCompanies";
import { withReturnUrl } from "@/lib/auth-redirect";
import { useRouter } from "next/navigation";
import { useToaster } from "@/components/ui/Toaster";

import {
  fieldLabel,
  JOB_TYPE_LABELS,
  INDUSTRY_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_ARRANGEMENT_LABELS,
  WORK_SCHEDULE_LABELS,
  PHYSICAL_DEMAND_LABELS,
  MIN_QUALIFICATION_LABELS,
  SECURITY_CLEARANCE_LABELS,
  LANGUAGE_LABELS,
  BENEFIT_LABELS,
} from "@/lib/job-fields";
import {
  JOB_TAG_CLASS,
  jobChipLabels,
  formatTagLabel,
  formatJobSalary,
  getExternalApplyUrl,
  getSourceLabel,
  splitDescriptionParts,
} from "@/lib/job-display";

type JobDescriptorProps = Job;


/**
 * Two kinds of description reach this page. Jobs posted through the builder
 * carry a rich-text Brief as HTML — the server already stripped it down to a
 * safe formatting subset on write, so it's safe to render directly. Scraped
 * descriptions arrive as bullet fragments joined with " | ", which rendered as
 * one run-on paragraph full of pipes; those get split back into the list the
 * source meant. Anything else stays a plain paragraph.
 */
const DescriptionBody = ({ text }: { text: string }) => {
  const looksLikeHtml = /<\/?(p|ul|ol|li|br|strong|b|em|i|u|a)\b/i.test(text);
  if (looksLikeHtml) {
    return (
      <div
        className="rich-text text-sm text-gray-600 leading-relaxed"
        // Safe: sanitized server-side to a small formatting allowlist.
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

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
  job_category,
  job_type,
  work_arrangement,
  experience_level,
  skills,
  physical_demands,
  work_schedule,
  payment_type,
  min_qualification,
  security_clearance,
  requires_drivers_license,
  visa_sponsorship,
  languages,
  certifications,
  benefits,
  openings,
  application_deadline,
  start_date,
  veteran_friendly,
  accommodations_offered,
  physically_accessible,
  open_to_returners,
  screening_questions,
  faqs,
  hiring_stages,
}) => {
  const [hasApplied, setHasApplied] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const { isSaved, isMutating, toggleSaved } = useSavedJobs();
  const { userProfile, isLoading: profileLoading } = useUserProfile();
  const router = useRouter();
  const { showToast } = useToaster();

  // Applying is where an anonymous visitor becomes a member, so every route to
  // it is gated — including the redirect out to an external board, which would
  // otherwise send the visitor away before we ever knew who they were.
  const isSignedIn = Boolean(userProfile);
  // Sign in, not sign up: most people hitting this already have an account,
  // and the sign-in page carries the return URL through to sign-up for the
  // ones who do not — so the job survives either route.
  const signInToApplyHref = withReturnUrl("/signin", `/jobs/${id}/apply`);
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

    // Saving is for your own account, so it needs one.
    if (!isSignedIn) {
      router.push(withReturnUrl("/signin", `/jobs/${id}`));
      return;
    }

    try {
      await toggleSaved(id);
    } catch (err) {
      // This used to swallow every failure, so a save that did not work looked
      // exactly like one that did — which is how a real bug went unnoticed:
      // the button did nothing and said nothing.
      showToast({
        type: "error",
        title: "Couldn't save this job",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    }
  };

  // Aggregated listings carry the source's own salary wording, which is the
  // only form that can express hourly pay correctly.
  const getSalaryDisplay = () =>
    formatJobSalary({ salary, salary_range, salary_text, payment_type });

  const externalApplyUrl = getExternalApplyUrl({
    source,
    source_name,
    external_url,
    applicationLink,
  });
  const sourceLabel = getSourceLabel({ source, source_name });

  // Straight column reads. This used to scan tags against a hardcoded list
  // and default to "Full-Time" — inventing a fact for any listing that
  // didn't state one. Absent renders as nothing.
  const jobTypeLabel = fieldLabel(JOB_TYPE_LABELS, job_type);
  const category =
    fieldLabel(INDUSTRY_LABELS, job_category) ??
    (tags.length > 0 ? formatTagLabel(tags[0].name) : "General");

  const salaryDisplay = getSalaryDisplay();
  const companyInitials = getInitials(company_name, "CO");

  // Skills arrive as one free-text field; each entry gets its own line.
  const skillItems = (skills ?? "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const experienceRequirement = experience_level
    ? `${fieldLabel(EXPERIENCE_LEVEL_LABELS, experience_level)} experience`
    : null;

  // Structured multi-value fields from the job builder.
  const languageLabels = (languages ?? [])
    .map((code) => LANGUAGE_LABELS[code])
    .filter(Boolean);
  const benefitLabels = (benefits ?? [])
    .map((code) => BENEFIT_LABELS[code])
    .filter(Boolean);
  const certificationItems = (certifications ?? []).filter(Boolean);

  // Phase-2 public content.
  const hiringStages = (hiring_stages ?? []).filter(Boolean);
  const faqItems = (faqs ?? []).filter((f) => f.question && f.answer);
  const screeningCount = (screening_questions ?? []).length;

  const formatDate = (value?: string) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // The "Is this job right for you?" cards. Each maps to a real attribute the
  // employer set, so the heart only lights up when the job genuinely meets that
  // criterion — no invented promises.
  const fitCards = [
    {
      title: "Veteran-Friendly",
      description:
        "This employer welcomes and values military experience in their hiring.",
      lit: Boolean(veteran_friendly),
    },
    {
      title: "Open to Returners",
      description:
        "A good fit if you're re-entering the workforce after a career break.",
      lit: Boolean(open_to_returners),
    },
    {
      title: "Accessible & Accommodating",
      description:
        "Offers workplace accommodations and a physically accessible workplace.",
      lit: Boolean(accommodations_offered) || Boolean(physically_accessible),
    },
    {
      title: "Benefits Package",
      description: "Comes with benefits and perks beyond the base pay.",
      lit: (benefits?.length ?? 0) > 0,
    },
  ];

  const metaItems = [
    { icon: HiOutlineMapPin, label: location || "Canada" },
    ...(jobTypeLabel ? [{ icon: HiOutlineBriefcase, label: jobTypeLabel }] : []),
    ...(salaryDisplay
      ? [{ icon: HiOutlineBanknotes, label: salaryDisplay }]
      : []),
    { icon: HiOutlineCalendarDays, label: "Posted recently" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 tablet:px-4 tablet:py-6">
        {/* Breadcrumb — sticks to the top so it stays while the details scroll.
            Its background matches the page, so content slides seamlessly under. */}
        <nav className="sticky top-0 z-20 flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 py-3 -mx-6 px-6 tablet:-mx-4 tablet:px-4 mb-4">
          <Link
            href="/jobs"
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

        {/* Two-column layout. No items-start: the columns stretch to equal
            height so the sidebar's sticky card has room to hold as you scroll —
            only the details column actually moves. */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {jobChipLabels({ tags, job_category, job_type, work_arrangement }).map(
                (chip) => (
                  <span key={chip} className={JOB_TAG_CLASS}>
                    {chip}
                  </span>
                ),
              )}
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

            {/* What We're Looking For — the structured requirements, plus
                any free-form qualification bullets. Experience and skills
                used to be smuggled into qualifications[] as raw slugs, so
                this section opened with a bullet reading "mid". */}
            {(qualifications.length > 0 ||
              experience_level ||
              skillItems.length > 0 ||
              certificationItems.length > 0) && (
              <section className="mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
                  What We&apos;re Looking For
                </h2>
                <ul className="space-y-3">
                  {experienceRequirement && (
                    <li className="flex items-start gap-3">
                      <HiOutlineCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        {experienceRequirement}
                      </span>
                    </li>
                  )}
                  {[...skillItems, ...qualifications, ...certificationItems].map(
                    (item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <HiOutlineCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </section>
            )}

            {/* Benefits & Perks */}
            {benefitLabels.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
                  Benefits &amp; Perks
                </h2>
                <div className="flex flex-wrap gap-2">
                  {benefitLabels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary"
                    >
                      <HiOutlineSparkles className="w-4 h-4" />
                      {label}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Hiring Process */}
            {hiringStages.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
                  Hiring Process
                </h2>
                <ol className="space-y-3">
                  {hiringStages.map((stage, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700">{stage}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Screening note — the questions themselves are answered at apply
                time, so here we just set the expectation. */}
            {screeningCount > 0 && (
              <div className="mb-8 flex items-start gap-2.5 rounded-xl border border-gray-200 bg-white p-4">
                <HiOutlineCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  This role has {screeningCount} quick screening{" "}
                  {screeningCount === 1 ? "question" : "questions"} you&apos;ll
                  answer when you apply.
                </p>
              </div>
            )}

            {/* FAQs */}
            {faqItems.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {faqItems.map((faq, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-gray-900 list-none">
                        {faq.question}
                        <HiOutlineChevronRight className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-90" />
                      </summary>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
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
                    className={`rounded-xl border p-5 transition-colors ${
                      card.lit
                        ? "bg-white border-primary/30"
                        : "bg-gray-50/60 border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                        card.lit ? "bg-red-50" : "bg-gray-100"
                      }`}
                    >
                      {card.lit ? (
                        <HiHeart
                          className="w-5 h-5 md:w-6 md:h-6 text-primary"
                          aria-label="Meets this criterion"
                        />
                      ) : (
                        <HiOutlineHeart className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
                      )}
                    </div>
                    <h3
                      className={`text-lg md:text-2xl font-bold mb-1 ${
                        card.lit ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {card.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${
                        card.lit ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar — sticky just below the sticky breadcrumb, so the Job
              Summary stays in view while only the details column scrolls. */}
          <div className="w-80 shrink-0 tablet:w-full">
            <div className="sticky top-16">
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

                  {jobTypeLabel && (
                    <div className="flex items-start gap-3">
                      <HiOutlineCalendarDays className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Job Type</p>
                        <p className="text-sm font-medium text-gray-900">
                          {jobTypeLabel}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* The structured conditions the form collects — the
                      details this audience actually filters a job on. */}
                  {(
                    [
                      {
                        icon: HiOutlineBriefcase,
                        label: "Work Arrangement",
                        value: fieldLabel(
                          WORK_ARRANGEMENT_LABELS,
                          work_arrangement,
                        ),
                      },
                      {
                        icon: HiOutlineCalendarDays,
                        label: "Work Schedule",
                        value: fieldLabel(WORK_SCHEDULE_LABELS, work_schedule),
                      },
                      {
                        icon: HiOutlineBriefcase,
                        label: "Physical Demands",
                        value: fieldLabel(
                          PHYSICAL_DEMAND_LABELS,
                          physical_demands,
                        ),
                      },
                      {
                        icon: HiOutlineAcademicCap,
                        label: "Minimum Education",
                        value: fieldLabel(
                          MIN_QUALIFICATION_LABELS,
                          min_qualification,
                        ),
                      },
                      {
                        icon: HiOutlineShieldCheck,
                        label: "Security Clearance",
                        value: fieldLabel(
                          SECURITY_CLEARANCE_LABELS,
                          security_clearance,
                        ),
                      },
                      {
                        icon: HiOutlineGlobeAlt,
                        label: "Languages",
                        value: languageLabels.join(", "),
                      },
                      {
                        icon: HiOutlineIdentification,
                        label: "Driver's Licence",
                        value: requires_drivers_license ? "Required" : "",
                      },
                      {
                        icon: HiOutlineUserGroup,
                        label: "Openings",
                        value: openings ? String(openings) : "",
                      },
                      {
                        icon: HiOutlineClock,
                        label: "Application Deadline",
                        value: formatDate(application_deadline),
                      },
                      {
                        icon: HiOutlineCalendarDays,
                        label: "Expected Start",
                        value: formatDate(start_date),
                      },
                    ] as {
                      icon: React.ComponentType<{ className?: string }>;
                      label: string;
                      value: string;
                    }[]
                  )
                    .filter((row) => Boolean(row.value))
                    .map((row) => (
                      <div key={row.label} className="flex items-start gap-3">
                        <row.icon className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">
                            {row.label}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {row.value}
                          </p>
                        </div>
                      </div>
                    ))}

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
                    href={signInToApplyHref}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors no-underline mb-3"
                  >
                    Sign in to apply
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
