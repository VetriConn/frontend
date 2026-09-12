"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineArrowLeft,
  HiOutlineDocumentArrowDown,
  HiStar,
} from "react-icons/hi2";
import { getReceivedApplication } from "@/lib/api";
import type { CandidateProfile } from "@/lib/api/postings";
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

/**
 * Why a section is empty, in place of the section quietly disappearing.
 *
 * Every panel here used to be wrapped in a truthiness check with no else, so
 * a candidate who had filled nothing in rendered as a header card and a page
 * of white space — indistinguishable from a broken page, and giving the
 * employer no idea the profile had a shape at all. Same rule as the
 * application review: an absent row tells you nothing.
 */
function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-sm italic text-gray-400">{children}</p>;
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
        [...(candidate?.skills ?? []), ...(application?.selected_skills ?? [])],
      ),
    [job, candidate, application],
  );

  if (isLoading) {
    return (
      <div
        className="w-full animate-pulse"
        aria-busy="true"
        aria-label="Loading candidate"
      >
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </div>

        {/* Header card */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-full bg-gray-200" />
              <div>
                <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
                <div className="flex flex-wrap gap-3">
                  <div className="h-4 w-36 bg-gray-100 rounded" />
                  <div className="h-4 w-40 bg-gray-100 rounded" />
                  <div className="h-4 w-28 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-11/12 bg-gray-100 rounded" />
                <div className="h-3 w-4/5 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="h-5 w-44 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-12 w-full bg-gray-50 rounded-lg" />
                <div className="h-12 w-full bg-gray-50 rounded-lg" />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="h-5 w-48 bg-gray-200 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-4/5 bg-gray-100 rounded" />
                  <div className="h-8 w-full bg-gray-50 rounded-lg" />
                  <div className="h-8 w-full bg-gray-50 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="w-full">
        <Link
          href="/dashboard/applications"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-700"
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
  // Populated by the detail endpoint, as the list endpoint already did.
  const picture =
    typeof application.user_id === "object"
      ? application.user_id.picture
      : undefined;
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
    <div className="w-full">
      {/* Header card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-bold text-primary">
            {picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={picture}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(name, "C")
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <HiOutlineBriefcase className="h-4 w-4 shrink-0" />
                {headline}
              </span>
              <a
                href={`mailto:${application.email}`}
                className="flex items-center gap-1.5 text-gray-600 no-underline hover:text-primary hover:underline"
              >
                <HiOutlineEnvelope className="h-4 w-4 shrink-0" />
                {application.email}
              </a>
              {application.phone && (
                <a
                  href={`tel:${application.phone}`}
                  className="flex items-center gap-1.5 text-gray-600 no-underline hover:text-primary hover:underline"
                >
                  <HiOutlinePhone className="h-4 w-4 shrink-0" />
                  {application.phone}
                </a>
              )}
              {location && (
                <span className="flex items-center gap-1.5">
                  <HiOutlineMapPin className="h-4 w-4 shrink-0" />
                  {location}
                </span>
              )}
            </div>
            <a
              href={`mailto:${application.email}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover no-underline"
            >
              <HiOutlineEnvelope className="h-5 w-5" />
              Send Email
            </a>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 md:grid-cols-4">
          {[
            { label: "Applied on", value: formatDate(application.createdAt) },
            { label: "Job Applied", value: job?.role ?? "-" },
            {
              label: "Status",
              value: STATUS_LABEL[application.status] ?? application.status,
            },
            {
              label: "Match Score",
              value: match.percent !== null ? `${match.percent}%` : "-",
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-sm text-gray-500">{item.label}</p>
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
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-gray-900">About</h2>
            {candidate?.bio ? (
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {candidate.bio}
              </p>
            ) : (
              <EmptyNote>
                This candidate hasn&apos;t written an About section on their
                profile.
              </EmptyNote>
            )}
          </section>

          {/* Work Experience */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Work Experience
            </h2>
            {(candidate?.work_experience?.length ?? 0) === 0 ? (
              <EmptyNote>
                No work history on their profile yet. Their application
                answers below may still tell you what you need.
              </EmptyNote>
            ) : (
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
                      <p className="text-sm text-gray-500">
                        {[exp.start_date, exp.end_date || "Present"]
                          .filter(Boolean)
                          .join(" – ")}
                      </p>
                      {exp.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* The free-text parts of the application itself */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              From their application
            </h2>
            {!application.relevant_experience &&
              !application.additional_info && (
                <EmptyNote>
                  They didn&apos;t add any written notes to this application.
                </EmptyNote>
              )}
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
            {/* This sat inside the free-text condition, so an applicant who
                  attached a CV and wrote nothing had no download link at all
                  — the one attachment on the page, hidden by an unrelated
                  field being blank. */}
            {application.resume_url ? (
              <a
                href={application.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
              >
                <HiOutlineDocumentArrowDown className="h-5 w-5" />
                Download résumé
              </a>
            ) : (
              <EmptyNote>No résumé attached.</EmptyNote>
            )}
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          {/* Professional Skills */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              Professional Skills
            </h2>
            {professionalSkills.length === 0 ? (
              <EmptyNote>
                No skills listed, on their profile or in this application.
              </EmptyNote>
            ) : (
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
            )}
          </section>

          {/* Skill and Experience Matching */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              Skill &amp; Experience Matching
            </h2>
            {match.required.length === 0 ? (
              /* Explains the dash in the header's Match Score, which
                 otherwise reads as a score of zero. */
              <EmptyNote>
                This job doesn&apos;t list required skills, so there is nothing
                to match against.
              </EmptyNote>
            ) : (
              <>
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-primary">
                    {match.percent}%
                  </span>
                  <span className="text-sm text-gray-600">
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
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500"
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
                      ? `Strong fit - meets ${match.matched.length} of ${match.required.length} required skills.`
                      : `Partial fit - meets ${match.matched.length} of ${match.required.length} required skills.`}
                  </p>
                </div>
              </>
            )}
          </section>

          {/* Screening answers */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              Screening Answers
            </h2>
            {/* Two different absences, and they are not the same news: a job
                that asked nothing, versus an applicant who answered nothing. */}
            {(job?.screening_questions?.length ?? 0) === 0 ? (
              <EmptyNote>This job had no screening questions.</EmptyNote>
            ) : (application.screening_answers?.length ?? 0) === 0 ? (
              <EmptyNote>
                They didn&apos;t answer the screening questions.
              </EmptyNote>
            ) : (
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
                        {/* Only yes_no answers are machine tokens stored
                            lower-case ("yes"), and only they want title-casing.
                            Applied to every answer it rewrote whatever the
                            applicant typed into a short_text box: "rotating
                            days and afternoons" came back as "Rotating Days And
                            Afternoons", which reads like a form field rather
                            than like a person answering a question. Choice
                            options are the employer's own strings and are
                            already cased how they wrote them. */}
                        <p
                          className={`text-sm text-gray-600 ${
                            q.type === "yes_no" ? "capitalize" : ""
                          }`}
                        >
                          {ans.length ? ans.join(", ") : "No answer"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Candidate Score */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Candidate Score
            </h2>
            {overall === null && screeningScore === null ? (
              <EmptyNote>
                Not enough to score on yet. Scoring needs required skills on
                the job, or screening answers from the applicant.
              </EmptyNote>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <HiStar className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-3xl font-extrabold text-gray-900">
                      {stars ?? "-"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Overall score (of 5)
                    </p>
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
                  <p className="mt-3 text-sm font-medium text-red-600">
                    Flagged: a knockout screening question wasn&apos;t met -
                    worth a closer look.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default CandidateDetail;
