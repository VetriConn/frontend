import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateJobPosting from "@/components/pages/dashboard/postings/CreateJobPosting";
import { useMyCompanies } from "@/hooks/useCompanies";

/**
 * The full builder is a company surface.
 *
 * Its extra steps describe an employer with a hiring process — screening
 * questions, hiring stages, an FAQ — and the postings they produce belong to a
 * company workspace teammates can work the applicants from. An individual
 * quick-posting one role has nowhere to put any of that, so the builder is
 * gated on holding an approved Company Page rather than offered and then only
 * half applicable.
 *
 * The gate is derived rather than stored, and these lock the three things
 * that makes subtle:
 *
 *  - the company list arrives over the network, so before it lands EVERY
 *    account looks companyless. Deciding then would show the six-step builder
 *    and snap it to two a moment later, or tell a company owner to create the
 *    company they already have;
 *  - editing is gated the same way, and an account with no company editing a
 *    rich posting must not silently lose the fields it can no longer see;
 *  - "create a company" is the wrong advice for someone already waiting on
 *    review.
 */

// jsdom has no ResizeObserver, and the wizard observes the navbar to measure
// its sticky offsets. A no-op is enough: nothing here asserts on layout.
class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as unknown as { ResizeObserver: unknown }).ResizeObserver =
  NoopResizeObserver;

const push = jest.fn();
let query = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => query,
}));

jest.mock("@/components/ui/Toaster", () => ({
  useToaster: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/hooks/useUserProfile", () => ({
  useUserProfile: () => ({
    userProfile: { id: "u1", full_name: "Dana Whitfield" },
  }),
}));

jest.mock("@/hooks/useCompanies", () => ({ useMyCompanies: jest.fn() }));

