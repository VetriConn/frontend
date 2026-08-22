"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineChevronRight,
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineArrowLeft,
  HiOutlineDocumentArrowDown,
  HiStar,
} from "react-icons/hi2";
import { getReceivedApplication } from "@/lib/api";
import type { CandidateProfile } from "@/lib/api/postings";
import type { ApplicationItem } from "@/types/api";
import { formatDate } from "@/lib/date-utils";
import { getInitials } from "@/lib/initials";
import { regionName } from "@/lib/regions";
import {
  splitSkills,
  skillMatch,
  screeningAnswerState,
} from "@/lib/candidate-match";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending review",
  reviewed: "Reviewed",
  accepted: "Accepted",
  rejected: "Rejected",
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-gray-600">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-sm font-semibold text-gray-800">
        {Math.round(value)}%
      </span>
    </div>
  );
}

export function CandidateDetail({ applicationId }: { applicationId: string }) {
  const { data, isLoading, error } = useSWR(
    applicationId ? ["received-application", applicationId] : null,
    () => getReceivedApplication(applicationId),
  );

  const application = data?.application;
  const candidate: CandidateProfile | null = data?.candidate ?? null;

  const job =
    application && typeof application.job_id === "object"
      ? application.job_id
      : null;

  // Skill & experience matching — the job's required skills against what the
  // candidate lists on their profile and in the application.
  const match = useMemo(
    () =>
      skillMatch(
        [...splitSkills(job?.skills), ...(job?.qualifications ?? [])],
        [
          ...(candidate?.skills ?? []),
          ...(application?.selected_skills ?? []),
        ],
      ),
    [job, candidate, application],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-gray-500">
        Loading candidate…
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/dashboard/applications"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <HiOutlineArrowLeft className="h-4 w-4" /> Back to applications
        </Link>
        <p className="text-sm text-gray-600">
          We couldn&apos;t load this candidate. They may have withdrawn, or the
          application isn&apos;t one of yours.
        </p>
      </div>
    );
  }

  const name = application.full_name || "Candidate";
  const currentRole = candidate?.work_experience?.[0];
  const headline =
    candidate?.job_title && currentRole?.company
      ? `${candidate.job_title} at ${currentRole.company}`
      : candidate?.job_title || currentRole?.position || "Applicant";
  const location = [
    candidate?.city,
    regionName(candidate?.country, candidate?.state_province),
    candidate?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const screeningScore =
    typeof application.screening_score === "number"
      ? application.screening_score
      : null;

  // A blended headline score, 0–5 stars, from whatever signals we actually have.
  const signals = [match.percent, screeningScore].filter(
    (v): v is number => typeof v === "number",
  );
  const overall = signals.length
    ? signals.reduce((a, b) => a + b, 0) / signals.length
    : null;
  const stars = overall !== null ? (overall / 20).toFixed(1) : null;

  const professionalSkills = candidate?.skills ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
        <Link
          href="/dashboard/applications"
          className="hover:text-gray-700 no-underline text-gray-500"
        >
          Applications
        </Link>
        <HiOutlineChevronRight className="h-4 w-4 text-gray-400" />
        {job && (
          <>
            <span className="text-gray-400">{job.role}</span>
            <HiOutlineChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        <span className="font-medium text-gray-700">{name}</span>
      </nav>

      {/* Header card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {getInitials(name, "C")}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <HiOutlineBriefcase className="h-4 w-4" />
                  {headline}
                </span>
                {location && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineMapPin className="h-4 w-4" />
                    {location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <a
            href={`mailto:${application.email}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover no-underline"
          >
            <HiOutlineEnvelope className="h-5 w-5" />
            Send Email
          </a>
        </div>

        {/* Meta row */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 md:grid-cols-4">
          {[
            { label: "Applied on", value: formatDate(application.createdAt) },
            { label: "Job Applied", value: job?.role ?? "—" },
            {
              label: "Status",
              value: STATUS_LABEL[application.status] ?? application.status,
            },
            {
              label: "Match Score",
              value: match.percent !== null ? `${match.percent}%` : "—",
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Left column ── */}
        <div className="space-y-6">
          {/* About */}
          {candidate?.bio && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-gray-900">About</h2>
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {candidate.bio}
              </p>
            </section>
          )}

          {/* Work Experience */}
          {(candidate?.work_experience?.length ?? 0) > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Work Experience
              </h2>
              <ol className="relative space-y-5">
                {candidate!.work_experience!.map((exp, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                      {i < candidate!.work_experience!.length - 1 && (
                        <span className="mt-1 w-px flex-1 bg-gray-200" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {exp.position || "Role"}
                      </p>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-400">
                        {[exp.start_date, exp.end_date || "Present"]
                          .filter(Boolean)
                          .join(" – ")}
                      </p>
                      {exp.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* The free-text parts of the application itself */}
          {(application.relevant_experience || application.additional_info) && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                From their application
              </h2>
              {application.relevant_experience && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-800">
                    Relevant experience
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {application.relevant_experience}
                  </p>
                </div>
              )}
              {application.additional_info && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-800">
                    Additional information
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {application.additional_info}
                  </p>
                </div>
              )}
              {application.resume_url && (
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  <HiOutlineDocumentArrowDown className="h-5 w-5" />
                  Download résumé
                </a>
              )}
            </section>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          {/* Professional Skills */}
          {professionalSkills.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                Professional Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {professionalSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-primary/5 border border-primary/15 px-3 py-1.5 text-sm text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Skill and Experience Matching */}
          {match.required.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                Skill &amp; Experience Matching
              </h2>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-primary">
                  {match.percent}%
                </span>
                <span className="text-sm text-gray-500">
                  Matched · {match.matched.length} of {match.required.length}{" "}
                  skills
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {match.matched.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
                  >
                    <HiOutlineCheck className="h-4 w-4" />
                    {s}
                  </span>
                ))}
                {match.unmatched.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-400"
                  >
                    <HiOutlineXMark className="h-4 w-4" />
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3">
                <HiOutlineSparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-gray-600">
                  {match.percent !== null && match.percent >= 70
                    ? `Strong fit — meets ${match.matched.length} of ${match.required.length} required skills.`
                    : `Partial fit — meets ${match.matched.length} of ${match.required.length} required skills.`}
                </p>
              </div>
            </section>
          )}

          {/* Screening answers */}
          {(application.screening_answers?.length ?? 0) > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                Screening Answers
              </h2>
              <ul className="space-y-3">
                {(job?.screening_questions ?? []).map((q) => {
                  const ans =
                    application.screening_answers?.find(
                      (a) => a.question_id === q.id,
                    )?.answer ?? [];
                  const state = screeningAnswerState(
                    q.preferred_answers ?? [],
                    ans,
                    q.type,
                  );
                  return (
                    <li key={q.id} className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0">
                        {state === "info" ? (
                          <span className="block w-5 text-center text-gray-300">
                            –
                          </span>
                        ) : state === "none" ? (
                          <HiOutlineXMark className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiOutlineCheck className="h-5 w-5 text-emerald-600" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {q.question}
                        </p>
                        <p className="text-sm capitalize text-gray-600">
                          {ans.length ? ans.join(", ") : "No answer"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Candidate Score */}
          {(overall !== null || screeningScore !== null) && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Candidate Score
              </h2>
              <div className="mb-4 flex items-center gap-3">
                <HiStar className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {stars ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400">Overall score (of 5)</p>
                </div>
              </div>
              <div className="space-y-3">
                {match.percent !== null && (
                  <ScoreBar label="Skills match" value={match.percent} />
                )}
                {screeningScore !== null && (
                  <ScoreBar label="Screening" value={screeningScore} />
                )}
              </div>
              {application.screening_flagged && (
                <p className="mt-3 text-xs font-medium text-red-600">
                  Flagged: a knockout screening question wasn&apos;t met — worth
                  a closer look.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateDetail;
