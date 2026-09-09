"use client";

import type { ScreeningQuestion } from "@/lib/job-fields";

/**
 * One employer screening question, and the control that answers it.
 *
 * Lifted out of JobApplicationForm so the thing that was wrong with it can be
 * tested. What was wrong: the question sat in a `<label>` with no `htmlFor`
 * that wrapped no control, which is a label naming nothing. The textarea it
 * was supposed to name therefore had no accessible name at all — announced as
 * an empty edit field — and the choice questions were a bare run of buttons
 * with no indication of which question they answered or how many to pick.
 *
 * The choice options are real radios and checkboxes, visually hidden behind
 * the chip styling. Buttons carrying role="radio" would have looked the same
 * and read the same, but a radiogroup owes the user arrow-key movement
 * between options, and only a real input gives that without hand-written key
 * handling to get wrong.
 */
export function ScreeningQuestionField({
  question,
  value,
  onChange,
}: {
  question: ScreeningQuestion;
  /** Selected options, or a single-element array holding the typed answer. */
  value: string[];
  onChange: (values: string[]) => void;
}) {
  const labelId = `screening-${question.id}-label`;
  const fieldId = `screening-${question.id}`;

  // "*" is a visual convention: a screen reader either skips it as
  // punctuation or reads "star" mid-question. The word goes to assistive
  // tech, the asterisk stays visual.
  const label = (
    <>
      {question.question}
      {question.required && (
        <>
          <span className="text-red-700 ml-0.5" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      )}
    </>
  );

  if (question.type === "short_text") {
    return (
      <div>
        <label
          id={labelId}
          htmlFor={fieldId}
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {label}
        </label>
        <textarea
          id={fieldId}
          value={value[0] ?? ""}
          onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
          rows={3}
          aria-required={question.required || undefined}
          className="form-input resize-none"
          placeholder="Type your answer..."
        />
      </div>
    );
  }

  const multi = question.type === "multi_choice";
  const options =
    question.type === "yes_no" ? ["yes", "no"] : question.options ?? [];

  return (
    // fieldset/legend is what names a group of controls. min-w-0 because a
    // fieldset defaults to min-width: min-content and would otherwise refuse
    // to shrink inside the form's flex column.
    <fieldset className="min-w-0">
      <legend
        id={labelId}
        className="block text-sm font-semibold text-gray-900 mb-2"
      >
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = value.includes(opt);
          return (
            <label
              key={opt}
              className={`min-h-[44px] inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                question.type === "yes_no" ? "capitalize" : ""
              }`}
            >
              <input
                type={multi ? "checkbox" : "radio"}
                name={fieldId}
                value={opt}
                checked={on}
                aria-required={question.required || undefined}
                onChange={() =>
                  onChange(
                    multi
                      ? on
                        ? value.filter((v) => v !== opt)
                        : [...value, opt]
                      : [opt],
                  )
                }
                className="sr-only"
              />
              {opt}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
