import useSWR from "swr";
import {
  adminGetTrafficSummary,
  type TrafficSummary,
} from "@/lib/api/telemetry";

/** Window presets. The backend caps the range at 90 days and rejects more. */
export const TELEMETRY_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
] as const;

export const DEFAULT_TELEMETRY_RANGE = "7";

/**
 * The traffic report for a rolling window of whole UTC days.
 *
 * `from` is pinned to midnight UTC rather than "now minus N days" so the key
 * is stable for the whole day. Keyed on the day string, not on a Date, or
 * every render would produce a new key and refetch.
 *
 * It counts back span-1 days, not span, and that is load-bearing rather than
 * an off-by-one. "Last 90 days" in daily buckets means today plus the 89
 * before it. Counting back a full 90 and letting the server default `to` to
 * NOW made the window 90 days plus however far into today it was, which is
 * over the server's 90-day cap: the longest option answered 400 and the page
 * showed its error state. It passed at 00:00 UTC and failed by lunchtime,
 * which is why neither the typechecker nor a from-value assertion caught it.
 */
export function useAdminTelemetry(days: string) {
  const span = Number(days) || 7;
  const to = new Date();
  const startOfToday = Date.UTC(
    to.getUTCFullYear(),
    to.getUTCMonth(),
    to.getUTCDate(),
  );
  const from = new Date(startOfToday - (span - 1) * 24 * 60 * 60 * 1000);
  const fromDay = from.toISOString().slice(0, 10);

  const { data, error, isLoading, mutate } = useSWR<TrafficSummary | null>(
    ["admin-telemetry", fromDay, span],
    () => adminGetTrafficSummary({ from: fromDay }),
  );

  return {
    summary: data ?? null,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
