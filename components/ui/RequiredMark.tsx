/**
 * The "this field is required" marker, in one place.
 *
 * It was spelled `<span className="text-red-500 ml-1">*</span>` inline in four
 * label components, and carried two problems in every copy. red-500 on white
 * is 3.76:1, under the 4.5:1 AA floor for text — and an asterisk is text here,
 * since it is the only thing saying the field is required. And an asterisk is
 * a visual convention: a screen reader either skips it as punctuation or reads
 * "star" in the middle of the label, so the requirement never actually
 * reaches the person most likely to submit the form and be bounced back.
 *
 * The colour passes now, and the word goes to assistive tech while the
 * asterisk stays visual. The control itself should still carry `required` or
 * `aria-required` — this names the state, it does not enforce it.
 */
export function RequiredMark({ className = "ml-1" }: { className?: string }) {
  return (
    <>
      <span className={`text-red-700 ${className}`} aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}
