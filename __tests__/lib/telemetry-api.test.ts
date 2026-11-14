/**
 * Tests for the traffic-report API client.
 *
 * Thin by design, so what is worth asserting is the query it builds and the
 * fact that an empty envelope yields null rather than undefined — the page
 * branches on `summary` being null.
 */

import { adminGetTrafficSummary } from "@/lib/api/telemetry";
import { apiFetch } from "@/lib/api/client";

jest.mock("@/lib/api/client", () => ({
  __esModule: true,
  apiFetch: jest.fn(),
  API_BASE_URL: "https://api.test",
}));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const envelope = (data: unknown) => ({ success: true, message: "ok", data });

const urlOf = (): string => String(mockedFetch.mock.calls[0][0]);

describe("adminGetTrafficSummary", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedFetch.mockResolvedValue(envelope({ window: {}, requests: {}, visits: {} }));
  });

  it("calls the admin traffic endpoint with GET", async () => {
    await adminGetTrafficSummary();
    expect(urlOf()).toBe("https://api.test/api/v1/admin/telemetry/traffic");
    expect(mockedFetch.mock.calls[0][1]).toMatchObject({ method: "GET" });
  });

  it("sends no query string when no window is given", async () => {
    await adminGetTrafficSummary();
    expect(urlOf()).not.toContain("?");
  });

  it("passes from and to through", async () => {
    await adminGetTrafficSummary({ from: "2026-11-01", to: "2026-11-11" });
    expect(urlOf()).toContain("from=2026-11-01");
    expect(urlOf()).toContain("to=2026-11-11");
  });

  it("omits a missing bound rather than sending it empty", async () => {
    await adminGetTrafficSummary({ from: "2026-11-01" });
    expect(urlOf()).toContain("from=2026-11-01");
    expect(urlOf()).not.toContain("to=");
  });

  it("returns the summary from the envelope", async () => {
    const summary = { window: { from: "a", to: "b" }, requests: {}, visits: {} };
    mockedFetch.mockResolvedValue(envelope(summary));
    await expect(adminGetTrafficSummary()).resolves.toEqual(summary);
  });

  it("returns null, not undefined, when the envelope carries no data", async () => {
    mockedFetch.mockResolvedValue({ success: true, message: "ok" });
    await expect(adminGetTrafficSummary()).resolves.toBeNull();
  });

  // A 403 for a non-super-admin has to reach the caller so the page can show
  // its error state rather than an empty report that looks like no traffic.
  it("propagates a rejection", async () => {
    mockedFetch.mockRejectedValue(new Error("Forbidden"));
    await expect(adminGetTrafficSummary()).rejects.toThrow("Forbidden");
  });
});
