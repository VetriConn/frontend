/**
 * The shape of a form control, in one place.
 *
 * FormField and CustomDropdown had drifted apart on five properties at once —
 * padding, text size, corner radius, border colour and focus ring — so a text
 * input and a dropdown sitting next to each other in the same form did not
 * look like the same control. They share these now, and a change to one is a
 * change to both.
 *
 * A note on the radius: this used to be `rounded-10`, which is not a Tailwind
 * class and never was. It compiled to nothing, so every input using it had
 * square corners while the rest of the app used rounded-lg.
 */

/** The box: a text input, a select, or a dropdown trigger. */
/**
 * A note on focus: it is not red.
 *
 * It was `ring-2 ring-primary`, and primary is #c53030 — so focusing a field
 * drew a heavy red ring around it, in the same colour and nearly the same
 * weight as `border-red-500`, which is how this file marks an ERROR. Tabbing
 * through a form lit each field up as if it had just been rejected. On a
 * board whose audience is 45+ and which ships its own accessibility panel,
 * "you are here" and "you got this wrong" cannot be the same signal.
 *
 * A one-pixel darkened border plus a soft halo instead: unmistakable as
 * focus, quiet enough not to alarm, and it leaves red free to mean the one
 * thing it should.
 */
export const FIELD_BASE =
  "block w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg " +
  "text-sm md:text-base bg-white outline-none transition-colors " +
  "focus:border-gray-500 focus:ring-2 focus:ring-gray-300/60";

/** Border colour, which is the only thing an error state changes. */
export const fieldBorder = (hasError: boolean): string =>
  hasError ? "border-red-500" : "border-gray-300";

/** Applied to the box when the control is disabled. */
export const FIELD_DISABLED = "bg-gray-100 cursor-not-allowed opacity-60";

/** The label above the box. */
export const FIELD_LABEL =
  "block text-sm text-text-muted mb-1.5 md:mb-2 font-medium";

/** Helper text below the box. */
export const FIELD_HELPER = "text-xs text-gray-500 mt-1";

/** Error text below the box. */
/**
 * Form errors: red-700 at text-sm, not red-500 at text-xs.
 *
 * red-500 on white is 3.76:1 — below AA — and 12px is the smallest text in
 * the product carrying the most important message on the page. This is the
 * one style where both dimensions were working against the reader.
 */
export const FIELD_ERROR = "text-sm text-red-700 mt-1";

/** Spacing around a whole field, so a form stacks evenly. */
export const FIELD_WRAPPER = "flex flex-col gap-1 mb-4";
