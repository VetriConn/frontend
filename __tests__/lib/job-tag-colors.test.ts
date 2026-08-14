/**
 * Unit Tests for mapTagColor
 *
 * Maps a free-text job tag onto one of the fixed colour-token names.
 * Matching is case-insensitive, substring-based, and first-rule-wins.
 */

import { mapTagColor } from "@/lib/job-tag-colors";

describe("mapTagColor", () => {
  describe("react bucket", () => {
    it.each(["react", "frontend", "ui", "web"])(
      "should map %s to react",
      (tag) => {
        expect(mapTagColor(tag)).toBe("react");
      },
    );
  });

  describe("mobile bucket", () => {
    it.each(["mobile", "ios", "android", "flutter", "dart"])(
      "should map %s to mobile",
      (tag) => {
        expect(mapTagColor(tag)).toBe("mobile");
      },
    );
  });

  describe("web bucket (backend-ish tags)", () => {
    it.each(["backend", "api", "node", "server", "database", "devops", "cloud"])(
      "should map %s to web",
      (tag) => {
        expect(mapTagColor(tag)).toBe("web");
      },
    );
  });

  describe("ios bucket (security-ish tags)", () => {
    it.each(["security", "compliance", "risk"])(
      "should map %s to ios",
      (tag) => {
        expect(mapTagColor(tag)).toBe("ios");
      },
    );
  });

  describe("android bucket (seniority tags)", () => {
    it.each(["lead", "manager", "director", "executive"])(
      "should map %s to android",
      (tag) => {
        expect(mapTagColor(tag)).toBe("android");
      },
    );
  });

  describe("fallback", () => {
    it("should fall back to flutter for an unrecognised tag", () => {
      expect(mapTagColor("Accounting")).toBe("flutter");
    });

    it("should fall back to flutter for an empty tag", () => {
      expect(mapTagColor("")).toBe("flutter");
    });
  });

  describe("normalisation and matching rules", () => {
    it("should be case-insensitive", () => {
      expect(mapTagColor("REACT")).toBe("react");
      expect(mapTagColor("Security")).toBe("ios");
    });

    it("should match on a substring within a longer phrase", () => {
      expect(mapTagColor("Senior React Developer")).toBe("react");
      expect(mapTagColor("Cloud Infrastructure Engineer")).toBe("web");
    });

    it("should let the first matching rule win over later ones", () => {
      // "frontend" (react rule) is checked before "lead" (android rule).
      expect(mapTagColor("Frontend Lead")).toBe("react");
      // "mobile" (mobile rule) is checked before "backend" (web rule).
      expect(mapTagColor("Mobile Backend")).toBe("mobile");
    });

    it("should match substrings inside unrelated words", () => {
      // Documented consequence of substring matching: "guides" contains "ui".
      expect(mapTagColor("guides")).toBe("react");
    });

    it("should return a stable result for the same input", () => {
      expect(mapTagColor("DevOps")).toBe(mapTagColor("DevOps"));
    });
  });
});
