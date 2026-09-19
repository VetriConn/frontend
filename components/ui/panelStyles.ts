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
 * A sixteen-site minority spelled the radius `rounded-lg md:rounded-xl`, and
 * an earlier note here protected it because README.md, RESPONSIVE_PATTERNS.md
 * and the responsive review checklist all wrote it down as the card pattern.
 * The owner has since chosen the majority instead: one radius at every width,
 * the plain `rounded-xl` below. Those sites now use this token, which squares
 * the profile cards and their skeletons on mobile, and that is the intended
 * result rather than a regression to file a bug against. All three docs were
 * rewritten in the same change, because the docs were the reason the variant
 * kept growing back.
 */
export const PANEL_SURFACE = "bg-white rounded-xl border border-gray-200";

/**
 * The surface of an admin panel, which is deliberately not the one above.
 *
 * The admin area is meant to read as a separate application sitting beside
 * the product, so it rounds harder and softens its border: `rounded-2xl` and
 * a border at eighty percent opacity. Twelve admin panels wrote those four
 * classes out by hand and all twelve agreed, which is what made them look
 * like drift to a cleanup pass that nearly folded them into `PANEL_SURFACE`.
 * They are not drift, they are the decision, and the reason this token exists
 * is so the next pass reads it here instead of inferring it twelve times and
 * guessing wrong. Do not fold it in.
 *
 * Shadow is absent for the same reason padding is absent above. Most admin
 * panels wear the faint `shadow-[0_1px_2px_rgba(15,23,42,0.04)]` lift, the
 * invite card wears a heavier one because it floats on an otherwise empty
 * page, and the inline error panels wear none. Callers keep whichever fits.
 *
 * Two panels outside the admin area spell these same four classes out and are
 * left alone on purpose: the community coming-soon page and the account-ready
 * panel after email verification. Both are candidate-facing, so importing an
 * admin token there would name them wrong, and changing them to `PANEL_SURFACE`
 * would alter what renders. They want a decision of their own.
 */
export const ADMIN_PANEL_SURFACE =
  "bg-white rounded-2xl border border-gray-200/80";
