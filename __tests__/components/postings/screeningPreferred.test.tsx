import React, { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepHiring } from "@/components/pages/dashboard/postings/HiringStep";
import { cleanScreeningQuestions } from "@/components/pages/dashboard/postings/jobForm";
import type { ScreeningQuestion } from "@/lib/job-fields";

/**
 * Preferred answers are a SET, and the editor used to be the one place that
 * couldn't say so.
 *
 * Every other layer already treated them that way: the schema stores up to
 * twelve, and scoreScreening marks single-answer types all-or-nothing against
 * the whole set, so "6-10" plus "10+" is how a job says "six years or more".
 * The editor collapsed anything that wasn't multi_choice to a single value, so
 * that preference was expressible through the API and through a seed script
 * but not through the product.
 *
 * yes_no stays collapsed, and these lock that too: preferring both "yes" and
 * "no" scores every applicant full marks, which makes the question unrankable
 * and quietly disarms its knockout, since the scorer only flags a fraction
 * under 1.
 */

function Harness({ initial }: { initial: ScreeningQuestion[] }) {
  const [questions, setQuestions] = useState(initial);
  return (
    <StepHiring
      questions={questions}
      faqs={[]}
      stages={[]}
      setQuestions={setQuestions}
      setFaqs={() => {}}
      setStages={() => {}}
    />
  );
}

/** The preferred-answer pills, which are the only aria-pressed buttons here. */
function preferredPills() {
  return screen
    .getAllByRole("button")
    .filter((el) => el.hasAttribute("aria-pressed"));
}

const pill = (label: string) =>
  preferredPills().find((el) => el.textContent?.trim() === label)!;

const selected = () =>
  preferredPills()
    .filter((el) => el.getAttribute("aria-pressed") === "true")
    .map((el) => el.textContent?.trim());

const SINGLE_CHOICE: ScreeningQuestion = {
  id: "q-years",
  question: "How many years have you supervised a warehouse team?",
  type: "single_choice",
  options: ["0-2", "3-5", "6-10", "10+"],
  preferred_answers: [],
  weight: 4,
};

const YES_NO: ScreeningQuestion = {
  id: "q-cert",
  question: "Do you hold a valid forklift certification?",
  type: "yes_no",
  preferred_answers: [],
  weight: 5,
};

describe("screening preferred answers", () => {
  it("lets a single-choice question accept a range of answers", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[SINGLE_CHOICE]} />);

    await user.click(pill("6-10"));
    await user.click(pill("10+"));

    // The second click used to replace the first.
    expect(selected()).toEqual(["6-10", "10+"]);
  });

  it("still lets a preferred answer be taken back off", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[SINGLE_CHOICE]} />);

    await user.click(pill("6-10"));
    await user.click(pill("10+"));
    await user.click(pill("6-10"));

    expect(selected()).toEqual(["10+"]);
  });

  it("holds a yes/no question to one preferred answer", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[YES_NO]} />);

    await user.click(pill("yes"));
    await user.click(pill("no"));

    // Preferring both would score every applicant full marks and disarm the
    // knockout, so the second choice replaces the first rather than joining it.
    expect(selected()).toEqual(["no"]);
  });

  it("says how the two multi-select types score, since they look identical", () => {
    const { unmount } = render(<Harness initial={[SINGLE_CHOICE]} />);
    expect(
      screen.getByText(/any answer you highlight earns full marks/i),
    ).toBeInTheDocument();
    unmount();

    render(
      <Harness initial={[{ ...SINGLE_CHOICE, type: "multi_choice" }]} />,
    );
    expect(screen.getByText(/score in proportion/i)).toBeInTheDocument();
  });

  it("carries the whole set through to the payload", () => {
    const cleaned = cleanScreeningQuestions([
      { ...SINGLE_CHOICE, preferred_answers: ["6-10", "10+"], knockout: true },
    ]);

    expect(cleaned?.[0].preferred_answers).toEqual(["6-10", "10+"]);
    // A knockout is only meaningful with something to fail against, and there
    // are now two ways to pass it.
    expect(cleaned?.[0].knockout).toBe(true);
  });

  it("drops preferred answers that no longer name a real option", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initial={[{ ...SINGLE_CHOICE, preferred_answers: ["6-10", "10+"] }]}
      />,
    );

    const options = screen.getByText("Options").parentElement!;
    await user.click(
      within(options).getAllByRole("button", { name: "Remove option" })[3],
    );

    // "10+" is gone as an option, so it cannot stay as a preference — but the
    // other half of the range survives.
    expect(selected()).toEqual(["6-10"]);
  });
});
