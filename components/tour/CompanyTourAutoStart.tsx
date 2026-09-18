"use client";

import { useTourTrigger } from "./useTourTrigger";
import type { UserProfile } from "@/types/api";

// Module scope: see the note in TourAutoStart.
const seen = (profile: UserProfile) => profile.company_tour_completed_at;
const hasCompany = (companyCount: number) => companyCount > 0;

/**
 * Starts the company tour on a first visit to the Companies page.
 *
 * Mounted by that page rather than by the dashboard layout, because "first
 * visit to Companies" is the trigger.
 *
 * The eligibility check is what stops somebody who landed here to APPLY for a
 * company being shown a tour of features they do not have yet. Returning
 * false holds the tour without marking it seen, so they get it when they come
 * back with a company.
 */
export default function CompanyTourAutoStart() {
  useTourTrigger({
    tour: "company",
    completedAt: seen,
    eligible: hasCompany,
  });
  return null;
}
