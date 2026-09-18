"use client";

import { useEffect, useRef } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMyCompanies } from "@/hooks/useCompanies";
import { useTour } from "./TourProvider";

/**
 * Starts the company tour on a first visit to the Companies page.
 *
 * Mounted by that page rather than by the dashboard layout, because "first
 * visit to Companies" is the trigger. The base tour's equivalent lives in
 * TourAutoStart and neither knows about the other.
 *
 * Three conditions, and all three matter:
 *
 * - the profile has loaded, so `company_tour_completed_at` is known rather
 *   than merely absent;
 * - the companies request has settled, because the nav only renders its
 *   Companies entry once it has, and the tour resolves anchors once at start.
 *   Getting this wrong is what dropped a step from the base tour;
 * - the account actually has a company. Someone who lands here to apply for
 *   one has nothing to be shown around yet.
 */
export default function CompanyTourAutoStart() {
  const { userProfile, isLoading } = useUserProfile();
  const { companies, isLoading: isCompaniesLoading } = useMyCompanies();
  const { start, isRunning } = useTour();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || isLoading || isCompaniesLoading || isRunning) {
      return;
    }
    if (!userProfile) return;
    if (userProfile.company_tour_completed_at) {
      attempted.current = true;
      return;
    }
    if (companies.length === 0) {
      // No company yet. Do not mark it seen: they may apply for one today and
      // should get the tour when they come back with it.
      return;
    }
    attempted.current = true;

    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      start("auto", "company");
    };
    // rAF for the paint, a timer because rAF never fires in a hidden tab.
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
  ]);

  return null;
}
