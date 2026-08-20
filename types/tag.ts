/**
 * A job tag.
 *
 * `color` used to live here, filled by a mapTagColor() that classified every
 * Canadian job tag into a Flutter-job-board palette — "Accounting" resolved to
 * "flutter". Nothing renders a per-tag colour now: tags share JOB_TAG_CLASS in
 * lib/job-display, so the chip cannot drift between surfaces again.
 */
export interface Tag {
  name: string;
}
