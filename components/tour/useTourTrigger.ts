"use client";

import { useEffect, useRef } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMyCompanies } from "@/hooks/useCompanies";
import type { UserProfile } from "@/types/api";
import { useTour } from "./TourProvider";
import type { TourId } from "@/lib/tour/steps";

interface Options {
  /** Which tour to start. */
  tour: TourId;
  /** Read this tour's completion stamp off the profile. */
  completedAt: (profile: UserProfile) => string | null | undefined;
  /**
   * An extra condition beyond "not yet seen".
   *
   * The company tour uses it to require that the account actually has a
   * company. Returning false holds the tour WITHOUT marking it seen, so
   * somebody who applies for a company today still gets the tour when they
   * come back with one.
   */
  eligible?: (companyCount: number) => boolean;
}

/**
 * Deciding when a tour may start.
 *
 * Both triggers had grown the same body, and the differences between them
 * were a field name, a tour id and one extra condition. Keeping two copies
 * meant the awkward parts had to be discovered and fixed twice, and the
 * awkward parts here are not obvious:
 *
 * Waiting for companies is a correctness requirement, not politeness. The
 * tour resolves its step list once at start and drops steps whose anchor is
 * absent, and the nav only renders its Companies entry once that request
 * lands. The companies request is itself keyed on the profile, so it does not
 * even begin until the profile resolves. Starting as soon as the profile
 * arrived meant the Companies step was dropped for essentially every account
 * that had one.
 *
 * The timer beside requestAnimationFrame is also not belt and braces. rAF
 * does not fire in a hidden tab, and a dashboard opened in a background tab
 * is ordinary, so without it the tour simply never started for those people.
 */
export function useTourTrigger({ tour, completedAt, eligible }: Options): void {
  const { userProfile, isLoading } = useUserProfile();
  const { companies, isLoading: isCompaniesLoading } = useMyCompanies();
  const { start, isRunning } = useTour();

  // One attempt per mount. Without this, a profile revalidation landing
  // before the completion write would restart the tour underneath somebody
  // already taking it.
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || isLoading || isCompaniesLoading || isRunning) {
      return;
    }
    if (!userProfile) return;

    if (completedAt(userProfile)) {
      attempted.current = true;
      return;
    }
    if (eligible && !eligible(companies.length)) {
      // Not marked as attempted: they may become eligible later in the same
      // session, and should get the tour when they do.
      return;
    }

    attempted.current = true;

    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      start("auto", tour);
    };
    const frame = requestAnimationFrame(() => requestAnimationFrame(go));
    const timer = setTimeout(go, 200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [
    userProfile,
    isLoading,
    isCompaniesLoading,
    companies.length,
    isRunning,
    start,
    tour,
    completedAt,
    eligible,
  ]);
}
