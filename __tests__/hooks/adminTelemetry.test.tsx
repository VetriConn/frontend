/**
 * Tests for the traffic-report hook.
 *
 * The thing worth pinning is the SWR key. It is derived from a Date, and a
 * key that changes on every render refetches forever; a key that ignores the
 * span serves a 7-day report when the reader asked for 90.
 */

import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import React from "react";
import {
  useAdminTelemetry,
  TELEMETRY_RANGES,
  DEFAULT_TELEMETRY_RANGE,
} from "@/hooks/useAdminTelemetry";
import { adminGetTrafficSummary } from "@/lib/api/telemetry";

jest.mock("@/lib/api/telemetry", () => ({
  __esModule: true,
  adminGetTrafficSummary: jest.fn(),
}));

const mockedGet = adminGetTrafficSummary as jest.MockedFunction<
  typeof adminGetTrafficSummary
>;

/** A fresh SWR cache per test, so one test's data cannot serve another's. */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

const summary = { window: { from: "a", to: "b" }, requests: {}, visits: {} };

describe("TELEMETRY_RANGES", () => {
  it("offers only windows the backend accepts", () => {
    // The backend rejects anything over 90 days with a 400.
    for (const r of TELEMETRY_RANGES) {
      expect(Number(r.value)).toBeLessThanOrEqual(90);
      expect(Number(r.value)).toBeGreaterThan(0);
    }
  });

  it("has a default that is one of the offered options", () => {
    expect(TELEMETRY_RANGES.map((r) => r.value)).toContain(
      DEFAULT_TELEMETRY_RANGE,
    );
  });
});

describe("useAdminTelemetry", () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockResolvedValue(summary as never);
  });

  it("returns the summary once loaded", async () => {
    const { result } = renderHook(() => useAdminTelemetry("7"), { wrapper });
    await waitFor(() => expect(result.current.summary).toEqual(summary));
    expect(result.current.isError).toBe(false);
  });

  it("starts in a loading state", () => {
    const { result } = renderHook(() => useAdminTelemetry("7"), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.summary).toBeNull();
  });

  it("asks for a `from` that matches the requested span", async () => {
    renderHook(() => useAdminTelemetry("30"), { wrapper });
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());
    const from = new Date(`${mockedGet.mock.calls[0][0]!.from}T00:00:00Z`);
    const daysAgo = Math.round(
      (Date.now() - from.getTime()) / (24 * 60 * 60 * 1000),
    );
    expect(daysAgo).toBeGreaterThanOrEqual(29);
    expect(daysAgo).toBeLessThanOrEqual(31);
  });

  /*
   * Regression, and the reason this is asserted as a span rather than as a
   * from-value: the server rejects a window wider than 90 days, and it
   * defaults `to` to NOW when the client sends only `from`. Counting back a
   * full 90 days from midnight made the real window 90 days plus the elapsed
   * part of today, so the longest option answered 400 and the page showed
   * its error state. It passed at 00:00 UTC and failed by mid-morning, which
   * is exactly the shape a fixed-clock test misses.
   */
  describe("the window the server will actually accept", () => {
    const MAX_DAYS = 90;
    const DAY = 24 * 60 * 60 * 1000;

    it.each(TELEMETRY_RANGES.map((r) => r.value))(
      "keeps the %s day window inside the server's cap at any time of day",
      async (value) => {
        mockedGet.mockClear();
        renderHook(() => useAdminTelemetry(value), { wrapper });
        await waitFor(() => expect(mockedGet).toHaveBeenCalled());
        const from = new Date(`${mockedGet.mock.calls[0][0]!.from}T00:00:00Z`);
        // The server compares against its own `new Date()`, so measure the
        // worst case: the request landing at the very end of the UTC day.
        const endOfToday = new Date();
        endOfToday.setUTCHours(23, 59, 59, 999);
        expect(endOfToday.getTime() - from.getTime()).toBeLessThanOrEqual(
          MAX_DAYS * DAY,
        );
      },
    );

    it("still covers the requested number of calendar days", async () => {
      renderHook(() => useAdminTelemetry("7"), { wrapper });
      await waitFor(() => expect(mockedGet).toHaveBeenCalled());
      const from = new Date(`${mockedGet.mock.calls[0][0]!.from}T00:00:00Z`);
      const now = new Date();
      const startOfToday = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
      );
      // Today plus the six before it is seven distinct days.
      expect((startOfToday - from.getTime()) / DAY).toBe(6);
    });
  });

  it("sends a whole-day `from`, not a timestamp", async () => {
    renderHook(() => useAdminTelemetry("7"), { wrapper });
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());
    expect(mockedGet.mock.calls[0][0]!.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // A key built from `new Date()` changes every render and refetches forever.
  it("does not refetch on re-render with the same span", async () => {
    const { rerender } = renderHook(() => useAdminTelemetry("7"), { wrapper });
    await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(1));
    rerender();
    rerender();
    await new Promise((r) => setTimeout(r, 20));
    expect(mockedGet).toHaveBeenCalledTimes(1);
  });

  // Two spans must not share a cache entry, or switching the window would
  // show the previous window's numbers.
  it("fetches again when the span changes", async () => {
    const { rerender } = renderHook(
      ({ days }: { days: string }) => useAdminTelemetry(days),
      { wrapper, initialProps: { days: "7" } },
    );
    await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(1));
    rerender({ days: "90" });
    await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(2));
  });

  it("falls back to seven days for an unparseable span", async () => {
    renderHook(() => useAdminTelemetry("not-a-number"), { wrapper });
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());
    const from = new Date(`${mockedGet.mock.calls[0][0]!.from}T00:00:00Z`);
    const daysAgo = Math.round(
      (Date.now() - from.getTime()) / (24 * 60 * 60 * 1000),
    );
    expect(daysAgo).toBeLessThanOrEqual(8);
  });

  it("reports an error instead of an empty report", async () => {
    mockedGet.mockRejectedValue(new Error("Forbidden"));
    const { result } = renderHook(() => useAdminTelemetry("7"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.summary).toBeNull();
  });
});
