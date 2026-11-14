"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent } from "@/lib/consent";

/**
 * Cookie notice.
 *
 * Short by design. The first layer says what is happening in two sentences
 * and offers the two answers; everything else lives behind "Manage
 * preferences" or in the Cookie Policy. A notice that explains the whole
 * storage model up front is a notice nobody reads, and an unread consent is
 * not much of a consent.
 *
 * Two categories, not the usual four. Most banners list Performance,
 * Functional and Targeting because most sites have them. This product has
 * exactly one optional thing, the traffic beacon, so inventing categories
 * to look conventional would mean describing storage that does not exist.
 *
 * Accessibility settings and the sign-in session sit under Strictly
 * Necessary on the standard reading: they are set in response to something
 * the visitor asked for, which for a site aimed at older readers matters
 * more than usual. Switching off a saved text size is not a privacy win.
 *
 * Accept and Decline carry identical classes and a test asserts it.
 * Regulators treat a quieter refusal as a dark pattern and the EDPB banner
 * taskforce treats a demoted refusal as an infringement. "Manage
 * preferences" is deliberately quieter, because it is navigation rather
 * than a consent choice.
 */
export default function CookieConsent() {
  // Hidden until an effect says otherwise: the server cannot know what this
  // visitor already chose, so rendering during SSR flashes the bar at people
  // who decided months ago.
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (choice: "granted" | "denied") => {
    writeConsent(choice);
    setVisible(false);
  };

  const choiceButton =
    "min-h-[44px] rounded-full border border-gray-300 bg-white px-8 font-open-sans text-sm font-semibold text-text transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 md:p-5"
    >
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]">
        <div className="h-1 bg-primary" aria-hidden="true" />

        <div className="p-5 md:p-6">
          <h2
            id="cookie-consent-title"
            className="font-lato text-lg font-bold text-text"
          >
            We use cookies
          </h2>
          <p className="mt-1.5 font-open-sans text-sm leading-relaxed text-gray-600">
            Some keep you signed in and remember your reading settings. Others
            let us see which site you came from, so we know where to reach more
            veterans and retirees. Read our{" "}
            <Link href="/cookies" className="font-semibold text-primary hover:underline">
              Cookie Policy
            </Link>
            .
          </p>

          {managing && (
            <div className="mt-5 space-y-4 border-t border-gray-100 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-open-sans text-sm font-semibold text-text">
                    Strictly necessary
                  </p>
                  <p className="mt-0.5 font-open-sans text-sm leading-relaxed text-gray-600">
                    Your sign-in session, your text size and contrast settings,
                    and this choice. The site cannot work without them.
                  </p>
                </div>
                <span className="shrink-0 font-open-sans text-xs font-bold uppercase tracking-wide text-primary">
                  Always active
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-open-sans text-sm font-semibold text-text">
                    Analytics
                  </p>
                  <p className="mt-0.5 font-open-sans text-sm leading-relaxed text-gray-600">
                    Which site you arrived from and which pages you open. Kept
                    90 days, never sold, no third party.
                  </p>
                </div>
                {/* A real checkbox under the switch, so it is reachable by
                    keyboard and announced correctly without ARIA guesswork. */}
                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="sr-only">Allow analytics</span>
                  <span className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2" />
                  <span className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {/* Quieter on purpose: navigation, not a consent choice. */}
            {!managing && (
              <button
                type="button"
                onClick={() => setManaging(true)}
                className="min-h-[44px] rounded-full px-4 font-open-sans text-sm font-semibold text-gray-600 underline-offset-2 transition-colors hover:text-primary hover:underline sm:mr-auto"
              >
                Manage preferences
              </button>
            )}

            {managing ? (
              <button
                type="button"
                onClick={() => decide(analytics ? "granted" : "denied")}
                className={choiceButton}
              >
                Save preferences
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => decide("denied")}
                  className={choiceButton}
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => decide("granted")}
                  className={choiceButton}
                >
                  Accept
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
