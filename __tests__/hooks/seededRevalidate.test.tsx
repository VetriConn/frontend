/**
 * Seeded detail views must paint instantly AND still revalidate once.
 *
 * useJob and useCompany accept the server-rendered (ISR) payload as SWR
 * fallbackData. Two properties are load-bearing:
 *   1. The seed is on screen immediately — no loading state, no waterfall.
 *   2. One background request still fires on mount. The ISR copy can be up
 *      to five minutes stale, and this request is what pulls a just-rejected
 *      job or just-suspended company off the page in seconds. SWR skips the
 *      mount revalidate by default when fallbackData is set, so the hooks
 *      pass revalidateOnMount: true explicitly — these tests exist to keep
 *      that from regressing.
 */
import { render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { useJob } from "@/hooks/useJob";
import { useCompany } from "@/hooks/useCompanies";
import { getJobById, getCompanyById } from "@/lib/api";
import type { JobsResponse } from "@/types/api";
import type { Company } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  getUserProfile: jest.fn(),
  getJobById: jest.fn(),
  getSavedJobs: jest.fn(),
  saveJob: jest.fn(),
  unsaveJob: jest.fn(),
  getMyCompanies: jest.fn(),
  getCompanyById: jest.fn(),
  getCompanyJobs: jest.fn(),
  adminListCompanies: jest.fn(),
  getPublicCompanyJobs: jest.fn(),
}));
jest.mock("@/lib/api/companies", () => ({
  adminCompanyCounts: jest.fn(),
}));

const mockGetJobById = getJobById as jest.Mock;
const mockGetCompanyById = getCompanyById as jest.Mock;

const SEED_JOB = {
  _id: "job-1",
  id: "cook-1234",
  role: "Cook (seeded)",
  company_name: "Restaurant Jacko",
} as unknown as JobsResponse;

const FRESH_JOB = { ...SEED_JOB, role: "Cook (revalidated)" };

const SEED_COMPANY = {
  _id: "co-1",
  name: "Acme (seeded)",
  owner_id: "u1",
  status: "approved",
} as unknown as Company;

function JobProbe({ seed }: { seed: JobsResponse | null }) {
  const { job } = useJob("job-1", seed);
  return <div>{job?.role ?? "no job"}</div>;
}

function CompanyProbe({ seed }: { seed: Company | null }) {
  const { company } = useCompany("co-1", seed);
  return <div>{company?.name ?? "no company"}</div>;
}

function renderWithSWR(ui: React.ReactElement) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {ui}
    </SWRConfig>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetJobById.mockResolvedValue(FRESH_JOB);
  mockGetCompanyById.mockResolvedValue(SEED_COMPANY);
});

describe("useJob seeded from the server render", () => {
  it("paints the seed synchronously", () => {
    renderWithSWR(<JobProbe seed={SEED_JOB} />);
    // Before any fetch settles, the seeded content is already on screen.
    expect(screen.getByText("Cook (seeded)")).toBeInTheDocument();
  });

  it("still revalidates once in the background", async () => {
    renderWithSWR(<JobProbe seed={SEED_JOB} />);
    await waitFor(() => expect(mockGetJobById).toHaveBeenCalledTimes(1));
    // The fresh response replaces the seed — this is the takedown path.
    await waitFor(() =>
      expect(screen.getByText("Cook (revalidated)")).toBeInTheDocument(),
    );
  });

  it("fetches normally when unseeded", async () => {
    renderWithSWR(<JobProbe seed={null} />);
    await waitFor(() => expect(mockGetJobById).toHaveBeenCalledTimes(1));
  });
});

describe("useCompany seeded from the server render", () => {
  it("paints the seed synchronously and revalidates once", async () => {
    renderWithSWR(<CompanyProbe seed={SEED_COMPANY} />);
    expect(screen.getByText("Acme (seeded)")).toBeInTheDocument();
    await waitFor(() => expect(mockGetCompanyById).toHaveBeenCalledTimes(1));
  });
});
