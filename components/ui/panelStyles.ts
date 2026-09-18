/**
 * The surface of a panel, in one place.
 *
 * A panel is the white box the product puts a block of content in: a section
 * on the profile page, a table container, an empty state, a settings card.
 * Ninety-seven of them spelled this surface out by hand across forty-five
 * files, and CandidateDetail.tsx spelled it with `rounded-2xl` thirteen times
 * instead, so a candidate's record was the one screen in the product whose
 * corners were visibly softer than the page it sat on. Nobody chose that, it
 * was one file's local habit outvoted eight to one, which is exactly the
 * failure `fieldStyles` and `cardStyles` were written to stop.
 *
 * Padding is deliberately absent. `p-6` on a settings card and `p-12` on an
 * empty state are two intents, not two halves of a drift, and the empty
 * states need the air. Callers keep their own padding, and anything else a
 * given panel does (a hover shadow, `overflow-hidden` on a table, sticky
 * positioning) sits alongside this rather than inside it.
 *
 * One variant is not drift and must not be folded in: `rounded-lg
 * md:rounded-xl` paired with `p-4 md:p-6`. That is the documented card
 * pattern in README.md, RESPONSIVE_PATTERNS.md and the responsive review
 * checklist, the profile cards and their skeletons use it deliberately, and
 * substituting this token there would square their corners on mobile.
 */
export const PANEL_SURFACE = "bg-white rounded-xl border border-gray-200";
