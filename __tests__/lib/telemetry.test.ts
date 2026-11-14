/**
 * Tests for the landing beacon.
 *
 * This runs on every visitor's first page load and must never be able to
 * affect the page, so most of what matters here is what it does NOT do:
 * never fire twice, never throw, never reject a promise, never block when
 * storage is unavailable.
 */

import { sendVisitBeacon } from "@/lib/telemetry";

const SESSION_KEY = "vc_visit_sent";

/** Put the browser on a given URL and referrer for one test. */
const land = (url: string, referrer = "") => {
  window.history.replaceState({}, "", url);
  Object.defineProperty(document, "referrer", {
    value: referrer,
    configurable: true,
  });
};

const bodyOf = (call: unknown[]): Record<string, unknown> =>
  JSON.parse((call[1] as RequestInit).body as string);

describe("sendVisitBeacon", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    sessionStorage.clear();
    fetchMock = jest.fn().mockResolvedValue({ status: 204 });
    global.fetch = fetchMock as unknown as typeof fetch;
    land("/");
  });

  describe("sending at most once per session", () => {
    it("sends on the first call", () => {
      sendVisitBeacon();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does not send again in the same session", () => {
      sendVisitBeacon();
      sendVisitBeacon();
      sendVisitBeacon();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // React strict mode double-invokes effects in development, and the
    // component may remount on navigation. The guard has to live in the
    // function, not in the caller.
    it("does not send when the guard is already set by an earlier load", () => {
      sessionStorage.setItem(SESSION_KEY, "1");
      sendVisitBeacon();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("sets the guard before awaiting the request, so a slow network cannot double-send", () => {
      fetchMock.mockImplementation(() => new Promise(() => {}));
      sendVisitBeacon();
      sendVisitBeacon();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(sessionStorage.getItem(SESSION_KEY)).toBe("1");
    });
  });

  describe("what it sends", () => {
    it("posts to the visit endpoint", () => {
      sendVisitBeacon();
      expect(String(fetchMock.mock.calls[0][0])).toContain(
        "/api/v1/telemetry/visit",
      );
      expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe("POST");
    });

    it("captures the utm tags from the landing URL", () => {
      land("/jobs?utm_source=linkedin&utm_medium=social&utm_campaign=fall");
      sendVisitBeacon();
      expect(bodyOf(fetchMock.mock.calls[0])).toMatchObject({
        utm_source: "linkedin",
        utm_medium: "social",
        utm_campaign: "fall",
        landing_path: "/jobs",
      });
    });

    it("sends the path without its query string", () => {
      land("/jobs/abc123?utm_source=x&q=welder");
      sendVisitBeacon();
      expect(bodyOf(fetchMock.mock.calls[0]).landing_path).toBe("/jobs/abc123");
    });

    it("omits utm fields that are absent rather than sending null", () => {
      land("/");
      sendVisitBeacon();
      const body = bodyOf(fetchMock.mock.calls[0]);
      expect(body).not.toHaveProperty("utm_source");
      expect(body).not.toHaveProperty("utm_medium");
      expect(body).not.toHaveProperty("utm_campaign");
    });

    it("sends the referrer when there is one", () => {
      land("/", "https://www.linkedin.com/feed/");
      sendVisitBeacon();
      expect(bodyOf(fetchMock.mock.calls[0]).referrer).toBe(
        "https://www.linkedin.com/feed/",
      );
    });

    it("omits an empty referrer rather than sending an empty string", () => {
      land("/", "");
      sendVisitBeacon();
      expect(bodyOf(fetchMock.mock.calls[0])).not.toHaveProperty("referrer");
    });
  });

  describe("request options the backend depends on", () => {
    // csrfGuard refuses a cookie-authenticated POST without this header, so a
    // signed-in visitor's beacon would 403. navigator.sendBeacon cannot set
    // headers, which is why this uses fetch.
    it("sets X-Requested-With", () => {
      sendVisitBeacon();
      const init = fetchMock.mock.calls[0][1] as RequestInit;
      expect((init.headers as Record<string, string>)["X-Requested-With"]).toBe(
        "XMLHttpRequest",
      );
    });

    // Without credentials the backend cannot tell signed-in from anonymous,
    // which is half of what the report measures.
    it("sends credentials", () => {
      sendVisitBeacon();
      expect((fetchMock.mock.calls[0][1] as RequestInit).credentials).toBe(
        "include",
      );
    });

    // The beacon fires on first paint. Without keepalive the request dies
    // with the page when somebody clicks straight through.
    it("sets keepalive", () => {
      sendVisitBeacon();
      expect((fetchMock.mock.calls[0][1] as RequestInit).keepalive).toBe(true);
    });
  });

  describe("never disturbing the page", () => {
    it("does not throw when the request rejects", async () => {
      fetchMock.mockRejectedValue(new Error("offline"));
      expect(() => sendVisitBeacon()).not.toThrow();
      // Let the rejection settle; an unhandled rejection would fail the run.
      await Promise.resolve();
    });

    it("does not throw, or send, when sessionStorage is unavailable", () => {
      const spy = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("storage disabled");
        });
      expect(() => sendVisitBeacon()).not.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("does not throw when setItem is blocked, and sends nothing", () => {
      const spy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("quota");
        });
      expect(() => sendVisitBeacon()).not.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
