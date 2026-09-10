import type { UserProfile } from "@/types/api";

/**
 * What the application form can fill in on the applicant's behalf.
 *
 * Extracted from the form so it can be tested against, rather than a copy of
 * it being tested — a duplicated rule passes happily while the real one
 * drifts.
 */

export type PrefillProfile = Pick<
  UserProfile,
  "full_name" | "email" | "phone_number" | "years_of_experience" | "job_title"
>;

export interface PrefillableFields {
  fullName: string;
  email: string;
  phone: string;
  relevantExperience: string;
}

/**
 * An opening line, built from what the applicant has already told us.
 *
 * Facing an empty box is where applications get abandoned, and this audience
 * is often returning to work after a long gap. It is a complete, true
 * sentence rather than a fragment — if it is submitted unedited it still
 * reads as something a person wrote — and it stops there, so the part that
 * makes the application theirs is theirs.
 *
 * Both facts or neither: "I have  of experience as a ." is worse than an
 * empty box.
 */
export function experienceOpener(profile: PrefillProfile): string {
  const years = profile.years_of_experience?.trim();
  const role = profile.job_title?.trim();
  if (!years || !role) return "";
  // The stored values are hyphenated ranges ("3-5 years"); an en dash is what
  // a range is set in, and it is what the profile screen displays.
  return `I have ${years.replace(/-/g, "–")} of experience as a ${role}. `;
}

/**
 * Fills only fields that are still empty.
 *
 * The form's initial state read the profile directly, which is undefined on
 * the first render because the profile is still in flight — so phone
 * initialised empty and stayed empty however long the answer took. Name and
 * email had the same hole; phone was the one that showed, being most often
 * blank and marked required.
 *
 * Emptiness is the whole guard. A restored draft and anything typed are the
 * applicant's own and are never ours to overwrite, and the draft loader races
 * this — so it has to be safe in either order, and re-running it is a no-op.
 */
export function prefillFromProfile(
  current: PrefillableFields,
  profile: PrefillProfile | null | undefined,
): PrefillableFields {
  if (!profile) return current;

  const next = { ...current };
  if (!current.fullName.trim() && profile.full_name) {
    next.fullName = profile.full_name;
  }
  if (!current.email.trim() && profile.email) {
    next.email = profile.email;
  }
  if (!current.phone.trim() && profile.phone_number) {
    next.phone = profile.phone_number;
  }
  if (!current.relevantExperience.trim()) {
    const opener = experienceOpener(profile);
    if (opener) next.relevantExperience = opener;
  }
  return next;
}
