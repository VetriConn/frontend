"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TOURS, TourId, TourStep } from "@/lib/tour/steps";
import { anchorExists, closeDrawerIfOpen, isDrawerLayout } from "@/lib/tour/anchors";
import { markTourCompleted } from "@/lib/api/tour";
import TourSpotlight from "./TourSpotlight";

/**
 * Where a run of the tour came from.
 *
 * This is not bookkeeping. A run started from Account Settings must not write
 * the completion stamp, or replaying would re-arm nothing and, worse, would
 * look identical to a first viewing in the data.
 */
export type TourSource = "auto" | "settings";

interface TourContextValue {
  isRunning: boolean;
  /** `tour` defaults to the dashboard tour, which is the common caller. */
  start: (source: TourSource, tour?: TourId) => void;
  stop: (reason: "finished" | "skipped") => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside TourProvider");
  return ctx;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const sourceRef = useRef<TourSource>("auto");
  // Which tour is running, so stop() stamps the right field.
  const tourRef = useRef<TourId>("dashboard");

  const isRunning = steps !== null && steps.length > 0;

  /**
   * Resolve the sequence once, at start, dropping steps whose anchor is not
   * reachable. Resolving up front rather than per step is what keeps the
   * progress indicator honest: "3 of 5" has to be true for this account, and
   * it cannot be if steps disappear as we walk.
   */
  const start = useCallback((source: TourSource, tour: TourId = "dashboard") => {
    sourceRef.current = source;
    tourRef.current = tour;
    const drawer = isDrawerLayout();
    const resolved = TOURS[tour].filter((step) => {
      // The open-the-menu step is meaningless on a desktop bar.
      if (step.drawerOnly && !drawer) return false;
      if (!step.anchor) return true;
      /*
       * Existence, not visibility.
       *
       * On a drawer layout every nav anchor is hidden at start time, because
       * the drawer is shut. Resolving on visibility here dropped all of them
       * and left a one-step tour. What matters is whether this account has
       * the element at all: an account with no company genuinely has no
       * `nav-companies`, and that is the only case worth dropping.
       */
      return anchorExists(step.anchor);
    });
    setIndex(0);
    setSteps(resolved.length > 0 ? resolved : null);
  }, []);

  const stop = useCallback((reason: "finished" | "skipped") => {
    setSteps(null);
    setIndex(0);
    // Only here, never between steps: closing it mid-tour is what hid every
    // anchor the resolver had just found.
    closeDrawerIfOpen();
    // Skipping counts exactly as finishing. Someone who dismissed it has seen
    // it as far as they intend to, and showing it again tomorrow is the
    // behaviour that teaches people to distrust the dismiss button.
    if (sourceRef.current === "auto") {
      void markTourCompleted(tourRef.current).catch(() => {
        // A failed write means the tour may run once more on the next visit.
        // That is a far better failure than blocking the dashboard on it.
      });
    }
    void reason;
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      if (steps && i >= steps.length - 1) {
        // Defer the stop out of the updater: calling it inline would set state
        // during another component's render phase.
        queueMicrotask(() => stop("finished"));
        return i;
      }
      return i + 1;
    });
  }, [steps, stop]);

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Escape is bound once, here, rather than per popover. Binding it in the
  // popover means it stops working the moment focus leaves it.
  useEffect(() => {
    if (!isRunning) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop("skipped");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRunning, stop]);

  const value = useMemo(() => ({ isRunning, start, stop }), [isRunning, start, stop]);

  const current = steps?.[index];

  return (
    <TourContext.Provider value={value}>
      {children}
      {/*
        One live region, mounted for the life of the provider rather than per
        step. Mounting a fresh live region and filling it in the same commit
        announces nothing in several screen readers, because the region was not
        being observed when its content arrived.
      */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {current ? `Step ${index + 1} of ${steps!.length}. ${current.title}. ${current.body}` : ""}
      </div>
      {current && steps && (
        <TourSpotlight
          key={current.id}
          step={current}
          index={index}
          total={steps.length}
          onNext={next}
          onBack={back}
          onSkip={() => stop("skipped")}
        />
      )}
    </TourContext.Provider>
  );
}
