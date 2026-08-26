"use client";

import Link from "next/link";
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineUserGroup,
  HiOutlineCheckBadge,
  HiOutlineBriefcase,
  HiOutlineEnvelope,
  HiOutlineArrowRight,
  HiOutlineCalendarDays,
  HiOutlineIdentification,
} from "react-icons/hi2";
import { useCompany, usePublicCompanyJobs } from "@/hooks/useCompanies";
import { safeHttpUrl } from "@/lib/safe-url";
import { fieldLabel, JOB_TYPE_LABELS, INDUSTRY_LABELS } from "@/lib/job-fields";

/**
 * Public company profile — the organisation's page on Vetriconn, the way a
 * person has a profile: identity header over a banner, an About section, the
 * roles they're hiring for, and an at-a-glance overview.
 *
 * Readable signed out (the endpoint uses optional auth). Contact details are
 * limited to what the company published for applicants; team membership is
 * never shown here.
 */

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const SectionCard = ({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <section className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="inline-flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Detail = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: React.ReactNode;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
};

export const CompanyProfile = ({ companyId }: { companyId: string }) => {
  const { company, isLoading, isError } = useCompany(companyId);
  const {
    jobs,
    total: jobsTotal,
    hasMore,
    loadMore,
    isLoadingMore,
    isLoading: jobsLoading,
  } = usePublicCompanyJobs(companyId);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="h-40 md:h-56 bg-gray-100 rounded-xl animate-shimmer mb-6" />
        <div className="h-6 w-64 bg-gray-100 rounded animate-shimmer mb-3" />
        <div className="h-4 w-96 bg-gray-100 rounded animate-shimmer" />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Company not found
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            This company page may have been removed, or the link may be wrong.
          </p>
          <Link
            href="/jobs"
            className="text-primary font-medium hover:underline no-underline"
          >
            ← Browse jobs
          </Link>
        </div>
      </div>
    );
  }

  const location = [company.city, company.state_province, company.country]
    .filter(Boolean)
    .join(", ");
  const website = safeHttpUrl(company.website);
  const industry =
    fieldLabel(INDUSTRY_LABELS, company.industry) ?? company.industry;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      {/* ── Identity header ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary/10 via-red-50 to-gray-50 relative">
          {company.banner_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.banner_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="px-5 md:px-8 pb-6">
          {/* Logo overlapping the banner, the way a profile photo does */}
          <div className="-mt-12 md:-mt-16 mb-4">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                {company.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logo_url}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HiOutlineBuildingOffice2 className="w-10 h-10 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {company.name}
                </h1>
                {company.status === "approved" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70">
                    <HiOutlineCheckBadge className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>

              {company.tagline && (
                <p className="text-sm md:text-base text-gray-600 mt-1.5">
                  {company.tagline}
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 mt-3">
                {industry && (
                  <span className="inline-flex items-center gap-1.5">
                    <HiOutlineBuildingOffice2 className="w-4 h-4" />
                    {industry}
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5">
                    <HiOutlineMapPin className="w-4 h-4" />
                    {location}
                  </span>
                )}
                {company.size && (
                  <span className="inline-flex items-center gap-1.5">
                    <HiOutlineUserGroup className="w-4 h-4" />
                    {company.size} employees
                  </span>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <HiOutlineGlobeAlt className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {jobs.length > 0 && (
              <a
                href="#open-roles"
                className="shrink-0 inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors no-underline"
              >
                <HiOutlineBriefcase className="w-4 h-4" />
                See {jobsTotal} open {jobsTotal === 1 ? "role" : "roles"}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── About ───────────────────────────────────────────────────────── */}
      {company.about_company && (
        <SectionCard title={`About ${company.name}`} icon={HiOutlineIdentification}>
          <p className="text-sm md:text-base text-gray-600 whitespace-pre-line leading-relaxed">
            {company.about_company}
          </p>
        </SectionCard>
      )}

      {/* ── Open roles ──────────────────────────────────────────────────── */}
      <div id="open-roles">
        <SectionCard
          title="Open roles"
          icon={HiOutlineBriefcase}
          action={
            jobs.length > 0 ? (
              <span className="text-xs font-semibold text-gray-500 tabular-nums">
                {jobsTotal} open
              </span>
            ) : undefined
          }
        >
          {jobsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-shimmer" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-gray-500">
              {company.name} has no open roles right now.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 -my-2">
              {jobs.map((job) => (
                <li key={job._id}>
                  <Link
                    href={`/jobs/${job.id || job._id}`}
                    className="group flex items-center gap-4 py-3.5 no-underline"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0">
                      <HiOutlineBriefcase className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                        {job.role}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                        {job.location && <span>{job.location}</span>}
                        {job.job_type && (
                          <span>
                            {fieldLabel(JOB_TYPE_LABELS, job.job_type) ??
                              job.job_type}
                          </span>
                        )}
                        {job.createdAt && (
                          <span>Posted {formatDate(job.createdAt)}</span>
                        )}
                      </div>
                    </div>
                    <HiOutlineArrowRight className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {isLoadingMore ? "Loading…" : "Show more roles"}
              </button>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      <SectionCard title="Overview" icon={HiOutlineBuildingOffice2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Detail
            icon={HiOutlineBuildingOffice2}
            label="Industry"
            value={industry}
          />
          <Detail
            icon={HiOutlineUserGroup}
            label="Company size"
            value={company.size ? `${company.size} employees` : undefined}
          />
          <Detail icon={HiOutlineMapPin} label="Location" value={location} />
          <Detail
            icon={HiOutlineGlobeAlt}
            label="Website"
            value={
              website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {website.replace(/^https?:\/\//, "")}
                </a>
              ) : undefined
            }
          />
          <Detail
            icon={HiOutlineEnvelope}
            label="Contact"
            value={
              company.email ? (
                <a
                  href={`mailto:${company.email}`}
                  className="text-primary hover:underline break-all"
                >
                  {company.email}
                </a>
              ) : undefined
            }
          />
          <Detail
            icon={HiOutlineCalendarDays}
            label="On Vetriconn since"
            value={formatDate(company.createdAt)}
          />
        </div>
      </SectionCard>
    </div>
  );
};

export default CompanyProfile;
