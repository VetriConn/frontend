"use client";

import { useState, useMemo } from "react";
import type { ApplicationItem } from "@/types/api";
import { ListLoadError } from "@/components/ui/ListLoadError";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getReceivedApplications, updateApplicationStatus } from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineDocumentArrowDown,
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineEye,
  HiOutlineFlag,
} from "react-icons/hi2";
import { formatDate } from "@/lib/date-utils";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Pagination } from "@/components/ui/Pagination";
import KebabMenu, {
  type KebabAction,
} from "@/components/pages/admin/KebabMenu";

/** Applicants per page. The endpoint caps at MAX_PAGE_SIZE (100). */
const APPLICATIONS_PER_PAGE = 25;

function ApplicationStatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-50 text-green-700">
        Accepted
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-50 text-red-700">
        Rejected
      </span>
    );
  }

  if (status === "reviewed") {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
        Reviewed
      </span>
    );
  }

  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700">
      Pending
    </span>
  );
}

/**
 * The screening match score, colour-coded, with a flag when a knockout question
 * wasn't met. Ranking only — a low score or a flag never rejects anyone, so the
 * flag reads as "worth a closer look", not "disqualified".
 */
function MatchCell({ score, flagged }: { score?: number; flagged?: boolean }) {
  if (typeof score !== "number") {
    return <span className="text-sm text-gray-500"> - </span>;
  }
  const tone =
    score >= 70
      ? "bg-green-50 text-green-700"
      : score >= 40
        ? "bg-yellow-50 text-yellow-700"
        : "bg-gray-100 text-gray-600";
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex px-2.5 py-0.5 rounded-full text-sm font-semibold ${tone}`}
      >
        {score}%
      </span>
      {flagged && (
        <span
          title="A knockout question wasn't met - worth a closer look"
          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-sm font-medium text-red-600"
        >
          <HiOutlineFlag className="w-3.5 h-3.5" />
          Flag
        </span>
      )}
    </div>
  );
}

/** The populated candidate object, or undefined when not populated. */
function candidateOf(app: ApplicationItem) {
  return typeof app.user_id === "object" ? app.user_id : undefined;
}

function rowActions(
  app: ApplicationItem,
  busy: boolean,
  onStatusChange: (
    id: string,
    status: "reviewed" | "accepted" | "rejected",
  ) => void,
  onView: () => void,
): KebabAction[] {
  const actions: KebabAction[] = [
    {
      label: "View candidate",
      icon: HiOutlineEye,
      onClick: onView,
    },
  ];

  if (app.resume_url) {
    actions.push({
      label: "Download resume",
      icon: HiOutlineDocumentArrowDown,
      onClick: () => {
        window.open(app.resume_url!, "_blank", "noopener,noreferrer");
      },
    });
  }

  if (app.status !== "reviewed") {
    actions.push({
      label: "Mark as reviewed",
      icon: HiOutlineUser,
      disabled: busy,
      onClick: () => onStatusChange(app._id, "reviewed"),
    });
  }
  if (app.status !== "accepted") {
    actions.push({
      label: "Accept",
      icon: HiOutlineCheck,
      disabled: busy,
      onClick: () => onStatusChange(app._id, "accepted"),
    });
  }
  if (app.status !== "rejected") {
    actions.push({
      label: "Reject",
      icon: HiOutlineXMark,
      danger: true,
      disabled: busy,
      onClick: () => onStatusChange(app._id, "rejected"),
    });
  }

  return actions;
}

export default function ApplicationsPage() {
  const { showToast } = useToaster();
  const router = useRouter();
  const [busyApplicationId, setBusyApplicationId] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading,
    error: loadError,
    mutate,
  } = useSWR(["employer-applications", page], () =>
    getReceivedApplications(page, APPLICATIONS_PER_PAGE),
  );
  // Failed first load only - see the postings page.
  const showLoadError = !!loadError && data === undefined;
  // Server-paged: the endpoint returns one page, so the filters and counters
  // below describe the page on screen, not the whole history.
  const applications = data?.applications ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalItems = data?.pagination?.totalItems ?? applications.length;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "match">("recent");

  const filteredApplications = useMemo(() => {
    const filtered = applications.filter((app) => {
      // 1. Status Filter
      if (selectedStatus !== "all" && app.status !== selectedStatus) {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const candidateName = (
          candidateOf(app)?.full_name ||
          app.full_name ||
          ""
        ).toLowerCase();
        const candidateEmail = (
          candidateOf(app)?.email ||
          app.email ||
          ""
        ).toLowerCase();
        const jobRole = (
          typeof app.job_id === "object" ? app.job_id.role : "job posting"
        ).toLowerCase();
        const companyName = (
          typeof app.job_id === "object" ? app.job_id.company_name : ""
        ).toLowerCase();

        return (
          candidateName.includes(query) ||
          candidateEmail.includes(query) ||
          jobRole.includes(query) ||
          companyName.includes(query)
        );
      }

      return true;
    });

    // Ranking: "Best match" sorts by screening score (unscored applicants sink
    // to the bottom but stay listed — rank & flag, never hide). Default keeps
    // newest first.
    if (sortBy === "match") {
      return [...filtered].sort((a, b) => {
        const sa =
          typeof a.screening_score === "number" ? a.screening_score : -1;
        const sb =
          typeof b.screening_score === "number" ? b.screening_score : -1;
        return sb - sa;
      });
    }
    return filtered;
  }, [applications, searchQuery, selectedStatus, sortBy]);

  const counts = useMemo(() => {
    const res = {
      all: applications.length,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
    };
    applications.forEach((app) => {
      if (app.status in res) {
        res[app.status as keyof typeof res]++;
      }
    });
    return res;
  }, [applications]);

  const handleStatusChange = async (
    applicationId: string,
    status: "reviewed" | "accepted" | "rejected",
  ) => {
    setBusyApplicationId(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      await mutate();
      showToast({
        type: "success",
        title: "Application updated",
        description: `Status changed to ${status}`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Update failed",
        description:
          err instanceof Error
            ? err.message
            : "Couldn't update application status",
      });
    } finally {
      setBusyApplicationId(null);
    }
  };

  const statusOptions = [
    { value: "all", label: `All applications (${counts.all})` },
    { value: "pending", label: `Pending (${counts.pending})` },
    { value: "reviewed", label: `Reviewed (${counts.reviewed})` },
    { value: "accepted", label: `Accepted (${counts.accepted})` },
    { value: "rejected", label: `Rejected (${counts.rejected})` },
  ];

  const sortOptions = [
    { value: "recent", label: "Most recent" },
    { value: "match", label: "Best match" },
  ];

  return (
    <AuthGuard>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Applicants</h1>
          <p className="text-gray-600">
            Review and manage candidates who have applied to your job postings.
          </p>
        </div>

        {showLoadError ? (
          <ListLoadError what="applications" onRetry={() => mutate()} />
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-gray-600 font-medium">
              Loading applications...
            </p>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-6">
            {/* Search + grouped filters — one label slot and one control
                height per field so the row lines up by construction. */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-start gap-3">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="applicants-search"
                  className="flex h-5 items-end mb-1.5 text-sm font-medium text-gray-700"
                >
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="applicants-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by candidate name, email, or job title..."
                    className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-300/60 transition-all"
                  />
                </div>
              </div>

              <div className="w-full sm:w-56 shrink-0 [&>div]:mb-0 [&>div]:gap-0 [&_button]:h-11 [&_button]:!py-0">
                <CustomDropdown
                  label="Status"
                  labelClassName="flex h-5 items-end mb-1.5 text-sm font-medium text-gray-700"
                  name="applicants-status"
                  placeholder="All applications"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statusOptions}
                />
              </div>

              <div className="w-full sm:w-44 shrink-0 [&>div]:mb-0 [&>div]:gap-0 [&_button]:h-11 [&_button]:!py-0">
                <CustomDropdown
                  label="Sort"
                  labelClassName="flex h-5 items-end mb-1.5 text-sm font-medium text-gray-700"
                  name="applicants-sort"
                  placeholder="Most recent"
                  value={sortBy}
                  onChange={(val) => setSortBy(val as "recent" | "match")}
                  options={sortOptions}
                />
              </div>
            </div>

            {/* Applications Table Card */}
            {filteredApplications.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Applied For
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Match
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredApplications.map((app) => (
                        <tr
                          key={app._id}
                          // Row click opens the candidate detail page. The name
                          // link remains the keyboard path; buttons/menus are
                          // excluded so kebab actions don't navigate away.
                          onClick={(e) => {
                            const el = e.target as HTMLElement;
                            if (
                              el.closest(
                                "button, a, input, label, [role='menu']",
                              )
                            )
                              return;
                            router.push(`/dashboard/applications/${app._id}`);
                          }}
                          className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-primary font-bold text-sm overflow-hidden shrink-0">
                                {candidateOf(app)?.picture ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={candidateOf(app)!.picture}
                                    alt={
                                      candidateOf(app)?.full_name ||
                                      app.full_name
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  (
                                    candidateOf(app)?.full_name ||
                                    app.full_name ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()
                                )}
                              </div>
                              <div>
                                <Link
                                  href={`/dashboard/applications/${app._id}`}
                                  className="text-sm font-semibold text-gray-900 no-underline hover:text-primary hover:underline"
                                >
                                  {candidateOf(app)?.full_name ||
                                    app.full_name ||
                                    "Unknown User"}
                                </Link>
                                <p className="text-sm text-gray-600">
                                  {candidateOf(app)?.email ||
                                    app.email ||
                                    "No email provided"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <HiOutlineBriefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                {typeof app.job_id === "string" ? (
                                  <p className="text-sm text-gray-700 font-medium truncate max-w-[17.5rem]">
                                    Job posting
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-700 font-medium truncate max-w-[17.5rem]">
                                      {app.job_id?.role}
                                    </p>
                                    <p className="text-sm text-gray-600 font-bold mt-0.5 truncate max-w-[17.5rem]">
                                      {app.job_id?.company_name}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                              {formatDate(app.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <ApplicationStatusBadge status={app.status} />
                          </td>
                          <td className="px-6 py-4">
                            <MatchCell
                              score={app.screening_score}
                              flagged={app.screening_flagged}
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex justify-end">
                              <KebabMenu
                                label={`Actions for ${
                                  candidateOf(app)?.full_name ||
                                  app.full_name ||
                                  "applicant"
                                }`}
                                actions={rowActions(
                                  app,
                                  busyApplicationId === app._id,
                                  handleStatusChange,
                                  () =>
                                    router.push(
                                      `/dashboard/applications/${app._id}`,
                                    ),
                                )}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Server-paged: without this the employer saw only the first
                    page and nothing said so. */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    summary={`${totalItems} application${totalItems === 1 ? "" : "s"} in total`}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <HiOutlineMagnifyingGlass className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No matching applications found
                </h3>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  Try adjusting your search terms or status filters to find what
                  you are looking for.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <HiOutlineUserGroup className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              When candidates apply to your job postings, they will appear here
              for you to review.
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
