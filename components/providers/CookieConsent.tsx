"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { readConsent, writeConsent } from "@/lib/consent";

/**
 * Asks before anything optional is stored, and is honest about what is
 * stored regardless.
 *
 * The earlier version said "Decline and the site works exactly the same",
 * which was true about behaviour and misleading about storage: a sign-in
 * cookie, the saved text-size and contrast settings, and this decision
 * itself all persist whichever button is pressed. A cookie notice whose
 * refusal path implies "nothing is kept" is worse than no notice, because
 * it is a statement the product then contradicts.
 *
 * So the two choices are "Accept all" and "Only what is necessary" rather
 * than Accept and Decline. That is the same binary, because there is exactly
 * one optional thing, the traffic beacon. It describes the refusal
 * accurately instead of implying an empty set.
 *
 * Equal prominence is a requirement, not a preference: regulators treat a
 * quieter refusal as a dark pattern, and the EDPB's banner taskforce
 * treats a missing or demoted refusal as an infringement. Both buttons
 * carry identical classes and a test asserts it. "Only what is necessary"
 * comes first so the keyboard reaches it first.
 *
 * A bar, not a blocking modal: a modal trains people to click whatever
 * makes it disappear, and that answer is worth nothing.
 */
export default function CookieConsent() {
  // Hidden until an effect says otherwise. The server cannot know what this
  // visitor already chose, so rendering during SSR flashes the bar at people
  // who decided months ago.
  const [visible, setVisible] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (choice: "granted" | "denied") => {
    writeConsent(choice);
    setVisible(false);
  };

  const button =
    "min-h-[48px] rounded-full border border-gray-300 bg-white px-7 font-open-sans text-sm font-semibold text-text transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 md:p-5"
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]">
        {/* A brand edge rather than a plain box. One red rule reads as ours
            without turning a consent notice into an advertisement. */}
        <div className="h-1 bg-primary" aria-hidden="true" />

        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:gap-8 md:p-6">
          <div className="min-w-0 flex-1">
            <h2
              id="cookie-consent-title"
              className="font-lato text-lg font-bold text-text"
            >
              Your choice about analytics
            </h2>
            <p className="mt-1.5 font-open-sans text-sm leading-relaxed text-gray-600">
              Some things are stored either way, like staying signed in and
              remembering your text size. Separately, we would like to record
              which site you arrived from and which pages you open, so we know
              where to reach more veterans and retirees. That part is counted
              only, never sold, and never shown beside your name.
            </p>

            <button
              type="button"
              onClick={() => setDetailOpen((v) => !v)}
              aria-expanded={detailOpen}
              className="mt-2.5 inline-flex items-center gap-1 font-open-sans text-sm font-semibold text-primary hover:underline"
            >
              What is stored
              <HiOutlineChevronDown
                className={`h-4 w-4 transition-transform ${detailOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {detailOpen && (
              <dl className="mt-3 space-y-3 border-t border-gray-100 pt-3 font-open-sans text-sm">
                <div>
                  <dt className="font-semibold text-text">
                    Necessary. Always on.
                  </dt>
                  <dd className="mt-0.5 text-gray-600">
                    Your sign-in session, your accessibility settings such as
                    text size and contrast, and this choice itself so you are
                    not asked again. Without these the site cannot keep you
                    signed in or remember how you like to read it.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">
                    Analytics. Only if you accept.
                  </dt>
                  <dd className="mt-0.5 text-gray-600">
                    The site you arrived from, any campaign tag in the link,
                    and which pages you open. Kept for 90 days, then deleted
                    automatically. No advertising and no third party.
                  </dd>
                </div>
                <div className="pt-0.5">
                  <Link
                    href="/cookies"
                    className="font-semibold text-primary hover:underline"
                  >
                    Cookie Policy
                  </Link>
                  <span className="text-gray-400"> &middot; </span>
                  <Link
                    href="/privacy"
                    className="font-semibold text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </dl>
            )}
          </div>

          {/* Identical classes on both, asserted in a test. */}
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <button type="button" onClick={() => decide("denied")} className={button}>
              Only what is necessary
            </button>
            <button type="button" onClick={() => decide("granted")} className={button}>
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
