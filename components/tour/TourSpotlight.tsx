"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TourStep } from "@/lib/tour/steps";
import { findVisible, resolveAnchor } from "@/lib/tour/anchors";

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
    let el = targetRef.current;
    /*
     * Re-resolve, never advance.
     *
     * This used to call onNext() when the tracked element went invisible,
     * which read as graceful and was not: measure runs on every resize, so
     * dragging the window across the navbar's breakpoint stepped the tour
     * forward, and on a phone, where every anchor is inside the drawer, it
     * ran away with itself.
     *
     * An invisible anchor almost always means the OTHER copy of it is the
     * visible one, so look the id up again and retarget.
     */
    if (!el || el.getClientRects().length === 0) {
      const fresh = step.anchor ? findVisible(step.anchor) : null;
      if (!fresh) {
        // Genuinely unreachable for now. Hide the cutout rather than draw it
        // somewhere wrong, and wait: a resize or the drawer opening will
        // bring us back through here.
        setRect(null);
        return;
      }
      targetRef.current = fresh;
      el = fresh;
    }
    const r = el.getBoundingClientRect();
    /*
     * Only set state when the rect actually moved.
     *
     * This used to allocate a fresh object every measure, and measure runs on
     * scroll, on resize and from a ResizeObserver. A quiet page still churned
     * re-renders, and that broke the open-the-menu step outright: its poll
     * lives in an effect keyed on the step, so every re-render tore the
     * interval down and started a new one, and the 120ms never elapsed. The
     * reader tapped the menu, the drawer opened, and the tour sat there.
     */
    setRect((prev) =>
      prev &&
      prev.top === r.top &&
      prev.left === r.left &&
      prev.width === r.width &&
      prev.height === r.height
        ? prev
        : { top: r.top, left: r.left, width: r.width, height: r.height },
    );
  }, [step.anchor]);

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
      // rAF or a timer, whichever lands first: a hidden tab never paints, and
      // waiting only on the frame would leave the popover unpositioned.
      let measured = false;
      const run = () => {
        if (measured || cancelled) return;
        measured = true;
        measure();
      };
      requestAnimationFrame(run);
      setTimeout(run, 50);
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
    let timer: ReturnType<typeof setTimeout>;
    /*
     * rAF for smoothness, a timer because rAF does not fire in a hidden tab.
     * Without the timer a resize that happens while the tab is backgrounded
     * is never measured, so returning to the tab shows the spotlight still
     * drawn around where the element used to be.
     */
    const schedule = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = requestAnimationFrame(measure);
      timer = setTimeout(measure, 60);
    };
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    // Coming back to a backgrounded tab is itself a reason to re-measure:
    // the layout may have changed the whole time we were not painting.
    document.addEventListener("visibilitychange", schedule);
    const ro = targetRef.current ? new ResizeObserver(schedule) : null;
    if (ro && targetRef.current) ro.observe(targetRef.current);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      document.removeEventListener("visibilitychange", schedule);
      ro?.disconnect();
    };
  }, [step.anchor, measure]);

  // Focus the heading, which both moves keyboard focus into the popover and
  // gives the screen reader something to read on arrival.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step.id]);

  /*
   * A step that waits on the reader rather than on a Next click.
   *
   * Only the open-the-menu step uses this. Polling rather than listening
   * because the thing being watched is the drawer's own aria-expanded, and
   * subscribing to that would mean reaching into the navbar's state, which
   * is the coupling this whole redesign removed.
   */
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  /**
   * A step that waits on the reader, such as "open the menu".
   *
   * Watches the DOM rather than polling it. A poll alone is not safe here:
   * browsers clamp `setInterval` in a tab that is not being painted, to one
   * second at first and to once a minute once the tab has been hidden a
   * while, so the tour can sit on this step long after the menu is open. That
   * is the same failure `nextFrame` already guards against for
   * `requestAnimationFrame`, and it cost an afternoon of chasing a stall in a
   * headless browser that turned out to be only the throttle.
   *
   * A `MutationObserver` callback is a microtask, which nothing clamps, so
   * the answer arrives on the same tick as the change. The observer is wide
   * on purpose: `waitFor` is an arbitrary predicate and this component has no
   * business guessing which node it reads. The predicate is one
   * `querySelectorAll`, and it is only live for a single step.
   *
   * The interval stays as a backstop for a predicate that no DOM change
   * announces, and `visibilitychange` covers coming back to a tab where the
   * clamp swallowed the notification.
   */
  useEffect(() => {
    const waitFor = step.waitFor;
    if (!waitFor) return;

    let done = false;
    const check = () => {
      if (done || !waitFor()) return;
      done = true;
      cleanup();
      onNextRef.current();
    };

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
    });
    const id = setInterval(check, 250);
    document.addEventListener("visibilitychange", check);

    function cleanup() {
      observer.disconnect();
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    }
    return cleanup;
    // Keyed on the step alone. Depending on onNext put a function identity in
    // the dependency list, so anything that re-rendered the component reset
    // the timer, which is how a poll can run forever without ever firing.
  }, [step.id, step.waitFor]);

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
    /*
     * pointer-events-none on the wrapper, auto on each child.
     *
     * The four panels leave a real hole over the target, but this wrapper is
     * fixed inset-0 and sat above it, so every tap in that hole landed on the
     * wrapper instead of the thing being pointed at. On a phone that made the
     * open-the-menu step impossible to complete: the tour asked the reader to
     * tap the button and then ate the tap.
     *
     * The comment below already warned that a box-shadow cutout would swallow
     * pointer events over the target. The panels avoided that and the wrapper
     * reintroduced it one level up.
     */
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-hidden={false}>
      {/*
        Four panels rather than one overlay with a hole. A box-shadow cutout
        would also swallow pointer events over the target, and the page
        underneath is meant to stay readable and scrollable: this tour is not
        modal, which is why the dialog below says so.
      */}
      {cut ? (
        <>
          <div className="tour-move pointer-events-auto fixed inset-x-0 top-0 bg-black/50" style={{ height: Math.max(0, cut.top) }} />
          <div className="tour-move pointer-events-auto fixed inset-x-0 bg-black/50" style={{ top: cut.top + cut.height, bottom: 0 }} />
          <div className="tour-move pointer-events-auto fixed bg-black/50" style={{ top: cut.top, height: cut.height, left: 0, width: Math.max(0, cut.left) }} />
          <div className="tour-move pointer-events-auto fixed bg-black/50" style={{ top: cut.top, height: cut.height, left: cut.left + cut.width, right: 0 }} />
          <div
            className="tour-move fixed rounded-lg ring-2 ring-primary pointer-events-none"
            style={{ top: cut.top, left: cut.left, width: cut.width, height: cut.height }}
          />
        </>
      ) : (
        <div className="pointer-events-auto fixed inset-0 bg-black/50" />
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
        className={`${cut ? "tour-move tour-pop" : "tour-pop-center"} pointer-events-auto w-[20rem] max-w-[calc(100vw-1.5rem)] rounded-xl bg-white p-[1.25rem] shadow-xl`}
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
            {step.waitFor ? (
              // No Next: this step ends when the reader opens the menu.
              <span className="text-[0.875rem] font-medium text-gray-400">
                Waiting for you
              </span>
            ) : (
              <button
                onClick={onNext}
                className="min-h-[2.75rem] rounded-lg bg-primary px-4 text-[0.875rem] font-medium text-white hover:bg-primary-hover"
              >
                {isLast ? "Done" : "Next"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
