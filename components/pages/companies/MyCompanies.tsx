"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePauseCircle,
  HiOutlinePlus,
} from "react-icons/hi2";
import { useMyCompanies } from "@/hooks/useCompanies";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getMyRole, type Company, type CompanyStatus } from "@/lib/api";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

const STATUS_META: Record<
  CompanyStatus,
  {
    label: string;
    pill: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "Awaiting review",
    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70",
    icon: HiOutlineClock,
  },
  approved: {
    label: "Approved",
    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70",
    icon: HiOutlineCheckCircle,
  },
  rejected: {
    label: "Not approved",
    pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/70",
    icon: HiOutlineXCircle,
  },
  suspended: {
    label: "Suspended",
    pill: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
    icon: HiOutlinePauseCircle,
  },
};

/** Article included, since "an Recruiter" is what naive logic produces. */
const ROLE_DESCRIPTION: Record<string, string> = {
  owner: "the Owner",
  admin: "an Admin",
  recruiter: "a Recruiter",
};

const CompanyCard = ({
  company,
  userId,
}: {
  company: Company;
  userId?: string;
}) => {
  const meta = STATUS_META[company.status];
  const StatusIcon = meta.icon;
  const role = getMyRole(company, userId);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {company.logo_url ? (
            // Company logos come from Cloudinary at arbitrary sizes.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <HiOutlineBuildingOffice2 className="w-6 h-6 text-gray-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {company.name}
            </h2>
            <span
              className={clsx(
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                meta.pill,
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {meta.label}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            {[company.industry, [company.city, company.country].filter(Boolean).join(", ")]
              .filter(Boolean)
              .join(" · ") || "No details added yet"}
          </p>

          {role && (
            <p className="text-xs text-gray-400 mt-1">
              You are {ROLE_DESCRIPTION[role]}
            </p>
          )}

          {company.status === "rejected" && company.rejection_reason && (
            <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg p-3">
              <p className="text-xs font-medium text-rose-700 mb-0.5">
                Why this wasn&apos;t approved
              </p>
              <p className="text-xs text-rose-600">
                {company.rejection_reason}
              </p>
            </div>
          )}

          {company.status === "pending" && (
            <p className="text-xs text-gray-500 mt-3">
              An admin is reviewing this. You can post jobs as a company once
              it&apos;s approved — posting as yourself still works in the
              meantime.
            </p>
          )}

          {company.status === "approved" && (
            <Link
              href={`/dashboard/companies/${company._id}`}
              className="inline-block mt-3 text-sm text-primary font-medium hover:underline no-underline"
            >
              Manage company →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export const MyCompanies = () => {
  const { companies, isLoading, isError, error } = useMyCompanies();
  const { userProfile } = useUserProfile();

  if (isLoading) return <DashboardSkeleton />;

  // The server rejects a second application while one is pending or approved,
  // so only offer the CTA when there's genuinely nothing in flight.
  const hasBlockingApplication = companies.some(
    (c) => c.status === "pending" || c.status === "approved",
  );

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Companies
        </h1>
        {!hasBlockingApplication && (
          <Link
            href="/dashboard/companies/apply"
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Apply for a Company Page
          </Link>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Hire as an organisation, with teammates who can review applicants
        without sharing your account.
      </p>

      {isError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-red-700">
            {error instanceof Error
              ? error.message
              : "We couldn't load your companies."}
          </p>
        </div>
      )}

      {!isError && companies.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <HiOutlineBuildingOffice2 className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            You&apos;re not part of a company yet
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Apply for a Company Page to hire as an organisation, or ask a
            colleague to invite you to theirs. You can keep posting jobs as
            yourself either way.
          </p>
          <Link
            href="/dashboard/companies/apply"
            className="inline-block py-2.5 px-5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline"
          >
            Apply for a Company Page
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {companies.map((company) => (
          <CompanyCard
            key={company._id}
            company={company}
            userId={userProfile?.id}
          />
        ))}
      </div>
    </div>
  );
};

export default MyCompanies;
