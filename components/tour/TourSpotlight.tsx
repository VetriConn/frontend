"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TourStep } from "@/lib/tour/steps";
import { resolveAnchor } from "@/lib/tour/anchors";

interface Props {
  step: TourStep;
  index: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Breathing room around the cutout, in px at 100% text. */
const PAD = 8;

export default function TourSpotlight({
  step,
  index,
  total,
  onNext,
  onBack,
  onSkip,
}: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const measure = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    // A target that vanished mid-tour, for example because the drawer closed.
    // Advance rather than point at a stale rectangle.
    if (el.getClientRects().length === 0) {
      onNext();
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [onNext]);

  // Resolve, scroll, then measure. The frame between matters: a rect read
  // during a smooth scroll is the position the element is passing through,
  // not the one it lands on.
  useEffect(() => {
    let cancelled = false;
    // No clearing on the no-anchor path: the provider gives this component a
    // `key` of the step id, so each step is a fresh mount and `rect` already
    // starts null. Writing it here would be synchronising state the component
    // derives from its own props.
    if (!step.anchor) return;
    void (async () => {
      const el = await resolveAnchor(step.anchor!);
      if (cancelled || !el) return;
      targetRef.current = el;
      el.scrollIntoView({ block: "center", inline: "nearest" });
      requestAnimationFrame(() => {
        if (!cancelled) measure();
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [step.anchor, measure]);

  // Re-measure on anything that can move the target under us. The
  // ResizeObserver is what catches a text-size change mid-tour: the nav item
  // grows, and without this the cutout stays where the smaller one was.
  useEffect(() => {
    if (!step.anchor) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    const ro = targetRef.current ? new ResizeObserver(schedule) : null;
    if (ro && targetRef.current) ro.observe(targetRef.current);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      ro?.disconnect();
    };
  }, [step.anchor, measure]);

  // Focus the heading, which both moves keyboard focus into the popover and
  // gives the screen reader something to read on arrival.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step.id]);

  // The tour only ever mounts from a client interaction, never during SSR, so
  // a mounted flag would be state tracking something that is always true by
  // the time this renders. The guard is here for the portal target alone.
  if (typeof document === "undefined") return null;

  const isLast = index === total - 1;
  const cut = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  // Below the target when there is room beneath it, above otherwise.
  const below = !cut || cut.top + cut.height < window.innerHeight * 0.6;

  const popoverStyle: React.CSSProperties = cut
    ? {
        position: "fixed",
        top: below ? cut.top + cut.height + 12 : undefined,
        bottom: below ? undefined : window.innerHeight - cut.top + 12,
        left: Math.max(12, Math.min(cut.left, window.innerWidth - 12 - 320)),
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };

  return createPortal(
    <div className="fixed inset-0 z-[100]" aria-hidden={false}>
      {/*
        Four panels rather than one overlay with a hole. A box-shadow cutout
        would also swallow pointer events over the target, and the page
        underneath is meant to stay readable and scrollable: this tour is not
        modal, which is why the dialog below says so.
      */}
      {cut ? (
        <>
          <div className="fixed inset-x-0 top-0 bg-black/50" style={{ height: Math.max(0, cut.top) }} />
          <div className="fixed inset-x-0 bg-black/50" style={{ top: cut.top + cut.height, bottom: 0 }} />
          <div className="fixed bg-black/50" style={{ top: cut.top, height: cut.height, left: 0, width: Math.max(0, cut.left) }} />
          <div className="fixed bg-black/50" style={{ top: cut.top, height: cut.height, left: cut.left + cut.width, right: 0 }} />
          <div
            className="fixed rounded-lg ring-2 ring-primary pointer-events-none"
            style={{ top: cut.top, left: cut.left, width: cut.width, height: cut.height }}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-black/50" />
      )}

      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={`tour-title-${step.id}`}
        style={popoverStyle}
        /*
         * rem throughout. The accessibility panel scales text by setting a root
         * font size, so a popover measured in px stays put while everything it
         * points at grows, and the two drift apart at 125% exactly the way the
         * avatar did before it was moved to rem.
         */
        className="w-[20rem] max-w-[calc(100vw-1.5rem)] rounded-xl bg-white p-[1.25rem] shadow-xl"
      >
        <p className="text-[0.75rem] font-medium text-gray-500">
          Step {index + 1} of {total}
        </p>
        <h2
          id={`tour-title-${step.id}`}
          ref={headingRef}
          tabIndex={-1}
          className="mt-1 text-[1.0625rem] font-semibold text-gray-900 outline-none"
        >
          {step.title}
        </h2>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-gray-600">
          {step.body}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          {/* Skip is always visible, never only an overlay click. */}
          <button
            onClick={onSkip}
            className="min-h-[2.75rem] px-3 text-[0.875rem] font-medium text-gray-500 hover:text-gray-800"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                onClick={onBack}
                className="min-h-[2.75rem] rounded-lg border border-gray-300 px-4 text-[0.875rem] font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="min-h-[2.75rem] rounded-lg bg-primary px-4 text-[0.875rem] font-medium text-white hover:bg-primary-hover"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
