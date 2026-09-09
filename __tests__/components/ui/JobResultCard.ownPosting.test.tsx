/**
 * You may see your own listing in the results. You may not apply to it.
 *
 * The card offered "Apply Now" on a job the signed-in account had posted, and
 * the detail page it led to answered "You posted this job" with the button
 * disabled. The detail page had `poster_id` and compared it; the card was
 * never handed it. A button that cannot do what it says is worse than no
 * button — and on a board where one account both posts and applies, the same
 * person meets both surfaces.
 *
 * Showing the row is deliberate: seeing a listing exactly as a candidate does
 * is the quickest answer to "is it live, and does it read right?".
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { JobResultCard } from "@/components/ui/JobResultCard";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/lib/applicationDrafts", () => ({
  hasApplicationDraft: jest.fn(async () => false),
}));

const props = {
  id: "job-1",
  title: "Software Engineer",
  company: "Maya Kin",
  location: "Toronto",
  jobType: "Full-time",
  salary: "$1,000 CAD – $2,000 CAD",
  description: "this is the job brief",
};

describe("JobResultCard on your own posting", () => {
  it("offers to apply on somebody else's listing", async () => {
    render(<JobResultCard {...props} />);
    expect(
      await screen.findByRole("button", { name: /apply now for Software Engineer/i }),
    ).toBeInTheDocument();
  });

  it("does not offer to apply on your own", async () => {
    render(<JobResultCard {...props} isOwnPosting />);

    expect(
      await screen.findByRole("button", { name: /view your posting/i }),
    ).toBeInTheDocument();
    // The specific lie: an Apply button leading to a page that refuses.
    expect(screen.queryByRole("button", { name: /apply now/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue draft/i })).not.toBeInTheDocument();
  });

  it("still shows the listing itself", async () => {
    render(<JobResultCard {...props} isOwnPosting />);
    // Not hidden from results — only the action changes.
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Maya Kin")).toBeInTheDocument();
  });
});
