/**
 * The shape of a job card, in one place.
 *
 * The browse card and the recommended card had drifted apart on every axis at
 * once — radius, padding, title size, tracking, metadata gap and hover — while
 * being the same object in the same product. Same failure as the form fields
 * before `fieldStyles`, and the same fix: define it once so a change to one is
 * a change to both.
 */

/** The card box: surface, border, radius, and how it responds to a pointer. */
export const CARD_SURFACE =
  "bg-white border border-gray-200 rounded-xl " +
  // Named properties, never transition-all — that eases integer values like
  // z-index too, which silently breaks stacking.
  "transition-[box-shadow,border-color] duration-200 " +
  "hover:shadow-md hover:border-gray-300";

/** Focus treatment for a card the whole of which is activatable. */
export const CARD_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-primary focus-visible:ring-offset-2";

/** Focus treatment for a card whose interactive parts sit inside it. */
export const CARD_FOCUS_WITHIN =
  "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2";

/**
 * The job title. Large text at body leading with no tracking reads as merely
 * big rather than composed, which is what separated these from feeling
 * designed.
 */
export const CARD_TITLE =
  "font-semibold text-gray-900 leading-snug tracking-tight";

/**
 * A metadata row that occupies its own line — icon plus value.
 *
 * Block-level on purpose. This was inline-flex, which let consecutive rows sit
 * beside each other, so a card's location ran straight into its salary with no
 * gap. min-w-0 lets the value inside truncate instead of pushing past the
 * card's edge, which a long company name did.
 */
export const CARD_META_ROW = "flex items-center gap-2 text-sm min-w-0";

/** A metadata item that shares a line with others, as on the browse card. */
export const CARD_META_INLINE = "inline-flex items-center gap-1.5 text-sm";

/** Icons sitting in a metadata row. */
export const CARD_META_ICON = "w-4 h-4 text-gray-400 shrink-0";
