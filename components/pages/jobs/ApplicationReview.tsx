"use client";

import { HiOutlinePencil } from "react-icons/hi2";

/**
 * A last look before an irreversible send.
 *
 * The form used to submit straight from the bottom of a six-section scroll,
 * with a notice advising the applicant to review — advice, not a review. By
 * then the top of the form was several screens away, so checking meant
 * scrolling back through every section and trusting yourself to notice.
 *
 * Not a wizard. The form is still one page filled in any order; this is a
 * summary of it, reached once at the end.
 *
 * Skipped optional answers are printed as "No answer" rather than omitted.
 * A missing row tells you nothing — you cannot tell a question you chose to
 * skip from one the form never asked.
 */

export interface ReviewField {
  label: string;
  /** Empty, null or an empty list all read as "No answer". */
  value?: string | string[] | null;
}

export interface ReviewGroup {
  title: string;
  /** Section anchor to return to when Edit is pressed. */
  editTargetId: string;
  fields: ReviewField[];
}

const NO_ANSWER = "No answer";

function renderValue(value: ReviewField["value"]): {
  text: string;
  answered: boolean;
} {
  if (Array.isArray(value)) {
    return value.length > 0
      ? { text: value.join(", "), answered: true }
      : { text: NO_ANSWER, answered: false };
  }
  const trimmed = (value ?? "").trim();
  return trimmed
    ? { text: trimmed, answered: true }
    : { text: NO_ANSWER, answered: false };
}

export function ApplicationReview({
  groups,
  onEdit,
}: {
  groups: ReviewGroup[];
  onEdit: (targetId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section
          key={group.title}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 bg-gray-50/70 border-b border-gray-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-gray-900">
              {group.title}
            </h2>
            <button
              type="button"
              onClick={() => onEdit(group.editTargetId)}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-sm font-medium text-gray-700 hover:text-primary hover:bg-white transition-colors"
            >
              <HiOutlinePencil className="w-4 h-4" />
              Edit
              <span className="sr-only"> {group.title}</span>
            </button>
          </div>

          <dl className="divide-y divide-gray-100">
            {group.fields.map((field) => {
              const { text, answered } = renderValue(field.value);
              return (
                <div
                  key={field.label}
                  className="px-5 py-3 sm:grid sm:grid-cols-3 sm:gap-4"
                >
                  <dt className="text-sm text-gray-500">{field.label}</dt>
                  <dd
                    className={`sm:col-span-2 text-sm whitespace-pre-line ${
                      answered ? "text-gray-900" : "text-gray-400 italic"
                    }`}
                  >
                    {text}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}

export default ApplicationReview;
