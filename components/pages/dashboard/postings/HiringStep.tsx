"use client";

import React from "react";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
} from "react-icons/hi2";
import {
  SCREENING_QUESTION_TYPES,
  SCREENING_QUESTION_TYPE_LABELS,
  type ScreeningQuestion,
  type ScreeningQuestionType,
  type JobFaq,
} from "@/lib/job-fields";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

/**
 * Phase-2 builder step: the screening questionnaire, a public FAQ, and the
 * hiring-process stages. Screening answers feed the rank-and-flag score at
 * apply time — nothing here ever auto-rejects a candidate, which is a
 * deliberate choice for this audience.
 *
 * Kept in its own file because the question editor is stateful and sizeable;
 * the wizard shell stays readable by importing just <StepHiring/>.
 */

const inputClasses =
  "w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white";

const WEIGHT_LABELS: Record<number, string> = {
  1: "1 — Nice to have",
  2: "2 — Minor",
  3: "3 — Important",
  4: "4 — Major",
  5: "5 — Critical",
};

const YES_NO_OPTIONS = ["yes", "no"];

function newId(): string {
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** A small square icon button used across the editors. */
function IconButton({
  onClick,
  label,
  disabled,
  children,
  danger,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        danger
          ? "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600"
          : "border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Screening questions ─────────────────────────────────────────────────────

function ScreeningQuestionCard({
  question,
  index,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: {
  question: ScreeningQuestion;
  index: number;
  onChange: (next: ScreeningQuestion) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const isChoice =
    question.type === "single_choice" || question.type === "multi_choice";
  const canScore = question.type !== "short_text";

  const patch = (partial: Partial<ScreeningQuestion>) =>
    onChange({ ...question, ...partial });

  // Switching type invalidates options / preferred answers, so reset them.
  const changeType = (type: ScreeningQuestionType) => {
    onChange({
      ...question,
      type,
      options: type === "single_choice" || type === "multi_choice" ? question.options ?? [] : undefined,
      preferred_answers: [],
    });
  };

  const setOption = (optIndex: number, value: string) => {
    const options = [...(question.options ?? [])];
    options[optIndex] = value;
    patch({ options });
  };

  const addOption = () => patch({ options: [...(question.options ?? []), ""] });

  const removeOption = (optIndex: number) => {
    const removed = (question.options ?? [])[optIndex];
    patch({
      options: (question.options ?? []).filter((_, i) => i !== optIndex),
      // Drop the removed option from any preferred set that referenced it.
      preferred_answers: (question.preferred_answers ?? []).filter(
        (a) => a !== removed,
      ),
    });
  };

  const togglePreferred = (value: string) => {
    const current = question.preferred_answers ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : question.type === "multi_choice"
        ? [...current, value]
        : [value]; // single-answer types keep exactly one preferred value
    patch({ preferred_answers: next });
  };

  const preferred = question.preferred_answers ?? [];
  const choiceOptions = (question.options ?? []).filter((o) => o.trim());
  const preferredCandidates =
    question.type === "yes_no" ? YES_NO_OPTIONS : choiceOptions;

  return (
    <div className="rounded-xl border border-gray-200 p-4 md:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-2 text-sm font-semibold text-gray-400">
          {index + 1}
        </span>
        <div className="flex-1">
          <label className="sr-only" htmlFor={`sq-${question.id}`}>
            Question {index + 1}
          </label>
          <input
            id={`sq-${question.id}`}
            type="text"
            value={question.question}
            onChange={(e) => patch({ question: e.target.value })}
            placeholder="e.g. Do you hold a valid Class 5 driver's licence?"
            className={inputClasses}
          />
        </div>
        <IconButton
          onClick={() => onMove(-1)}
          label="Move question up"
          disabled={isFirst}
        >
          <HiOutlineArrowUp className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={() => onMove(1)}
          label="Move question down"
          disabled={isLast}
        >
          <HiOutlineArrowDown className="h-4 w-4" />
        </IconButton>
        <IconButton onClick={onRemove} label="Remove question" danger>
          <HiOutlineTrash className="h-5 w-5" />
        </IconButton>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <CustomDropdown
          name={`sq-type-${question.id}`}
          label="Answer type"
          value={question.type}
          onChange={(v) => changeType(v as ScreeningQuestionType)}
          options={SCREENING_QUESTION_TYPES.map((type) => ({
            value: type,
            label: SCREENING_QUESTION_TYPE_LABELS[type],
          }))}
          placeholder="Answer type"
          hideHeader
        />
        {canScore && (
          <CustomDropdown
            name={`sq-weight-${question.id}`}
            label="Importance"
            value={String(question.weight ?? 3)}
            onChange={(v) => patch({ weight: Number(v) })}
            options={[1, 2, 3, 4, 5].map((w) => ({
              value: String(w),
              label: WEIGHT_LABELS[w],
            }))}
            placeholder="Importance"
            hideHeader
          />
        )}
      </div>

      {/* Options editor for choice types */}
      {isChoice && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-gray-600">Options</p>
          <div className="space-y-2">
            {(question.options ?? []).map((opt, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => setOption(optIndex, e.target.value)}
                  placeholder={`Option ${optIndex + 1}`}
                  className={inputClasses}
                  aria-label={`Option ${optIndex + 1}`}
                />
                <IconButton
                  onClick={() => removeOption(optIndex)}
                  label="Remove option"
                  danger
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </IconButton>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add option
          </button>
        </div>
      )}

      {/* Preferred answer(s) — the scoring target */}
      {canScore && preferredCandidates.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-gray-600">
            Preferred answer{question.type === "multi_choice" ? "s" : ""}{" "}
            <span className="font-normal text-gray-400">
              (used for ranking — optional)
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {preferredCandidates.map((value) => {
              const on = preferred.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePreferred(value)}
                  className={`min-h-[40px] rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
                    on
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {question.type === "short_text" && (
        <p className="mt-3 text-xs text-gray-400">
          Short answers are shown to you but aren&apos;t scored.
        </p>
      )}

      {/* Flags */}
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={Boolean(question.required)}
            onChange={(e) => patch({ required: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          Required to apply
        </label>
        {canScore && preferred.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(question.knockout)}
              onChange={(e) => patch({ knockout: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            Flag prominently if not met
          </label>
        )}
      </div>
    </div>
  );
}

// ─── Main step ───────────────────────────────────────────────────────────────

export function StepHiring({
  questions,
  faqs,
  stages,
  setQuestions,
  setFaqs,
  setStages,
}: {
  questions: ScreeningQuestion[];
  faqs: JobFaq[];
  stages: string[];
  setQuestions: (next: ScreeningQuestion[]) => void;
  setFaqs: (next: JobFaq[]) => void;
  setStages: (next: string[]) => void;
}) {
  const addQuestion = () =>
    setQuestions([
      ...questions,
      { id: newId(), question: "", type: "yes_no", weight: 3, preferred_answers: [] },
    ]);

  const updateQuestion = (index: number, next: ScreeningQuestion) =>
    setQuestions(questions.map((q, i) => (i === index ? next : q)));

  const removeQuestion = (index: number) =>
    setQuestions(questions.filter((_, i) => i !== index));

  const moveQuestion = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    setQuestions(next);
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const updateFaq = (index: number, next: JobFaq) =>
    setFaqs(faqs.map((f, i) => (i === index ? next : f)));
  const removeFaq = (index: number) =>
    setFaqs(faqs.filter((_, i) => i !== index));

  const addStage = () => setStages([...stages, ""]);
  const updateStage = (index: number, value: string) =>
    setStages(stages.map((s, i) => (i === index ? value : s)));
  const removeStage = (index: number) =>
    setStages(stages.filter((_, i) => i !== index));
  const moveStage = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= stages.length) return;
    const next = [...stages];
    [next[index], next[target]] = [next[target], next[index]];
    setStages(next);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Screening &amp; Hiring
      </h2>
      <p className="text-sm md:text-base text-gray-500 mb-6">
        Optional. Ask a few screening questions to rank applicants, answer common
        questions up front, and show candidates what to expect. Screening never
        rejects anyone automatically — it only helps you sort.
      </p>

      {/* Screening questions */}
      <section className="mb-8">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Screening questions
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Set a preferred answer and importance to rank applicants automatically.
        </p>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <ScreeningQuestionCard
              key={q.id}
              question={q}
              index={i}
              onChange={(next) => updateQuestion(i, next)}
              onRemove={() => removeQuestion(i)}
              onMove={(dir) => moveQuestion(i, dir)}
              isFirst={i === 0}
              isLast={i === questions.length - 1}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addQuestion}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors"
        >
          <HiOutlinePlus className="h-5 w-5" />
          Add screening question
        </button>
      </section>

      {/* FAQs */}
      <section className="mb-8">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Frequently asked questions
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Answer common questions so applicants don&apos;t have to ask.
        </p>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 p-4 md:p-5"
            >
              <div className="mb-2 flex items-start gap-2">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) =>
                    updateFaq(i, { ...faq, question: e.target.value })
                  }
                  placeholder="Question — e.g. Is parking available?"
                  className={inputClasses}
                  aria-label={`FAQ question ${i + 1}`}
                />
                <IconButton
                  onClick={() => removeFaq(i)}
                  label="Remove FAQ"
                  danger
                >
                  <HiOutlineTrash className="h-5 w-5" />
                </IconButton>
              </div>
              <textarea
                value={faq.answer}
                onChange={(e) =>
                  updateFaq(i, { ...faq, answer: e.target.value })
                }
                rows={2}
                placeholder="Answer"
                className={`${inputClasses} resize-none`}
                aria-label={`FAQ answer ${i + 1}`}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFaq}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors"
        >
          <HiOutlinePlus className="h-5 w-5" />
          Add FAQ
        </button>
      </section>

      {/* Hiring process */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Hiring process
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Show candidates the steps from application to offer.
        </p>
        <div className="space-y-2">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <input
                type="text"
                value={stage}
                onChange={(e) => updateStage(i, e.target.value)}
                placeholder={`Stage ${i + 1} — e.g. Phone screen`}
                className={inputClasses}
                aria-label={`Hiring stage ${i + 1}`}
              />
              <IconButton
                onClick={() => moveStage(i, -1)}
                label="Move up"
                disabled={i === 0}
              >
                <HiOutlineArrowUp className="h-4 w-4" />
              </IconButton>
              <IconButton
                onClick={() => moveStage(i, 1)}
                label="Move down"
                disabled={i === stages.length - 1}
              >
                <HiOutlineArrowDown className="h-4 w-4" />
              </IconButton>
              <IconButton
                onClick={() => removeStage(i)}
                label="Remove stage"
                danger
              >
                <HiOutlineTrash className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStage}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors"
        >
          <HiOutlinePlus className="h-5 w-5" />
          Add stage
        </button>
      </section>
    </div>
  );
}

export default StepHiring;
