"use client";

import type { ReactNode } from "react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  FieldLabel,
  FieldError,
  HelperText,
  inputClasses,
  errorInputClasses,
} from "@/components/ui/formKit";
import { FIELD_BASE, fieldBorder } from "@/components/ui/fieldStyles";
import type { JobFormData, FormErrors } from "../jobForm";

/**
 * The job builder's own fields, as opposed to formKit's controls.
 *
 * formKit took the generic pieces out of this folder: a label, a select, a
 * chip group, a toggle row. What it could not take is the handful of fields
 * that are specific to a job posting, and those are the ones that ended up
 * written twice. StepEssentials is the lite wizard's single page and it was
 * built by copying blocks out of the full wizard, so the job title input
 * lives in both StepEssentials and StepJobDetails, the salary pair lives in
 * both StepEssentials and StepSalaryLocation, and the brief and
 * responsibilities live in both StepEssentials and StepDescription. Same ids,
 * same placeholders, same classes, two copies each.
 *
 * That is not a tidiness complaint. The salary inputs below still carry the
 * class string that predates fieldStyles, the one with border-gray-200 and
 * the red `focus:ring-primary` halo that fieldStyles removed on purpose
 * because it made a focused field look rejected. There were four copies of
 * it. Fixing the copy you happened to be looking at would have left the other
 * three, which is exactly how the builder's inputs drifted away from the
 * shared kit the first time.
 *
 * Two rules keep this file from turning into a second formKit:
 *
 * 1. The legacy class strings are moved verbatim, not upgraded. Swapping them
 *    for FIELD_BASE would change padding, border colour and the focus ring on
 *    screens this change is not meant to redesign. They are in one place now,
 *    so the upgrade is a single edit whenever someone decides to make it.
 *
 * 2. A field owns a wrapper element only where every call site already had
 *    the same one. The spacing around a field belongs to the step, not to the
 *    field: StepEssentials stacks with `space-y-5`, StepDescription spaces its
 *    blocks with `mt-6`, and StepDescription's brief has no wrapper at all.
 *    Where those disagree the field renders a fragment and the step keeps its
 *    own element, so no DOM node moved.
 */

/** Props every step of the builder takes, spelled out five times before. */
export interface StepProps {
  formData: JobFormData;
  errors: FormErrors;
  onChange: (field: keyof JobFormData, value: string) => void;
}

/**
 * What a field below needs: its own value, the step's change handler, and the
 * error for its key. The handler is the step's unchanged (field, value) one
 * rather than a bare setter, so the field name stays inside the field that
 * owns it and no call site can wire the brief's box to the title's key.
 */
interface BoundFieldProps {
  value: string;
  onChange: (field: keyof JobFormData, value: string) => void;
  error?: string;
}

/**
 * A step's title and its one-line explanation.
 *
 * Six steps opened with this exact pair, HiringStep included. It renders a
 * fragment because all six had the h2 and the p as direct children of the
 * step's own root div.
 *
 * StepReview's heading is `text-2xl font-bold` and is not a seventh copy of
 * this: the review page is the end of the wizard rather than another form
 * page, and it is meant to read heavier. Do not fold it in.
 */
export function StepHeading({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm md:text-base text-gray-600 mb-6">{children}</p>
    </>
  );
}

/**
 * The job title. Both call sites wrap it in a bare div, so this one keeps its
 * wrapper. The helper line is a prop rather than a flag because only the full
 * wizard shows it, and the copy reads better at the step that chose it.
 */
export function JobTitleField({
  value,
  error,
  onChange,
  helperText,
}: BoundFieldProps & { helperText?: string }) {
  return (
    <div>
      <FieldLabel htmlFor="job_title" required>
        Job Title
      </FieldLabel>
      <input
        id="job_title"
        type="text"
        value={value}
        onChange={(e) => onChange("job_title", e.target.value)}
        placeholder="e.g., Customer Service Representative"
        className={error ? errorInputClasses : inputClasses}
      />
      {helperText && <HelperText>{helperText}</HelperText>}
      <FieldError message={error} />
    </div>
  );
}

