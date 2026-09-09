/**
 * Tests for auth return-URL handling.
 *
 * The `redirect` param arrives in a URL that can be emailed to anyone, so the
 * open-redirect cases below are the point of this module, not an edge case.
 */

import {
  sanitizeReturnUrl,
  withReturnUrl,
  resolvePostAuthPath,
  RETURN_URL_PARAM,
  DEFAULT_POST_AUTH_PATH,
  ADMIN_POST_AUTH_PATH,
  homePathForRole,
} from "@/lib/auth-redirect";

describe("sanitizeReturnUrl", () => {
  describe("accepts in-app paths", () => {
    it.each([
      ["a simple path", "/dashboard"],
      ["a nested path", "/companies/invites/accept"],
      ["a path with a query string", "/companies/invites/accept?token=abc"],
      ["a path with a fragment", "/dashboard#section"],
    ])("should accept %s", (_label, value) => {
      expect(sanitizeReturnUrl(value)).toBe(value);
    });

    it("should trim surrounding whitespace", () => {
      expect(sanitizeReturnUrl("  /dashboard  ")).toBe("/dashboard");
    });
  });

  describe("rejects anything that could leave the site", () => {
    it.each([
      ["an absolute http URL", "https://evil.test/steal"],
      ["a scheme-relative URL", "//evil.test/steal"],
      ["a backslash scheme-relative URL", "/\\evil.test"],
      ["a javascript: URL", "javascript:alert(1)"],
      ["a data: URL", "data:text/html,<script>"],
      ["a mailto: URL", "mailto:someone@evil.test"],
      ["a bare hostname", "evil.test"],
      ["a relative path without a leading slash", "dashboard"],
    ])("should reject %s", (_label, value) => {
      expect(sanitizeReturnUrl(value)).toBeNull();
    });
  });

  describe("empty input", () => {
    it.each([
      ["null", null],
      ["undefined", undefined],
      ["an empty string", ""],
      ["whitespace only", "   "],
    ])("should return null for %s", (_label, value) => {
      expect(sanitizeReturnUrl(value)).toBeNull();
    });
  });
});

describe("withReturnUrl", () => {
  it("should append the return URL as a query param", () => {
    expect(withReturnUrl("/signin", "/dashboard")).toBe(
      `/signin?${RETURN_URL_PARAM}=%2Fdashboard`,
    );
  });

  it("should encode a path that already has a query string", () => {
    const result = withReturnUrl(
      "/signin",
      "/companies/invites/accept?token=abc123",
    );
    expect(result).toBe(
      `/signin?${RETURN_URL_PARAM}=%2Fcompanies%2Finvites%2Faccept%3Ftoken%3Dabc123`,
    );
  });

  it("should use & when the auth path already has a query string", () => {
    expect(withReturnUrl("/signin?foo=bar", "/dashboard")).toBe(
      `/signin?foo=bar&${RETURN_URL_PARAM}=%2Fdashboard`,
    );
  });

  it("should drop an unsafe return URL rather than forwarding it", () => {
    expect(withReturnUrl("/signin", "https://evil.test")).toBe("/signin");
  });

  it("should round-trip through decoding", () => {
    const target = "/companies/invites/accept?token=abc123";
    const url = withReturnUrl("/signin", target);
    const parsed = new URLSearchParams(url.split("?")[1]);

    expect(parsed.get(RETURN_URL_PARAM)).toBe(target);
  });
});

describe("resolvePostAuthPath", () => {
  it("should return a safe path unchanged", () => {
    expect(resolvePostAuthPath("/companies/invites/accept?token=abc")).toBe(
      "/companies/invites/accept?token=abc",
    );
  });

  it("should fall back to the dashboard when absent", () => {
    expect(resolvePostAuthPath(null)).toBe(DEFAULT_POST_AUTH_PATH);
  });

  it("should fall back to the dashboard for an unsafe value", () => {
    expect(resolvePostAuthPath("https://evil.test")).toBe(
      DEFAULT_POST_AUTH_PATH,
  ADMIN_POST_AUTH_PATH,
  homePathForRole,
    );
  });

  it("should honour an explicit fallback", () => {
    expect(resolvePostAuthPath(null, "/jobs")).toBe("/jobs");
  });
});

/**
 * Sign-in pushed everyone to /dashboard. For an admin that is the job-seeker
 * dashboard, and AuthGuard could only bounce them off it once /auth/profile
 * had answered — so an admin watched the wrong dashboard render, sit there
 * for a second, and get replaced. It looked like the previous account's UI
 * persisting. It was the wrong page, arrived at on purpose.
 */
describe("homePathForRole", () => {
  it("sends an admin to the console, not the seeker dashboard", () => {
    expect(homePathForRole("admin")).toBe(ADMIN_POST_AUTH_PATH);
  });

  it("sends everyone else to the dashboard", () => {
    expect(homePathForRole("user")).toBe(DEFAULT_POST_AUTH_PATH);
  });

  it("falls back to the dashboard when the role is not known yet", () => {
    // The 2FA path has no role in hand until the profile fetch lands; the
    // guard still corrects it, so the safe default is the non-privileged one.
    expect(homePathForRole(undefined)).toBe(DEFAULT_POST_AUTH_PATH);
    expect(homePathForRole("")).toBe(DEFAULT_POST_AUTH_PATH);
  });

  it("never treats an unrecognised role as admin", () => {
    // job_seeker is a pre-unification value still present in the database.
    for (const role of ["job_seeker", "employer", "ADMIN", "superadmin"]) {
      expect(homePathForRole(role)).toBe(DEFAULT_POST_AUTH_PATH);
    }
  });
});

describe("resolvePostAuthPath with a role-aware fallback", () => {
  it("starts an admin session in the console", () => {
    expect(resolvePostAuthPath(null, homePathForRole("admin"))).toBe("/admin");
  });

  it("still honours an explicit return url, whoever signs in", () => {
    // Someone following a company invite goes to the invite, not their home.
    const invite = "/companies/invites/accept?token=abc";
    expect(resolvePostAuthPath(invite, homePathForRole("admin"))).toBe(invite);
    expect(resolvePostAuthPath(invite, homePathForRole("user"))).toBe(invite);
  });

  it("does not let an unsafe return url override the role's home", () => {
    expect(resolvePostAuthPath("https://evil.test", homePathForRole("admin"))).toBe(
      "/admin",
    );
  });
});
