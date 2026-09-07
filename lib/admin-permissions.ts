import type { UserProfile } from "@/types/api";

/**
 * Read-only check used to gate UI surfaces. Server-side authorization is
 * still the real boundary — never trust this for security decisions.
 */
export function isSuperAdmin(
  profile: UserProfile | null | undefined,
): boolean {
  if (!profile || profile.role !== "admin") return false;
  return Boolean(profile.is_super_admin);
}

export type AdminRole = "super_admin" | "reviewer" | "moderator" | "billing";

/**
 * Which console surfaces each tier can act on, mirroring the backend's
 * per-action matrix (config/permissions.ts). UI gating only - the server
 * still authorizes every action. Before this every tier saw every queue,
 * got 403s, and the pages rendered confident false-empty states over them.
 */
const SURFACE_TIERS: Record<string, AdminRole[]> = {
  "/admin/jobs": ["super_admin", "reviewer"],
  "/admin/companies": ["super_admin", "reviewer"],
  "/admin/users": ["super_admin", "moderator"],
  "/admin/reports": ["super_admin", "reviewer", "moderator"],
  "/admin/community": ["super_admin", "moderator"],
  "/admin/support": ["super_admin", "reviewer", "moderator", "billing"],
  "/admin/team": ["super_admin"],
};

export function adminRoleOf(
  profile: UserProfile | null | undefined,
): AdminRole | undefined {
  if (!profile || profile.role !== "admin") return undefined;
  return profile.admin_role ?? (profile.is_super_admin ? "super_admin" : undefined);
}

export function canSeeAdminSurface(
  profile: UserProfile | null | undefined,
  href: string,
): boolean {
  const tiers = SURFACE_TIERS[href];
  if (!tiers) return true; // dashboard, notifications: every admin
  const role = adminRoleOf(profile);
  return !!role && tiers.includes(role);
}
