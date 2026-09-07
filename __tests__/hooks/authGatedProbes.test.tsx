/**
 * Signed-out visitors must make ZERO authenticated API requests.
 *
 * useSavedJobs and useMyCompanies mount on public pages (the job detail
 * page's Save button and own-listing check). They used to fire their fetch
 * unconditionally, so every anonymous page view paid guaranteed-401
 * round trips. Their SWR keys now stay null until useUserProfile resolves to
 * a signed-in user — these tests pin that contract in both directions, plus
 * the transition (no fetch while the profile is still resolving).
 */
import { render, waitFor, act } from "@testing-library/react";
import { SWRConfig } from "swr";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useMyCompanies } from "@/hooks/useCompanies";
import {
  getUserProfile,
  getSavedJobs,
  getMyCompanies,
} from "@/lib/api";

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
}));
jest.mock("@/lib/api/companies", () => ({
  adminCompanyCounts: jest.fn(),
}));

const mockGetUserProfile = getUserProfile as jest.Mock;
const mockGetSavedJobs = getSavedJobs as jest.Mock;
const mockGetMyCompanies = getMyCompanies as jest.Mock;

const SIGNED_IN_PROFILE = {
  data: {
    user: {
      id: "user-1",
      full_name: "Test Person",
      email: "person@example.com",
      role: "person",
    },
  },
};

function SavedJobsProbe() {
  useSavedJobs();
  return null;
}

function MyCompaniesProbe() {
  useMyCompanies();
  return null;
}

/** Fresh SWR cache per render so tests can't leak state into each other. */
function renderWithSWR(ui: React.ReactElement) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {ui}
    </SWRConfig>,
  );
}

/** Let any pending promise chains and SWR state updates settle. */
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
});

describe("signed out", () => {
  beforeEach(() => {
    // The real endpoint answers 401 for anonymous visitors; the api layer
    // surfaces that as a rejection.
    mockGetUserProfile.mockRejectedValue(new Error("Unauthorized"));
  });

  it("useSavedJobs makes no request", async () => {
    renderWithSWR(<SavedJobsProbe />);
    await waitFor(() => expect(mockGetUserProfile).toHaveBeenCalled());
    await flush();
    expect(mockGetSavedJobs).not.toHaveBeenCalled();
  });

  it("useMyCompanies makes no request", async () => {
    renderWithSWR(<MyCompaniesProbe />);
    await waitFor(() => expect(mockGetUserProfile).toHaveBeenCalled());
    await flush();
    expect(mockGetMyCompanies).not.toHaveBeenCalled();
  });
});

describe("signed in", () => {
  beforeEach(() => {
    mockGetUserProfile.mockResolvedValue(SIGNED_IN_PROFILE);
  });

  it("useSavedJobs fetches once the profile resolves", async () => {
    renderWithSWR(<SavedJobsProbe />);
    await waitFor(() => expect(mockGetSavedJobs).toHaveBeenCalledTimes(1));
  });

  it("useMyCompanies fetches once the profile resolves", async () => {
    renderWithSWR(<MyCompaniesProbe />);
    await waitFor(() => expect(mockGetMyCompanies).toHaveBeenCalledTimes(1));
  });
});

describe("while the profile is still resolving", () => {
  it("useSavedJobs holds its request until the session is known", async () => {
    // A profile fetch we resolve by hand: the gated request must not fire
    // while it is pending, and must fire promptly once it resolves signed-in.
    let resolveProfile!: (value: typeof SIGNED_IN_PROFILE) => void;
    mockGetUserProfile.mockReturnValue(
      new Promise((resolve) => {
        resolveProfile = resolve;
      }),
    );

    renderWithSWR(<SavedJobsProbe />);
    await flush();
    expect(mockGetSavedJobs).not.toHaveBeenCalled();

    await act(async () => {
      resolveProfile(SIGNED_IN_PROFILE);
    });
    await waitFor(() => expect(mockGetSavedJobs).toHaveBeenCalledTimes(1));
  });
});
