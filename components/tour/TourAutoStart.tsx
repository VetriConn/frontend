"use client";

import { useTourTrigger } from "./useTourTrigger";
import type { UserProfile } from "@/types/api";

// Module scope so the identity is stable: these sit in the trigger's
// dependency array, and inline arrows would re-run the effect every render.
const seen = (profile: UserProfile) => profile.tour_completed_at;

/**
 * Starts the dashboard tour once, for an account that has never seen it.
 *
 * Separate from the provider on purpose: the provider knows how to run a tour
 * and nothing about who should get one.
 *
 * Deliberately not resumable. Somebody who reloads midway is treated as
 * having seen it, and the replay entry in Account Settings is the way back.
 * Resuming would mean persisting a step index, and a half-shown tour that
 * reappears on every reload is worse than one that does not.
 */
export default function TourAutoStart() {
  useTourTrigger({
    tour: "dashboard",
    completedAt: seen,
  });
  return null;
}
