/**
 * Traffic telemetry — the landing beacon and the super-admin report.
 *
 * Mirrors backend/docs/telemetry.md. Two event kinds reach the backend from
 * different places: `request` events are written by middleware on every API
 * call and need nothing from us, while `visit` events exist only because the
 * original referrer and the utm tags live in the browser and are gone by the
 * time any ordinary API call is made.
 */
import { apiFetch, API_BASE_URL, ApiEnvelope } from "./client";

/** One `{ key, count }` row from a `countBy` facet. `key` is null when the field was unset. */
export interface TelemetryCount {
  key: string | null;
  count: number;
}

/** One day of one auth state. The series is sparse: a day with no events has no row. */
export interface TelemetryDaily {
  day: string;
  auth_state: string;
  count: number;
}

export interface TelemetryRoute {
  method: string;
  route: string;
  count: number;
  authenticated: number;
  anonymous: number;
  avg_ms: number;
}

export interface TelemetryRequests {
  total: number;
  by_auth_state: TelemetryCount[];
  unique_visitors_by_auth_state: TelemetryCount[];
  by_role: TelemetryCount[];
  by_client: TelemetryCount[];
  by_origin: TelemetryCount[];
  by_country: TelemetryCount[];
  top_routes: TelemetryRoute[];
  daily: TelemetryDaily[];
}

export interface TelemetryVisits {
  total: number;
  by_channel: TelemetryCount[];
  by_auth_state: TelemetryCount[];
  top_referrers: TelemetryCount[];
  top_utm_sources: TelemetryCount[];
  top_utm_campaigns: TelemetryCount[];
  top_landing_paths: TelemetryCount[];
  by_client: TelemetryCount[];
  by_country: TelemetryCount[];
  daily: TelemetryDaily[];
}

export interface TrafficSummary {
  window: { from: string; to: string };
  requests: TelemetryRequests;
  visits: TelemetryVisits;
}

/**
 * GET /api/v1/admin/telemetry/traffic
 *
 * super_admin only, and gated on the `analytics.view` permission. The window
 * defaults to seven days and the backend rejects anything over ninety.
 */
export async function adminGetTrafficSummary(params?: {
  from?: string;
  to?: string;
}): Promise<TrafficSummary | null> {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const query = qs.toString();
  const res = await apiFetch<ApiEnvelope<TrafficSummary>>(
    `${API_BASE_URL}/api/v1/admin/telemetry/traffic${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
  return res.data ?? null;
}
