/**
 * Screening questions must be answerable without sight.
 *
 * Every one of these failed before the field was rewritten. The question text
 * lived in a `<label>` with no `htmlFor` wrapping no control, so:
 *
 *  - the textarea had no accessible name — announced as a blank edit field,
 *    with the question itself read out earlier as loose text and no way to
 *    tell the two were related;
 *  - the choice options were bare `<button>`s with no group and no
 *    association, so a screen reader gave "yes" and "no" with no idea what
 *    was being asked or that only one could be picked;
 *  - "required" was a red asterisk and nothing else, which is either skipped
 *    as punctuation or read as "star" in the middle of the question.
 *
 * These assert accessible names and roles rather than markup, so a future
 * restyle is free to change the DOM as long as it stays answerable.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ScreeningQuestionField } from "@/components/pages/jobs/ScreeningQuestionField";
import type { ScreeningQuestion } from "@/lib/job-fields";

const q = (over: Partial<ScreeningQuestion>): ScreeningQuestion => ({
  id: "q1",
  question: "Do you hold a valid Class 5 licence?",
  type: "yes_no",
  ...over,
});

describe("ScreeningQuestionField", () => {
  it("names the textarea with the question", () => {
    render(
      <ScreeningQuestionField
        question={q({ type: "short_text", question: "Why this role?" })}
        value={[]}
        onChange={() => {}}
      />,
    );

    // getByRole with a name only finds it if the label is actually associated.
    expect(screen.getByRole("textbox", { name: /why this role\?/i })).toBeInTheDocument();
  });

  it("groups yes/no options under the question, as one-of-many", () => {
    render(<ScreeningQuestionField question={q({})} value={[]} onChange={() => {}} />);

    const group = screen.getByRole("group", { name: /class 5 licence/i });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(screen.getByRole("radio", { name: "yes" })).not.toBeChecked();
  });

  it("reports the selected option as checked", () => {
    render(<ScreeningQuestionField question={q({})} value={["yes"]} onChange={() => {}} />);

    expect(screen.getByRole("radio", { name: "yes" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "no" })).not.toBeChecked();
  });

  it("offers checkboxes, not radios, when several answers are allowed", () => {
    render(
      <ScreeningQuestionField
        question={q({
          type: "multi_choice",
          question: "Which shifts can you work?",
          options: ["mornings", "evenings", "weekends"],
        })}
        value={["evenings"]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("group", { name: /which shifts/i })).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.getByRole("checkbox", { name: "evenings" })).toBeChecked();
  });

  it("says 'required' in words, not only as an asterisk", () => {
    render(
      <ScreeningQuestionField
        question={q({ type: "short_text", required: true, question: "Why this role?" })}
        value={[]}
        onChange={() => {}}
      />,
    );

    const field = screen.getByRole("textbox", { name: /why this role\?.*required/i });
    expect(field).toHaveAttribute("aria-required", "true");
  });

  it("keeps a single answer single, and accumulates a multiple one", async () => {
    const user = userEvent.setup();

    const onSingle = jest.fn();
    const { unmount } = render(
      <ScreeningQuestionField question={q({})} value={["no"]} onChange={onSingle} />,
    );
    await user.click(screen.getByRole("radio", { name: "yes" }));
    expect(onSingle).toHaveBeenCalledWith(["yes"]);
    unmount();

    const onMulti = jest.fn();
    render(
      <ScreeningQuestionField
        question={q({
          type: "multi_choice",
          options: ["mornings", "evenings"],
        })}
        value={["mornings"]}
        onChange={onMulti}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "evenings" }));
    expect(onMulti).toHaveBeenCalledWith(["mornings", "evenings"]);
  });

  it("lets a multiple-choice answer be taken back", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <ScreeningQuestionField
        question={q({ type: "multi_choice", options: ["mornings", "evenings"] })}
        value={["mornings", "evenings"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "evenings" }));
    expect(onChange).toHaveBeenCalledWith(["mornings"]);
  });

  it("keeps every option a 44px touch target", () => {
    render(<ScreeningQuestionField question={q({})} value={[]} onChange={() => {}} />);

    for (const radio of screen.getAllByRole("radio")) {
      // The input is visually hidden; the chip the finger lands on is its label.
      expect(radio.closest("label")?.className).toContain("min-h-[44px]");
    }
  });
});
