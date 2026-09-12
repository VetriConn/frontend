/**
 * The candidate viewer, when the candidate has filled in nothing.
 *
 * Every panel on this page was wrapped in a truthiness check with no else,
 * so an applicant with an empty profile rendered as a header card and a
 * screen of white space. It read as a broken page rather than an empty one,
 * and it gave the employer no way to tell "they left this blank" from "we
 * never built that". The sections have to survive their own emptiness.
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SWRConfig } from "swr";
import { CandidateDetail } from "@/components/pages/dashboard/CandidateDetail";
import { getReceivedApplication } from "@/lib/api";
import type { ApplicationItem } from "@/types/api";

jest.mock("@/lib/api", () => ({ getReceivedApplication: jest.fn() }));
const mockedGet = getReceivedApplication as jest.MockedFunction<
  typeof getReceivedApplication
>;

/** An application with nothing optional filled in. */
const bareApplication: ApplicationItem = {
  _id: "app-1",
  user_id: { _id: "user-1", full_name: "Wisdom Adele" },
  job_id: {
    _id: "job-1",
    id: "job-1",
    role: "Software Engineer",
    company_name: "Vetriconn",
  },
  status: "pending",
  full_name: "Wisdom Adele",
  email: "wisdom@example.com",
  phone: "",
  applied_at: "2026-09-10T00:00:00.000Z",
};

function renderDetail() {
  return render(
    // A fresh cache per test: SWR's default is module-level and shared, so
    // one test's payload turns up in the next one's render.
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <CandidateDetail applicationId="app-1" />
    </SWRConfig>,
  );
}

describe("CandidateDetail with an empty profile", () => {
  beforeEach(() => mockedGet.mockReset());

  it("still shows every section, and says why each is empty", async () => {
    mockedGet.mockResolvedValue({
      application: bareApplication,
      candidate: null,
    });
    renderDetail();

    // The page the employer opens is the same shape whoever they open.
    for (const heading of [
      "About",
      "Work Experience",
      "From their application",
      "Professional Skills",
      "Skill & Experience Matching",
      "Screening Answers",
      "Candidate Score",
    ]) {
      expect(
        await screen.findByRole("heading", { name: heading }),
      ).toBeInTheDocument();
    }

    // And each one accounts for itself rather than going quiet.
    expect(
      screen.getByText(/hasn't written an About section/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/No work history/i)).toBeInTheDocument();
    expect(screen.getByText(/No skills listed/i)).toBeInTheDocument();
    expect(screen.getByText(/No résumé attached/i)).toBeInTheDocument();
  });

  it("separates a job that asked nothing from an applicant who answered nothing", async () => {
    mockedGet.mockResolvedValue({
      application: bareApplication,
      candidate: null,
    });
    const { unmount } = renderDetail();
    expect(
      await screen.findByText("This job had no screening questions."),
    ).toBeInTheDocument();
    unmount();

    mockedGet.mockResolvedValue({
      application: {
        ...bareApplication,
        job_id: {
          ...(bareApplication.job_id as { _id: string; id: string; role: string; company_name: string }),
          screening_questions: [
            {
              id: "q1",
              question: "Do you hold a valid licence?",
              type: "single_choice",
              options: ["Yes", "No"],
              preferred_answers: ["Yes"],
              knockout: false,
            },
          ],
        },
      },
      candidate: null,
    });
    renderDetail();
    expect(
      await screen.findByText(/didn't answer the screening questions/i),
    ).toBeInTheDocument();
  });

  it("offers the résumé even when no free text was written", async () => {
    // It used to be nested inside the free-text condition, so the one
    // attachment on the page disappeared when an unrelated field was blank.
    mockedGet.mockResolvedValue({
      application: { ...bareApplication, resume_url: "https://cdn/cv.pdf" },
      candidate: null,
    });
    renderDetail();

    const link = await screen.findByRole("link", { name: /Download résumé/i });
    expect(link).toHaveAttribute("href", "https://cdn/cv.pdf");
    expect(screen.getByText(/didn't add any written notes/i)).toBeInTheDocument();
  });
});
