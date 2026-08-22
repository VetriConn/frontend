"use client";

import { Fragment, useState, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  getReceivedApplications,
  updateApplicationStatus,
} from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineDocumentArrowDown,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineFlag,
  HiOutlineChevronDown,
  HiOutlineCheck,
  HiOutlineXMark,
} from "react-icons/hi2";
import { screeningAnswerState } from "@/lib/candidate-match";
import { formatDate } from "@/lib/date-utils";
import { CustomDropdown } from "@/components/ui/CustomDropdown";


function getJobLabel(
  job:
    | string
    | {
        _id: string;
        id: string;
        role: string;
        company_name: string;
        location?: string;
        company_logo?: string;
      },
) {
  if (typeof job === "string") return "Job posting";
  return `${job.role} • ${job.company_name}`;
}



function ApplicationStatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
        Accepted
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
        Rejected
      </span>
    );
  }

  if (status === "reviewed") {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        Reviewed
      </span>
    );
  }

  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
      Pending
    </span>
  );
}

/**
 * The screening match score, colour-coded, with a flag when a knockout question
 * wasn't met. Ranking only — a low score or a flag never rejects anyone, so the
 * flag reads as "worth a closer look", not "disqualified".
 */
function MatchCell({
  score,
  flagged,
}: {
  score?: number;
  flagged?: boolean;
}) {
  if (typeof score !== "number") {
    return <span className="text-xs text-gray-400">—</span>;
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
        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${tone}`}
      >
        {score}%
      </span>
      {flagged && (
        <span
          title="A knockout question wasn't met — worth a closer look"
          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
        >
          <HiOutlineFlag className="w-3.5 h-3.5" />
          Flag
        </span>
      )}
    </div>
  );
}

/**
 * The expanded applicant panel: their screening answers scored against the
 * employer's preferred answers, plus the free-text parts of the application.
 * This is what makes the Match % explainable — never a gate, just context.
 */
function ApplicantDetail({ app }: { app: any }) {
  const questions =
    typeof app.job_id === "object" ? app.job_id?.screening_questions ?? [] : [];
  const answersById = new Map<string, string[]>(
    (app.screening_answers ?? []).map((a: any) => [a.question_id, a.answer]),
  );

  const details: { label: string; value?: string }[] = [
    { label: "Earliest start", value: app.earliest_start_date },
    { label: "Preferred schedule", value: app.preferred_schedule },
    { label: "Location preference", value: app.work_location_preference },
  ];
  const shownDetails = details.filter((d) => d.value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: screening answers */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Screening answers
        </h4>
        {questions.length === 0 ? (
          <p className="text-sm text-gray-400">
            This job had no screening questions.
          </p>
        ) : (
          <ul className="space-y-3">
            {questions.map((q: any) => {
              const answer = answersById.get(q.id) ?? [];
              const state = screeningAnswerState(
                q.preferred_answers ?? [],
                answer,
                q.type,
              );
              const tone =
                state === "full"
                  ? "text-green-600"
                  : state === "partial"
                    ? "text-yellow-600"
                    : state === "none"
                      ? "text-gray-400"
                      : "text-gray-300";
              return (
                <li key={q.id} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 shrink-0 ${tone}`}>
                    {state === "full" ? (
                      <HiOutlineCheck className="w-5 h-5" />
                    ) : state === "none" ? (
                      <HiOutlineXMark className="w-5 h-5" />
                    ) : state === "partial" ? (
                      <HiOutlineCheck className="w-5 h-5" />
                    ) : (
                      <span className="block w-5 text-center">–</span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {q.question}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {answer.length ? answer.join(", ") : "No answer"}
                    </p>
                    {(q.preferred_answers ?? []).length > 0 && (
                      <p className="text-xs text-gray-400 capitalize">
                        Preferred: {(q.preferred_answers ?? []).join(", ")}
                        {q.knockout && (
                          <span className="ml-1 text-red-500">• knockout</span>
                        )}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Right: the rest of the application */}
      <div className="space-y-4">
        {app.relevant_experience && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Relevant experience
            </h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {app.relevant_experience}
            </p>
          </div>
        )}
        {(app.selected_skills ?? []).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
              Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {app.selected_skills.map((skill: string) => (
                <span
                  key={skill}
                  className="rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-xs text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {shownDetails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {shownDetails.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-gray-400">{d.label}</p>
                <p className="text-sm text-gray-700">{d.value}</p>
              </div>
            ))}
          </div>
        )}
        {app.additional_info && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Additional information
            </h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {app.additional_info}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const { showToast } = useToaster();
  const [busyApplicationId, setBusyApplicationId] = useState<string | null>(
    null,
  );
  const {
    data: applications = [],
    isLoading,
    mutate,
  } = useSWR("employer-applications", getReceivedApplications);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "match">("recent");
  // Which applicant row is expanded to show screening answers + details.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredApplications = useMemo(() => {
    const filtered = applications.filter((app: any) => {
      // 1. Status Filter
      if (selectedStatus !== "all" && app.status !== selectedStatus) {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const candidateName = (app.user_id?.full_name || app.full_name || "").toLowerCase();
        const candidateEmail = (app.user_id?.email || app.email || "").toLowerCase();
        const jobRole = (app.job_id?.role || "job posting").toLowerCase();
        const companyName = (app.job_id?.company_name || "").toLowerCase();

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
      return [...filtered].sort((a: any, b: any) => {
        const sa = typeof a.screening_score === "number" ? a.screening_score : -1;
        const sb = typeof b.screening_score === "number" ? b.screening_score : -1;
        return sb - sa;
      });
    }
    return filtered;
  }, [applications, searchQuery, selectedStatus, sortBy]);

  const counts = useMemo(() => {
    const res = { all: applications.length, pending: 0, reviewed: 0, accepted: 0, rejected: 0 };
    applications.forEach((app: any) => {
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
            : "Could not update application status",
      });
    } finally {
      setBusyApplicationId(null);
    }
  };

  const statusFilters = [
    { key: "all", label: "All Applications" },
    { key: "pending", label: "Pending" },
    { key: "reviewed", label: "Reviewed" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Applications & Applicants
          </h1>
          <p className="text-gray-500">
            Review and manage candidates who have applied to your job postings.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-gray-500 font-medium">
              Loading applications...
            </p>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-6">
            {/* Search and Filters Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by candidate name, email, or job title..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mr-2 uppercase tracking-wider">
                  <HiOutlineFunnel className="w-4 h-4" />
                  <span>Status:</span>
                </div>
                {statusFilters.map((filter) => {
                  const isActive = selectedStatus === filter.key;
                  const count = counts[filter.key as keyof typeof counts] || 0;
                  return (
                    <button
                      key={filter.key}
                      onClick={() => setSelectedStatus(filter.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60"
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] ${
                          isActive
                            ? "bg-white/20 text-white font-bold"
                            : "bg-gray-200/80 text-gray-500 font-semibold"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sort */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400 mr-2 uppercase tracking-wider">
                  Sort:
                </span>
                {(
                  [
                    { key: "recent", label: "Most recent" },
                    { key: "match", label: "Best match" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sortBy === opt.key
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications Table Card */}
            {filteredApplications.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Applied For
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Match
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredApplications.map((app: any) => (
                        <Fragment key={app._id}>
                        <tr
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-primary font-bold text-sm overflow-hidden shrink-0">
                                {app.user_id?.picture ? (
                                  <img
                                    src={app.user_id.picture}
                                    alt={app.user_id.full_name || app.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  (app.user_id?.full_name || app.full_name || "U").charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <Link
                                  href={`/dashboard/applications/${app._id}`}
                                  className="text-sm font-semibold text-gray-900 no-underline hover:text-primary"
                                >
                                  {app.user_id?.full_name || app.full_name || "Unknown User"}
                                </Link>
                                <p className="text-xs text-gray-500">
                                  {app.user_id?.email || app.email || "No email provided"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <HiOutlineBriefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                {typeof app.job_id === "string" ? (
                                  <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                                    Job posting
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                                      {app.job_id?.role}
                                    </p>
                                    <p className="text-xs text-gray-500 font-bold mt-0.5 truncate max-w-[200px]">
                                      {app.job_id?.company_name}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
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
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === app._id ? null : app._id,
                                  )
                                }
                                aria-expanded={expandedId === app._id}
                                aria-label={
                                  expandedId === app._id
                                    ? "Hide details"
                                    : "Show details"
                                }
                                className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-red-50 transition-colors"
                                title="Details"
                              >
                                <HiOutlineChevronDown
                                  className={`w-5 h-5 transition-transform ${
                                    expandedId === app._id ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                              {app.resume_url && (
                                <a
                                  href={app.resume_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-red-50 transition-colors"
                                  title="Download Resume"
                                >
                                  <HiOutlineDocumentArrowDown className="w-5 h-5" />
                                </a>
                              )}
                              <div className="w-32 text-left relative z-20">
                                <CustomDropdown
                                  name={`status-${app._id}`}
                                  placeholder="Status"
                                  value={app.status}
                                  disabled={busyApplicationId === app._id}
                                  hideHeader
                                  onChange={(val) => handleStatusChange(app._id, val as any)}
                                  options={[
                                    { value: "pending", label: "Pending" },
                                    { value: "reviewed", label: "Reviewed" },
                                    { value: "accepted", label: "Accepted" },
                                    { value: "rejected", label: "Rejected" },
                                  ]}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                        {expandedId === app._id && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-5 bg-gray-50/60 border-b border-gray-200"
                            >
                              <ApplicantDetail app={app} />
                            </td>
                          </tr>
                        )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
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
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Try adjusting your search terms or status filters to find what you are looking for.
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
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              When candidates apply to your job postings, they will appear here
              for you to review.
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
