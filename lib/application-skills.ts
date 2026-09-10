/**
 * Adding a skill the applicant typed themselves.
 *
 * The form offered a fixed pool — the employer's list, or a generic
 * fallback. A pool cannot know every trade, and a forklift ticket or thirty
 * years on a switchboard is exactly the experience this board exists to
 * surface. It was unofferable.
 *
 * Here rather than inline in the component so the tests exercise the rule
 * instead of a copy of it. A duplicated rule passes happily while the real
 * one drifts.
 */
export function addSkill(
  selected: string[],
  pool: string[],
  raw: string,
): string[] {
  const value = raw.trim();
  if (!value) return selected;

  // Case-insensitive, so "First Aid" typed under a "first aid" chip does not
  // become a second one.
  if (selected.some((s) => s.toLowerCase() === value.toLowerCase())) {
    return selected;
  }

  // Typing one the employer already listed ticks THAT chip, so they are not
  // shown "data entry" sitting beside their own "Data Entry". Otherwise the
  // applicant's own wording is kept — an employer reads this, and their
  // capitalisation is not ours to correct.
  const inPool = pool.find((s) => s.toLowerCase() === value.toLowerCase());
  return [...selected, inPool ?? value];
}
