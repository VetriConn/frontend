/**
 * The external-jobs table is the only place scraped listings are visible.
 *
 * They arrive already approved from a trusted source, so the review queue
 * deliberately excludes them — which left them unmanageable: no count, no
 * listing, and no way to remove one. The duplicates that prompted this table
 * could only be seen from the public job board.
 */

import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ExternalJobsTable from "@/components/pages/admin/ExternalJobsTable";

const listExternalJobs = jest.fn();
const deleteExternalJob = jest.fn();

jest.mock("@/lib/api/jobs", () => ({
  adminListExternalJobs: (...args: unknown[]) => listExternalJobs(...args),
  adminDeleteExternalJob: (...args: unknown[]) => deleteExternalJob(...args),
}));

const showToast = jest.fn();
jest.mock("@/components/ui/Toaster", () => ({
  useToaster: () => ({ showToast }),
}));

/**
 * A fresh SWR cache per test. Without it the first test's response is cached
 * under ["admin-external-jobs", 1, ""] and handed to every later one — the
 * same key-is-not-identity trap as hooks/useSessionCache, in miniature.
 */
const render = (ui: React.ReactElement) =>
  rtlRender(<SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>);

const job = (over: Record<string, unknown> = {}) => ({
  _id: "job-1",
  role: "food service supervisor",
  company_name: "Subway Restaurant",
  location: "Calgary (AB)",
  compensation: { min: 19.5, currency: "CAD", basis: "hourly" },
  external_url: "https://www.jobbank.gc.ca/jobsearch/jobposting/50251117",
  last_scraped_at: "2026-09-09T12:00:00.000Z",
  ...over,
});

beforeEach(() => {
  listExternalJobs.mockReset();
  deleteExternalJob.mockReset();
  showToast.mockReset();
  listExternalJobs.mockResolvedValue({ jobs: [job()], pagination: undefined });
});

describe("ExternalJobsTable", () => {
  it("lists what the scraper put on the board", async () => {
    render(<ExternalJobsTable />);

    expect(await screen.findByText("food service supervisor")).toBeInTheDocument();
    expect(screen.getByText("Subway Restaurant")).toBeInTheDocument();
    expect(screen.getByText("Calgary (AB)")).toBeInTheDocument();
  });

  it("links each row back to the source, safely", async () => {
    render(<ExternalJobsTable />);

    const link = await screen.findByRole("link", { name: /open .*food service supervisor.* at the source/i });
    expect(link).toHaveAttribute("href", job().external_url);
    // A listing is third-party content; the tab it opens must not get a
    // handle on this one.
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("flags a listing no run has seen since it was inserted", async () => {
    listExternalJobs.mockResolvedValue({
      jobs: [job({ last_scraped_at: undefined })],
      pagination: undefined,
    });
    render(<ExternalJobsTable />);

    // last_scraped_at is what the stale sweep measures, so its absence is the
    // one piece of provenance worth surfacing in the row itself.
    expect(await screen.findByText("Not refreshed")).toBeInTheDocument();
  });

  it("asks before deleting, and says the scraper will bring it back", async () => {
    const user = userEvent.setup();
    deleteExternalJob.mockResolvedValue(undefined);
    render(<ExternalJobsTable />);

    await user.click(
      await screen.findByRole("button", { name: /delete .*food service supervisor/i }),
    );

    expect(await screen.findByText(/next scrape brings it back/i)).toBeInTheDocument();
    expect(deleteExternalJob).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await waitFor(() => expect(deleteExternalJob).toHaveBeenCalledWith("job-1"));
  });

  it("searches by role, company or location", async () => {
    const user = userEvent.setup();
    render(<ExternalJobsTable />);
    await screen.findByText("food service supervisor");

    await user.type(
      screen.getByRole("searchbox", { name: /search external jobs/i }),
      "cook",
    );

    await waitFor(() =>
      expect(listExternalJobs).toHaveBeenLastCalledWith(1, 20, "cook"),
    );
  });

  it("says so when the board is empty rather than showing a bare table", async () => {
    listExternalJobs.mockResolvedValue({ jobs: [], pagination: undefined });
    render(<ExternalJobsTable />);

    expect(await screen.findByText("No external jobs")).toBeInTheDocument();
    expect(
      screen.getByText(/run the scraper to pull listings/i),
    ).toBeInTheDocument();
  });
});
