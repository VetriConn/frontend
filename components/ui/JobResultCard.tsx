"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
} from "react-icons/hi2";
import { hasApplicationDraft } from "@/lib/applicationDrafts";
import { jobPreviewParts } from "@/lib/job-display";
import { CARD_SURFACE, CARD_FOCUS, CARD_TITLE } from "./cardStyles";

interface JobResultCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  /** Null when the listing does not state one — the row is then omitted. */
  jobType: string | null;
  salary: string;
  description: string;
  /**
   * The first few duties, as the list endpoint already ships them.
   *
   * They follow the brief in the same clamped preview rather than getting a
   * row of their own: the card's rhythm is fixed by `line-clamp-2`, and a
   * second block would break it on every card to help only some.
   */
  responsibilities?: string[];
  /**
   * True when the signed-in account posted this listing.
   *
   * The card offered "Apply Now" on your own posting, and the detail page it
   * led to answered "You posted this job" with the button disabled. The
   * detail page had `poster_id` and compared it; the card was simply never
   * handed it. A button that cannot do what it says is worse than no button,
   * and worse still on a board where the same account both posts and applies.
   */
  isOwnPosting?: boolean;
  onApply?: (id: string) => void;
}

export const JobResultCard = ({
  id,
  title,
  company,
  location,
  jobType,
  salary,
  description,
  responsibilities,
  isOwnPosting = false,
  onApply,
}: JobResultCardProps) => {
  const router = useRouter();
  const [hasDraft, setHasDraft] = useState(false);

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

  const handleApplyClick = () => {
    if (onApply) {
      onApply(id);
    } else {
      router.push(`/jobs/${id}`);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/jobs/${id}`);
  };

  /**
   * The card was clickable with a mouse and unreachable without one — no
   * tabindex, no key handling, no focus ring. Enter and Space now open it, as
   * a link and a button respectively would.
   */
  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    router.push(`/jobs/${id}`);
  };

  return (
    <article
      className={clsx(
        CARD_SURFACE,
        CARD_FOCUS,
        "p-4 md:p-6 cursor-pointer flex flex-col gap-4",
      )}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="link"
      aria-labelledby={`job-title-${id}`}
    >
      {/* Job Info Section */}
      <div className="flex-1 min-w-0">
        {/* Job Title - h3 for proper hierarchy under page h1 and section h2 */}
        <h3
          id={`job-title-${id}`}
          className={clsx(CARD_TITLE, "text-lg md:text-xl mb-3")}
        >
          {title}
        </h3>

        {/* Job Meta Info - Stack on mobile, wrap on larger screens */}
        <dl className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-4 sm:gap-y-2 mb-3 text-sm text-gray-600">
          {/* Company */}
          <div className="inline-flex items-center gap-1.5 min-h-6">
            <dt className="sr-only">Company</dt>
            <HiOutlineBuildingOffice2
              className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0"
              aria-hidden="true"
            />
            <dd>{company}</dd>
          </div>

          {/* Location */}
          <div className="inline-flex items-center gap-1.5 min-h-6">
            <dt className="sr-only">Location</dt>
            <HiOutlineMapPin
              className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0"
              aria-hidden="true"
            />
            <dd>{location}</dd>
          </div>

          {/* Job Type. Rendered only when the listing states one; it used to
              print an invented "Full-time" on every card. */}
          {jobType && (
            <div className="inline-flex items-center gap-1.5 min-h-6">
              <dt className="sr-only">Job Type</dt>
              <HiOutlineBriefcase
                className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0"
                aria-hidden="true"
              />
              <dd>{jobType}</dd>
            </div>
          )}

          {/* Salary */}
          {salary && (
            <div className="inline-flex items-center gap-1.5 min-h-6">
              {/* "Pay" rather than "Salary" — aggregated listings often quote
                  an hourly rate here, not an annual figure. */}
              <dt className="sr-only">Pay</dt>
              <HiOutlineCurrencyDollar
                className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0"
                aria-hidden="true"
              />
              <dd className="text-primary font-medium">{salary}</dd>
            </div>
          )}
        </dl>

        {/* Description */}
        {/* A preview, not the full duty list — the detail page renders every
            duty as a bulleted list. Here the fragments are separated by a
            middot rather than the source's raw pipes, which read as one
            run-on sentence. A separator survives line-clamp; a <ul> does not
            clamp predictably, and the card's fixed rhythm depends on it.

            The brief comes first and the duties continue it, so a posting
            that put its substance under "What You'll Do" is no longer the
            one with the emptiest card. See jobPreviewParts. */}
        <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-2">
          {jobPreviewParts(description, responsibilities).join(" · ")}
        </p>
      </div>

      {/* Apply Button Section - Full width on mobile, auto width on desktop */}
      <div className="flex-shrink-0 md:self-start">
        {isOwnPosting ? (
          // Your own listing still belongs in the results — seeing it exactly
          // as a candidate does is the quickest answer to "is it live, and
          // does it read right?". What it must not do is offer to apply.
          <button
            type="button"
            onClick={() => router.push(`/jobs/${id}`)}
            className="w-full md:w-auto whitespace-nowrap min-h-12 px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 bg-white transition-colors hover:border-primary hover:text-primary"
            aria-label={`View your posting for ${title}`}
          >
            View your posting
          </button>
        ) : (
          <button
            type="button"
            onClick={handleApplyClick}
            className="btn-primary w-full md:w-auto whitespace-nowrap min-h-12"
            aria-label={`${hasDraft ? "Continue application draft" : "Apply now"} for ${title} at ${company}`}
          >
            {hasDraft ? "Continue Draft" : "Apply Now"}
          </button>
        )}
      </div>
    </article>
  );
};

export default JobResultCard;
