"use client";

import Link from "next/link";
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineUserGroup,
  HiOutlineCheckBadge,
} from "react-icons/hi2";
import { useCompany } from "@/hooks/useCompanies";

/**
 * Public-facing company profile, linked from job listings posted under a
 * Company Page. Readable signed out — the endpoint uses optional auth.
 *
 * Contact details are deliberately limited to what a company published for
 * applicants; team membership is never shown here.
 */
export const CompanyProfile = ({ companyId }: { companyId: string }) => {
  const { company, isLoading, isError } = useCompany(companyId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
        <div className="h-32 bg-gray-100 rounded-xl animate-shimmer mb-6" />
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

  const location = [company.city, company.country].filter(Boolean).join(", ");

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      {company.banner_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={company.banner_url}
          alt=""
          className="w-full h-40 md:h-56 object-cover rounded-xl mb-6"
        />
      )}

      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <HiOutlineBuildingOffice2 className="w-8 h-8 text-gray-400" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {company.name}
            </h1>
            {company.status === "approved" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70">
                <HiOutlineCheckBadge className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            {company.industry && (
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineBuildingOffice2 className="w-4 h-4" />
                {company.industry}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineMapPin className="w-4 h-4" />
                {location}
              </span>
            )}
            {company.company_size && (
              <span className="inline-flex items-center gap-1.5">
                <HiOutlineUserGroup className="w-4 h-4" />
                {company.company_size}
              </span>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-primary"
              >
                <HiOutlineGlobeAlt className="w-4 h-4" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {company.about_company && (
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            About {company.name}
          </h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {company.about_company}
          </p>
        </section>
      )}
    </div>
  );
};

export default CompanyProfile;