jest.mock("@/lib/api", () => ({
  canPostJobsFor: () => true,
  createPosting: jest.fn(),
  getMyPosting: jest.fn(),
  updatePosting: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const api = require("@/lib/api");

const mockCompanies = useMyCompanies as jest.MockedFunction<
  typeof useMyCompanies
>;

type CompaniesResult = ReturnType<typeof useMyCompanies>;

const NORTHLINE = {
  _id: "c1",
  name: "Northline Logistics",
  status: "approved",
} as unknown as CompaniesResult["companies"][number];

function companiesState(over: Partial<CompaniesResult> = {}): CompaniesResult {
  return {
    companies: [],
    pendingCompany: null,
    approvedCompanies: [],
    isLoading: false,
    isError: false,
    error: undefined,
    mutate: jest.fn(),
    ...over,
  } as CompaniesResult;
}

/** SelectField renders a CustomDropdown, so "Post as" is a combobox. */
const postAs = () => screen.getByRole("combobox", { name: "Post as" });

beforeEach(() => {
  push.mockClear();
  query = new URLSearchParams();
  api.updatePosting.mockReset();
  api.updatePosting.mockResolvedValue({ _id: "j1", moderation_status: "pending" });
});

/** A posting with everything the full builder can express. */
const RICH_JOB = {
  _id: "j1",
  id: "warehouse-supervisor-abc",
  role: "Warehouse Supervisor",
  company_name: "Dana Whitfield",
  description: "Run our Burnaby floor.",
  hiring_stages: ["Phone screen", "Floor walkthrough"],
  faqs: [{ question: "Shift premium?", answer: "Yes." }],
  screening_questions: [
    {
      id: "q-cert",
      question: "Do you hold a valid forklift certification?",
      type: "yes_no" as const,
      preferred_answers: ["yes"],
      weight: 5,
    },
  ],
};

describe("job builder company gate", () => {
  it("waits for the company answer instead of guessing at it", () => {
    mockCompanies.mockReturnValue(companiesState({ isLoading: true }));
    render(<CreateJobPosting />);

    // Neither mode is committed to while the list is in flight — showing the
    // six-step builder here is what produces the snap-to-two a moment later.
    expect(screen.getByText(/checking your company profile/i)).toBeInTheDocument();
    expect(screen.queryByText("Screening & Hiring")).not.toBeInTheDocument();
    expect(screen.queryByText("Essentials")).not.toBeInTheDocument();
  });

  it("puts an account with no company into quick post, and says why", () => {
    mockCompanies.mockReturnValue(companiesState());
    render(<CreateJobPosting />);

    expect(screen.getByText("Essentials")).toBeInTheDocument();
    expect(screen.queryByText("Screening & Hiring")).not.toBeInTheDocument();

    expect(screen.getByText(/no company on your account yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create a company/i })).toHaveAttribute(
      "href",
      "/dashboard/companies/apply",
    );
    // The door is visible but shut, rather than missing.
    expect(screen.getByRole("button", { name: "Full builder" })).toBeDisabled();
  });

  it("refuses the switch even when it is asked for from elsewhere", async () => {
    const user = userEvent.setup();
    mockCompanies.mockReturnValue(companiesState());
    render(<CreateJobPosting />);

    // The toggle is hidden below the sm breakpoint, so the guard has to live
    // in switchMode rather than only on the button.
    await user.click(screen.getByRole("button", { name: "Full builder" }));
    expect(screen.queryByText("Screening & Hiring")).not.toBeInTheDocument();
  });

  it("tells someone awaiting review to wait, not to apply again", () => {
    mockCompanies.mockReturnValue(
      companiesState({
        companies: [NORTHLINE],
        pendingCompany: NORTHLINE as unknown as CompaniesResult["pendingCompany"],
      }),
    );
    render(<CreateJobPosting />);

    expect(screen.getByText(/northline logistics is under review/i)).toBeInTheDocument();
    expect(screen.queryByText(/no company on your account yet/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /create a company/i }),
    ).not.toBeInTheDocument();
  });

  it("opens the full builder for a company, posting as that company", () => {
    mockCompanies.mockReturnValue(
      companiesState({ companies: [NORTHLINE], approvedCompanies: [NORTHLINE] }),
    );
    render(<CreateJobPosting />);

    expect(screen.getByText("Screening & Hiring")).toBeInTheDocument();

    // Resolved to the company without being picked: an unset selection here
    // is not "post as an individual", because that option isn't offered.
    expect(postAs()).toHaveTextContent("Northline Logistics");
  });

  it("offers no individual option inside the full builder", async () => {
    const user = userEvent.setup();
    mockCompanies.mockReturnValue(
      companiesState({ companies: [NORTHLINE], approvedCompanies: [NORTHLINE] }),
    );
    render(<CreateJobPosting />);

    await user.click(postAs());

    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["Northline Logistics"]);
  });

  it("edits through the essentials when the account has no company", async () => {
    query = new URLSearchParams("draftId=j1");
    api.getMyPosting.mockResolvedValue(RICH_JOB);
    mockCompanies.mockReturnValue(companiesState());
    render(<CreateJobPosting />);

    await waitFor(() =>
      expect(screen.getByDisplayValue("Warehouse Supervisor")).toBeInTheDocument(),
    );

    expect(screen.getByText("Essentials")).toBeInTheDocument();
    expect(screen.queryByText("Screening & Hiring")).not.toBeInTheDocument();
    // "Post as" is gone: ownership is fixed once a posting exists, and
    // updateJobSchema doesn't accept company_id, so offering the choice was
    // offering something the server discards.
    expect(
      screen.queryByRole("combobox", { name: "Post as" }),
    ).not.toBeInTheDocument();
    // The advice changes with the situation — there is no individual posting
    // left to make here.
    expect(
      screen.getByText(/anything this posting already has beyond them stays/i),
    ).toBeInTheDocument();
  });

  it("sends the hidden fields back untouched when it saves", async () => {
    const user = userEvent.setup();
    query = new URLSearchParams("draftId=j1");
    api.getMyPosting.mockResolvedValue(RICH_JOB);
    mockCompanies.mockReturnValue(companiesState());
    render(<CreateJobPosting />);

    await waitFor(() =>
      expect(screen.getByDisplayValue("Warehouse Supervisor")).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: /save as draft/i }));

    // The whole point of gating edits: the form is a superset, so the steps
    // this mode doesn't render still submit exactly what was loaded. Losing
    // an employer's screening questions because they lost a company would be
    // the gate quietly deleting their work.
    await waitFor(() => expect(api.updatePosting).toHaveBeenCalled());
    const [, payload] = api.updatePosting.mock.calls[0];
    expect(payload.screening_questions).toEqual(RICH_JOB.screening_questions);
    expect(payload.hiring_stages).toEqual(RICH_JOB.hiring_stages);
    expect(payload.faqs).toEqual(RICH_JOB.faqs);
  });

  it("hands the individual option back on the way to quick post", async () => {
    const user = userEvent.setup();
    mockCompanies.mockReturnValue(
      companiesState({ companies: [NORTHLINE], approvedCompanies: [NORTHLINE] }),
    );
    render(<CreateJobPosting />);

    await user.click(screen.getByRole("button", { name: "Quick post" }));

    await waitFor(() =>
      expect(screen.getByText("Essentials")).toBeInTheDocument(),
    );
    // Quick post is still allowed to be a company posting — but not by
    // inheriting a selection the full builder made on the employer's behalf.
    expect(postAs()).toHaveTextContent("Dana Whitfield (individual)");

    await user.click(postAs());
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Dana Whitfield (individual)",
      "Northline Logistics",
    ]);
  });
});
