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
