/**
 * A last look before an irreversible send.
 *
 * The form submitted straight from the bottom of a six-section scroll, with
 * a notice advising the applicant to review — advice, not a review. By then
 * the top of the form was several screens away, so checking meant scrolling
 * back through everything and trusting yourself to spot the mistake.
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import {
  ApplicationReview,
  type ReviewGroup,
} from "@/components/pages/jobs/ApplicationReview";

const groups: ReviewGroup[] = [
  {
    title: "Personal information",
    editTargetId: "section-contact",
    fields: [
      { label: "Full name", value: "Liam Neeson" },
      { label: "Portfolio URL", value: "" },
      { label: "Personal website", value: "   " },
    ],
  },
  {
    title: "Experience and skills",
    editTargetId: "section-experience",
    fields: [
      { label: "Skills", value: ["Customer Service", "Data Entry"] },
      { label: "Cover letter", value: null },
      { label: "Other", value: [] },
    ],
  },
];

describe("ApplicationReview", () => {
  it("shows what is about to be sent", () => {
    render(<ApplicationReview groups={groups} onEdit={() => {}} />);
    expect(screen.getByText("Liam Neeson")).toBeInTheDocument();
    expect(screen.getByText("Customer Service, Data Entry")).toBeInTheDocument();
  });

  it("prints 'No answer' for what was skipped, rather than hiding the row", () => {
    render(<ApplicationReview groups={groups} onEdit={() => {}} />);
    // A missing row tells you nothing: you cannot tell a question you chose
    // to skip from one the form never asked.
    expect(screen.getByText("Portfolio URL")).toBeInTheDocument();
    expect(screen.getAllByText("No answer")).toHaveLength(4);
  });

  it("treats whitespace and an empty list as unanswered", () => {
    render(<ApplicationReview groups={groups} onEdit={() => {}} />);
    const personal = screen.getByText("Personal website").closest("div")!;
    expect(within(personal).getByText("No answer")).toBeInTheDocument();
  });

  it("sends Edit back to the section it belongs to", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    render(<ApplicationReview groups={groups} onEdit={onEdit} />);

    await user.click(
      screen.getByRole("button", { name: /edit experience and skills/i }),
    );
    expect(onEdit).toHaveBeenCalledWith("section-experience");
  });

  it("names each Edit button, so they are not four identical 'Edit's", async () => {
    render(<ApplicationReview groups={groups} onEdit={() => {}} />);
    // Screen-reader users get a list of buttons with no context otherwise.
    expect(
      screen.getByRole("button", { name: /edit personal information/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /edit experience and skills/i }),
    ).toBeInTheDocument();
  });

  it("gives every Edit a 44px target", () => {
    render(<ApplicationReview groups={groups} onEdit={() => {}} />);
    for (const btn of screen.getAllByRole("button", { name: /edit/i })) {
      expect(btn.className).toContain("min-h-[44px]");
    }
  });
});
