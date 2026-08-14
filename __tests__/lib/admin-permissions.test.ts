/**
 * Unit Tests for isSuperAdmin
 *
 * This is a UI-gating helper only — the tests document that it fails closed
 * for every non-admin / missing-flag case.
 */

import { isSuperAdmin } from "@/lib/admin-permissions";
import type { UserProfile } from "@/types/api";

/** Minimal profile factory — only the fields this helper reads matter. */
const profile = (overrides: Partial<UserProfile> = {}): UserProfile =>
  ({
    full_name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    ...overrides,
  }) as UserProfile;

describe("isSuperAdmin", () => {
  it("should return true for an admin with is_super_admin set", () => {
    expect(isSuperAdmin(profile({ is_super_admin: true }))).toBe(true);
  });

  it("should return false for an admin with is_super_admin false", () => {
    expect(isSuperAdmin(profile({ is_super_admin: false }))).toBe(false);
  });

  it("should return false for an admin missing the is_super_admin flag", () => {
    expect(isSuperAdmin(profile())).toBe(false);
  });

  it("should return false for a job seeker even with is_super_admin set", () => {
    expect(
      isSuperAdmin(profile({ role: "job_seeker", is_super_admin: true })),
    ).toBe(false);
  });

  it("should return false for an employer even with is_super_admin set", () => {
    expect(
      isSuperAdmin(profile({ role: "employer", is_super_admin: true })),
    ).toBe(false);
  });

  it("should return false for null", () => {
    expect(isSuperAdmin(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isSuperAdmin(undefined)).toBe(false);
  });

  it("should always return a boolean, never a truthy value", () => {
    // is_super_admin is typed boolean|undefined, but guard against a
    // truthy non-boolean leaking through from an untyped API response.
    const loose = profile({
      is_super_admin: "yes" as unknown as boolean,
    });
    expect(isSuperAdmin(loose)).toBe(true);
    expect(typeof isSuperAdmin(loose)).toBe("boolean");
  });
});
