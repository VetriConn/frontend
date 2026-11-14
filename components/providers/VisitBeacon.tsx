"use client";

import { useEffect } from "react";
import { sendVisitBeacon } from "@/lib/telemetry";
import { CONSENT_EVENT } from "@/lib/consent";

/**
 * Fires the landing beacon once per browser session, if allowed.
 *
 * A component rather than a call in the layout because the layout is a
 * server component and this needs the browser's referrer and query string.
 * It renders nothing and is mounted once, at the root.
 *
 * It also listens for the consent decision. Without that, somebody who
 * accepts on the landing page records nothing until they navigate — and
 * the referrer, which is the whole point, is gone by then. The attempt on
 * acceptance is the one that captures the visit they arrived on.
 *
 * Both paths call the same function, and it is the function that decides:
 * it checks consent, then the once-per-session guard. Calling it twice is
 * safe and calling it without consent does nothing.
 */
export default function VisitBeacon() {
  useEffect(() => {
    sendVisitBeacon();

    const onConsent = () => sendVisitBeacon();
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  return null;
}
