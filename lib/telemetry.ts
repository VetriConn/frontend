import { API_BASE_URL } from "./api/client";
import { analyticsAllowed } from "./consent";

const SESSION_KEY = "vc_visit_sent";

/**
 * Tell the backend where this visit came from. Once per browser session.
 *
 * The backend sees our own frontend as the `Referer` on every ordinary API
 * call, so the original referrer and the utm tags on the landing URL exist
 * only here, in the browser, and only until the first navigation. Without
 * this call the `visits` half of the telemetry report stays empty forever.
 *
 * Deliberately raw `fetch` rather than apiFetch, for two reasons:
 *
 *  - apiFetch signs the user out on a 401, or a 403 matching "invalid or
 *    expired token" (see handleExpiredSession). This is fire-and-forget
 *    analytics running on every landing; a stale cookie must never be able
 *    to end somebody's session because of it.
 *  - apiFetch sets no `keepalive`, and this fires on first paint. Without it
 *    the request dies with the page when somebody clicks straight through.
 *
 * It still sets the two headers apiFetch would: `credentials` so the backend
 * can tell signed-in from anonymous, and X-Requested-With because csrfGuard
 * refuses cookie-authenticated posts without it. navigator.sendBeacon cannot
 * set headers at all, which is why it is not used.
 */
export function sendVisitBeacon(): void {
  if (typeof window === "undefined") return;

  // Nothing is recorded until the visitor says yes. This is the gate, not
  // the banner: the banner only writes the decision, and anything that
  // wants to send has to ask here. An unanswered banner, a dismissed one
  // and unreadable storage all come back false.
  if (!analyticsAllowed()) return;

  // sessionStorage throws in some privacy modes. A visitor who blocks it
  // simply gets no beacon rather than an error.
  try {
    if (window.sessionStorage.getItem(SESSION_KEY)) return;
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const body = {
    referrer: document.referrer || undefined,
    landing_path: window.location.pathname,
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
  };

  void fetch(`${API_BASE_URL}/api/v1/telemetry/visit`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
    keepalive: true,
    // Analytics must never surface to the visitor. The endpoint answers 204
    // and is rate limited to 30 per 15 minutes per IP; a refusal is not
    // something they can act on.
  }).catch(() => {});
}
