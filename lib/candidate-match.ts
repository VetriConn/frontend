/**
 * Candidate matching maths, extracted so it can be unit-tested and shared
 * between the applicant list (per-answer state) and the candidate detail view
 * (skills match). Pure functions only — no React, no data fetching.
 */

/** Trim + lowercase, the comparison form used throughout. */
export const lc = (s: string): string => s.trim().toLowerCase();

/** Split a free-text skills string (comma / newline / semicolon) into a list. */
export function splitSkills(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** De-duplicate case-insensitively, keeping the first-seen spelling. */
export function uniqueCI(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = lc(item);
    if (item && !seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

export interface SkillMatch {
  /** The de-duplicated required skills. */
  required: string[];
  matched: string[];
  unmatched: string[];
  /** 0–100, or null when there are no required skills to match against. */
  percent: number | null;
}

/**
 * Match a job's required skills against a candidate's skills, case-insensitively.
 * Percent is null (not 0) when the job lists no required skills, so the caller
 * can distinguish "nothing to match" from "matched none".
 */
export function skillMatch(
  required: string[],
  candidate: string[],
): SkillMatch {
  const req = uniqueCI(required);
  const have = new Set(uniqueCI(candidate).map(lc));
  const matched = req.filter((s) => have.has(lc(s)));
  const unmatched = req.filter((s) => !have.has(lc(s)));
  const percent = req.length
    ? Math.round((matched.length / req.length) * 100)
    : null;
  return { required: req, matched, unmatched, percent };
}

export type AnswerMatch = "full" | "partial" | "none" | "info";

/**
 * How a candidate's screening answer measures against the preferred answer(s).
 * "info" means the question isn't scored (no preferred answer); multi-choice
 * earns "partial" when only some preferred options were picked.
 */
export function screeningAnswerState(
  preferred: string[],
  answer: string[],
  type: string,
): AnswerMatch {
  if (!preferred.length) return "info";
  const pref = preferred.map(lc);
  const ans = answer.map(lc);
  if (type === "multi_choice") {
    const overlap = pref.filter((p) => ans.includes(p)).length;
    if (overlap === 0) return "none";
    return overlap === pref.length ? "full" : "partial";
  }
  return ans.some((a) => pref.includes(a)) ? "full" : "none";
}