/**
 * The salary box, now on the shared field shape.
 *
 * It used to carry the string that predates fieldStyles: border-gray-200 and
 * a red `focus:ring-primary` halo. fieldStyles removed that ring on purpose,
 * because primary is the same red as border-red-500, so tabbing through a
 * form lit each field up as though it had just been rejected. These four
 * boxes were the last place in the builder still doing it.
 *
 * The left padding is the one thing FIELD_BASE cannot supply: the currency
 * sign is absolutely positioned at left-3 inside the box, so the text has to
 * start clear of it. pl-7 is repeated at md because FIELD_BASE widens to
 * md:px-4 there, and a responsive utility beats a base one inside its own
 * media query no matter which property is more specific.
 */
const MONEY_INPUT = `${FIELD_BASE} pl-7 md:pl-7 pr-4`;

/**
 * A salary bound, with the currency sign sitting inside the box.
 *
 * Four copies: min and max, on the lite step and on the full one. They
 * disagreed only on the label ("Salary (min)" against "Minimum") and on
 * whether the minimum was marked required, which is the disagreement worth
 * keeping as props. The error message itself is not rendered here, because
 * both steps print a single salary error below the whole row rather than
 * under the offending box.
 */
export function SalaryAmountField({
  id,
  label,
  value,
  onChange,
  required,
  hasError,
}: {
  id: "salary_min" | "salary_max";
  label: string;
  value: string;
  onChange: (field: keyof JobFormData, value: string) => void;
  required?: boolean;
  hasError?: boolean;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          $
        </span>
        <input
          id={id}
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${MONEY_INPUT} ${fieldBorder(!!hasError)}`}
        />
      </div>
    </div>
  );
}

/** See rule 1 above: pre-fieldStyles, moved rather than corrected. */
const BULLET_TEXTAREA =
  "mt-1.5 w-full px-4 py-3 border rounded-lg text-sm " +
  "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none";

/**
 * The one-item-per-line textarea the builder uses for responsibilities and
 * for requirements. Split out from ResponsibilitiesField because the
 * requirements box is a third copy of the same class string with the error
 * branch dropped, and it is the class string that was drifting.
 */
export function BulletTextarea({
  id,
  value,
  onChange,
  rows,
  placeholder,
  hasError,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder: string;
  hasError?: boolean;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`${BULLET_TEXTAREA} ${hasError ? "border-red-500" : "border-gray-200"}`}
    />
  );
}

/**
 * The rich-text brief. A fragment: StepEssentials stacks it inside a div,
 * StepDescription puts it straight under the step heading.
 */
export function JobBriefField({ value, onChange, error }: BoundFieldProps) {
  return (
    <>
      <FieldLabel htmlFor="description" required>
        Job Brief
      </FieldLabel>
      <RichTextEditor
        id="description"
        value={value}
        onChange={(html) => onChange("description", html)}
        placeholder="What is this role, and what will they do day to day?"
        hasError={Boolean(error)}
        ariaLabel="Job brief"
      />
      <FieldError message={error} />
    </>
  );
}

/**
 * "What You'll Do". A fragment for the same reason as the brief: one step
 * wraps it in a bare div, the other in `mt-6`.
 */
export function ResponsibilitiesField({
  value,
  onChange,
  error,
}: BoundFieldProps) {
  return (
    <>
      <FieldLabel htmlFor="responsibilities" required>
        What You&apos;ll Do
      </FieldLabel>
      <HelperText>List the main responsibilities - one per line.</HelperText>
      <BulletTextarea
        id="responsibilities"
        value={value}
        onChange={(v) => onChange("responsibilities", v)}
        rows={5}
        placeholder={
          "Greet and assist customers\nOperate the point-of-sale system\nKeep the work area clean and stocked"
        }
        hasError={Boolean(error)}
      />
      <FieldError message={error} />
    </>
  );
}
