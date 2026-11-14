/**
 * Tests for the analytics consent record.
 *
 * The property that matters is the default. Every path that is not an
 * explicit, readable "granted" has to come back false — unanswered,
 * declined, corrupted, and storage that throws. A bug here does not look
 * like a bug; it looks like analytics quietly working.
 */

import {
  readConsent,
  writeConsent,
  analyticsAllowed,
  CONSENT_EVENT,
} from "@/lib/consent";

const KEY = "vc:analytics-consent";

describe("consent", () => {
  beforeEach(() => localStorage.clear());

  describe("default", () => {
    it("is unanswered before the visitor is asked", () => {
      expect(readConsent()).toBeNull();
    });

    it("does not allow analytics when unanswered", () => {
      expect(analyticsAllowed()).toBe(false);
    });

    it("does not allow analytics when declined", () => {
      writeConsent("denied");
      expect(analyticsAllowed()).toBe(false);
    });

    it("allows analytics only on an explicit yes", () => {
      writeConsent("granted");
      expect(analyticsAllowed()).toBe(true);
    });
  });

  describe("reading back what was stored", () => {
    it("remembers a grant", () => {
      writeConsent("granted");
      expect(readConsent()).toBe("granted");
    });

    it("remembers a refusal, rather than asking again", () => {
      writeConsent("denied");
      expect(readConsent()).toBe("denied");
    });

    it("lets the visitor change their mind", () => {
      writeConsent("granted");
      writeConsent("denied");
      expect(analyticsAllowed()).toBe(false);
    });
  });

  describe("values it did not write", () => {
    // Anything from an older version, another tool, or a hand-edited
    // devtools session. None of it is consent.
    it.each(["yes", "true", "1", "GRANTED", "", "null"])(
      "treats %p as no answer",
      (value) => {
        localStorage.setItem(KEY, value);
        expect(readConsent()).toBeNull();
        expect(analyticsAllowed()).toBe(false);
      },
    );
  });

  describe("when storage is unavailable", () => {
    // Private browsing. The visitor cannot be asked to pay for that with
    // silent collection.
    it("reads as unanswered rather than throwing", () => {
      const spy = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("blocked");
        });
      expect(readConsent()).toBeNull();
      expect(analyticsAllowed()).toBe(false);
      spy.mockRestore();
    });

    it("does not throw when the decision cannot be saved", () => {
      const spy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("quota");
        });
      expect(() => writeConsent("granted")).not.toThrow();
      spy.mockRestore();
    });
  });

  describe("announcing the decision", () => {
    // So the beacon can fire on the visit they are on, rather than waiting
    // for a navigation that loses the referrer.
    it("emits an event when the visitor decides", () => {
      const seen: string[] = [];
      const handler = (e: Event) =>
        seen.push((e as CustomEvent<string>).detail);
      window.addEventListener(CONSENT_EVENT, handler);
      writeConsent("granted");
      writeConsent("denied");
      window.removeEventListener(CONSENT_EVENT, handler);
      expect(seen).toEqual(["granted", "denied"]);
    });

    it("still emits when storage failed, so the UI stays consistent", () => {
      const spy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("quota");
        });
      const handler = jest.fn();
      window.addEventListener(CONSENT_EVENT, handler);
      writeConsent("granted");
      window.removeEventListener(CONSENT_EVENT, handler);
      spy.mockRestore();
      expect(handler).toHaveBeenCalled();
    });
  });
});

/**
 * The header apiFetch attaches so the backend can honour a refusal.
 *
 * Declining used to stop only the landing beacon. The server kept
 * recording every API call the visitor made, with a daily visitor hash,
 * while the preferences panel showed analytics off. This is the join that
 * makes the panel tell the truth, so it is worth pinning.
 */
describe("the consent header on API calls", () => {
  const { apiFetch } = jest.requireActual("@/lib/api/client");
  let fetchMock: jest.Mock;

  const headerOf = (name: string): string | null =>
    (fetchMock.mock.calls[0][1].headers as Headers).get(name);

  beforeEach(() => {
    localStorage.clear();
    fetchMock = jest.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ success: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("says denied before the visitor has answered", async () => {
    await apiFetch("https://api.test/x", { method: "GET" });
    expect(headerOf("X-Analytics-Consent")).toBe("denied");
  });

  it("says denied when the visitor refused", async () => {
    writeConsent("denied");
    await apiFetch("https://api.test/x", { method: "GET" });
    expect(headerOf("X-Analytics-Consent")).toBe("denied");
  });

  it("says granted once the visitor accepts", async () => {
    writeConsent("granted");
    await apiFetch("https://api.test/x", { method: "GET" });
    expect(headerOf("X-Analytics-Consent")).toBe("granted");
  });

  it("still sends the CSRF header alongside it", async () => {
    await apiFetch("https://api.test/x", { method: "GET" });
    expect(headerOf("X-Requested-With")).toBe("XMLHttpRequest");
  });

  it("lets a caller override it rather than forcing the value", async () => {
    writeConsent("granted");
    await apiFetch("https://api.test/x", {
      method: "GET",
      headers: { "X-Analytics-Consent": "denied" },
    });
    expect(headerOf("X-Analytics-Consent")).toBe("denied");
  });
});
