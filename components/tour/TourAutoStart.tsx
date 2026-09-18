"use client";

import { useEffect, useRef } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTour } from "./TourProvider";

/**
 * Starts the tour once, for an account that has never seen it.
 *
 * Separate from the provider on purpose. The provider knows how to run a tour
 * and nothing about who should get one; this knows the policy and nothing
 * about spotlights. It also means the provider can be mounted in a test
 * without a profile fetch firing.
 *
 * Deliberately not resumable. If someone reloads midway they are treated as
 * having seen it, per the spec, and the replay entry in Account Settings is
 * the way back. Resuming would mean persisting a step index, and a half-shown
 * tour that reappears on every reload is worse than one that does not.
 */
export default function TourAutoStart() {
  const { userProfile, isLoading } = useUserProfile();
  const { start, isRunning } = useTour();
  // One attempt per mount. Without this, any profile revalidation that
  // returned before the completion write landed would start the tour again
  // underneath the person already taking it.
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || isLoading || isRunning) return;
    if (!userProfile) return;
    if (userProfile.tour_completed_at) {
      attempted.current = true;
      return;
    }
    attempted.current = true;

    // Wait for the navbar to have painted before resolving anchors. Measuring
    // against a layout that is still settling gives a rect the element is
    // passing through rather than the one it lands on.
    //
    // The timer is not belt and braces: requestAnimationFrame does not fire
    // in a hidden tab, and a dashboard opened in a background tab is normal.
    // Without it the tour simply never starts for those people.
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      start("auto");
    };
    const frame = requestAnimationFrame(() => requestAnimationFrame(go));
    const timer = setTimeout(go, 200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [userProfile, isLoading, isRunning, start]);

  return null;
}
