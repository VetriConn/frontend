"use client";

import { useEffect, useState } from "react";
import { readConsent, writeConsent } from "@/lib/consent";

/**
 * Asks before anything non-essential is stored.
 *
 * A bar at the foot of the page rather than a modal over it. A modal that
 * blocks the page is the pattern that trains people to click whatever makes
 * it go away, and the answer it extracts is worth nothing; this one lets
 * somebody read the site and decide.
 *
 * Accept and Decline are the same size, weight and prominence. A quiet
 * "decline" beside a loud "accept" is the dark pattern regulators name
 * first, and a consent obtained that way is not obviously consent.
 *
 * Rendered only until a decision exists. There is no third state to come
 * back to, because the only thing being asked about is analytics.
 *
 * Nothing is stored before the answer: the beacon checks analyticsAllowed()
 * itself, so this component writing nothing means nothing is collected.
 */
export default function CookieConsent() {
  // Starts hidden and is shown from an effect, deliberately. The server has
  // no way to know what this visitor already chose, so rendering the bar
  // during SSR would flash it at people who decided months ago.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (choice: "granted" | "denied") => {
    writeConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white p-4 shadow-[0_-4px_12px_rgba(15,23,42,0.06)] md:p-5"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p
            id="cookie-consent-title"
            className="font-lato text-base font-bold text-text"
          >
            Help us see how people find Vetriconn
          </p>
          <p className="mt-1 font-open-sans text-sm leading-relaxed text-gray-600">
            We would like to record which site you arrived from and which pages
            you open, so we know where to reach more veterans and retirees. It
            is counted, never sold, and never tied to your name. Decline and
            the site works exactly the same.
          </p>
        </div>

        {/* Equal weight on both, and Decline first in the DOM so it is not
            the afterthought a keyboard reaches last. */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="min-h-[48px] rounded-full border border-gray-300 bg-white px-7 font-open-sans text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="min-h-[48px] rounded-full border border-gray-300 bg-white px-7 font-open-sans text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
