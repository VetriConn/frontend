"use client";

import { useEffect } from "react";
import { sendVisitBeacon } from "@/lib/telemetry";

/**
 * Fires the landing beacon once per browser session.
 *
 * A component rather than a call in the layout because the layout is a
 * server component and this needs the browser's referrer and query string.
 * It renders nothing and is mounted once, at the root.
 *
 * Deliberately not re-fired on route changes: the beacon records where the
 * visit came from, which is a property of the session, not of each page. The
 * once-per-session guard lives in sendVisitBeacon so it holds even if this
 * ever mounts twice (React strict mode double-invokes effects in dev).
 */
export default function VisitBeacon() {
  useEffect(() => {
    sendVisitBeacon();
  }, []);

  return null;
}
