/**
 * The public job page, end to end: an anonymous visitor must trigger ZERO
 * authenticated API calls. JobDescriptor is where all four probes lived —
 * saved jobs and my-companies via hooks, applications and application-draft
 * via effects — each of which used to 401 on every anonymous view (the
 * draft one logging a console error besides).
 */
import { render, screen, waitFor, act } from "@testing-library/react";
import { SWRConfig } from "swr";
import JobDescriptor from "@/components/ui/JobDescriptor";
import {
  getUserProfile,
  getSavedJobs,
  getMyCompanies,
  getMyApplications,
} from "@/lib/api";
import { hasApplicationDraft } from "@/lib/applicationDrafts";
import type { Job } from "@/types/job";

jest.mock("@/lib/api", () => ({
  getUserProfile: jest.fn(),
  getSavedJobs: jest.fn(),
  saveJob: jest.fn(),
  unsaveJob: jest.fn(),
  getMyCompanies: jest.fn(),
  getCompanyById: jest.fn(),
  getCompanyJobs: jest.fn(),
  adminListCompanies: jest.fn(),
  getPublicCompanyJobs: jest.fn(),
  getMyApplications: jest.fn(),
}));
jest.mock("@/lib/api/companies", () => ({
  adminCompanyCounts: jest.fn(),
}));
jest.mock("@/lib/applicationDrafts", () => ({
  hasApplicationDraft: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));
jest.mock("@/components/ui/Toaster", () => ({
  useToaster: () => ({ showToast: jest.fn() }),
}));

const mockGetUserProfile = getUserProfile as jest.Mock;
const mockGetSavedJobs = getSavedJobs as jest.Mock;
const mockGetMyCompanies = getMyCompanies as jest.Mock;
const mockGetMyApplications = getMyApplications as jest.Mock;
const mockHasApplicationDraft = hasApplicationDraft as jest.Mock;

const JOB: Job = {
  id: "cook-ethnic-foods-1234",
  role: "Cook, Ethnic Foods",
  company_name: "Restaurant Jacko",
  company_logo: "",
  location: "Sherbrooke",
  tags: [],
  full_description: "Prepare and cook complete meals.",
  responsibilities: [],
  qualifications: [],
};

function renderJob() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <JobDescriptor {...JOB} />
    </SWRConfig>,
  );
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSavedJobs.mockResolvedValue([]);
  mockGetMyCompanies.mockResolvedValue([]);
  mockGetMyApplications.mockResolvedValue([]);
  mockHasApplicationDraft.mockResolvedValue(false);
});

it("anonymous view fires none of the four authenticated probes", async () => {
  mockGetUserProfile.mockRejectedValue(new Error("Unauthorized"));

  renderJob();
  expect(
    screen.getByRole("heading", { name: "Cook, Ethnic Foods" }),
  ).toBeInTheDocument();

  await waitFor(() => expect(mockGetUserProfile).toHaveBeenCalled());
  await flush();

  expect(mockGetSavedJobs).not.toHaveBeenCalled();
  expect(mockGetMyCompanies).not.toHaveBeenCalled();
  expect(mockGetMyApplications).not.toHaveBeenCalled();
  expect(mockHasApplicationDraft).not.toHaveBeenCalled();
});

it("signed-in view runs all four lookups", async () => {
  mockGetUserProfile.mockResolvedValue({
    data: {
      user: {
        id: "user-1",
        full_name: "Test Person",
        email: "person@example.com",
        role: "person",
      },
    },
  });

  renderJob();

  await waitFor(() => {
    expect(mockGetSavedJobs).toHaveBeenCalledTimes(1);
    expect(mockGetMyCompanies).toHaveBeenCalledTimes(1);
    expect(mockGetMyApplications).toHaveBeenCalledTimes(1);
    expect(mockHasApplicationDraft).toHaveBeenCalledWith(JOB.id);
  });
});

it("a signed-out resolution resets the applied/draft hints", async () => {
  // Regression guard for the gating effects' cleanup branch: when the
  // session resolves signed-out, the effects must settle state (not leave a
  // stale "Application submitted" from a previous render) without fetching.
  mockGetUserProfile.mockRejectedValue(new Error("Unauthorized"));

  renderJob();
  await waitFor(() => expect(mockGetUserProfile).toHaveBeenCalled());
  await flush();

  // Anonymous visitors see the sign-in-to-apply path, never an applied badge.
  expect(screen.queryByText(/application submitted/i)).toBeNull();
  expect(mockGetMyApplications).not.toHaveBeenCalled();
});
