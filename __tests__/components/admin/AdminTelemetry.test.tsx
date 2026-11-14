/**
 * Integration test for the traffic page.
 *
 * Page, hook, SWR and API client wired together with only the network
 * faked, so the headline arithmetic, the empty-state branches and the range
 * control are exercised through the real components.
 *
 * Several branches here are hard to reach from a browser because they need
 * data the local database will not have: a window with no visits, a country
 * facet that is present but entirely null, a 403. Those are what this file
 * is for; the browser pass covers the paths a reader can actually click.
 */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import React from "react";
import AdminTelemetry from "@/components/pages/admin/AdminTelemetry";
import { adminGetTrafficSummary } from "@/lib/api/telemetry";
import type { TrafficSummary } from "@/lib/api/telemetry";

jest.mock("@/lib/api/telemetry", () => ({
  __esModule: true,
  adminGetTrafficSummary: jest.fn(),
}));

const mockedGet = adminGetTrafficSummary as jest.MockedFunction<
  typeof adminGetTrafficSummary
>;

const emptyRequests = {
  total: 0,
  by_auth_state: [],
  unique_visitors_by_auth_state: [],
  by_role: [],
  by_client: [],
  by_origin: [],
  by_country: [],
  top_routes: [],
  daily: [],
};

const emptyVisits = {
  total: 0,
  by_channel: [],
  by_auth_state: [],
  top_referrers: [],
  top_utm_sources: [],
  top_utm_campaigns: [],
  top_landing_paths: [],
  by_client: [],
  by_country: [],
  daily: [],
};

const summary = (over: Partial<TrafficSummary> = {}): TrafficSummary =>
  ({
    window: { from: "2026-11-07T00:00:00.000Z", to: "2026-11-14T00:00:00.000Z" },
    requests: { ...emptyRequests },
    visits: { ...emptyVisits },
    ...over,
  }) as TrafficSummary;

const show = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <AdminTelemetry />
    </SWRConfig>,
  );

/**
 * The panel whose heading is `title`.
 *
 * Scoping matters more than usual on this page: the same strings appear in
 * several places by design. "25%" is a headline share and also a bar's
 * share; "No requests in this window." is both the chart's empty state and
 * the route table's. An unscoped query passes whether the thing under test
 * rendered or not.
 */
const panel = (title: string): HTMLElement =>
  screen
    .getByRole("heading", { name: title })
    .closest("section") as HTMLElement;

/** The value of the headline tile labelled `label`. */
const statValue = (label: string): string =>
  screen.getByText(label).parentElement!.querySelector("p.text-2xl")!
    .textContent!;

describe("AdminTelemetry", () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockResolvedValue(summary());
  });

  describe("load states", () => {
    it("shows the title straight away", () => {
      show();
      expect(screen.getByRole("heading", { name: "Traffic" })).toBeInTheDocument();
    });

    it("surfaces a failure instead of rendering an empty report", async () => {
      // An empty report and a 403 look identical if the error is swallowed,
      // and the difference is "no traffic" versus "you cannot see this".
      mockedGet.mockRejectedValue(new Error("Forbidden"));
      show();
      await waitFor(() =>
        expect(
          screen.getByText(/Couldn't load the traffic report/i),
        ).toBeInTheDocument(),
      );
    });
  });

  describe("headline numbers", () => {
    it("shows request and visit totals", async () => {
      mockedGet.mockResolvedValue(
        summary({
          requests: { ...emptyRequests, total: 1234 },
          visits: { ...emptyVisits, total: 56 },
        }),
      );
      show();
      await waitFor(() => expect(screen.getByText("1,234")).toBeInTheDocument());
      expect(screen.getByText("56")).toBeInTheDocument();
    });

    it("computes the signed-in share of requests", async () => {
      mockedGet.mockResolvedValue(
        summary({
          requests: {
            ...emptyRequests,
            total: 200,
            by_auth_state: [
              { key: "authenticated", count: 50 },
              { key: "anonymous", count: 150 },
            ],
          },
        }),
      );
      show();
      await waitFor(() => expect(mockedGet).toHaveBeenCalled());
      expect(statValue("Signed in")).toBe("25%");
    });

    it("does not divide by zero on an empty window", async () => {
      show();
      await waitFor(() => expect(mockedGet).toHaveBeenCalled());
      expect(statValue("Signed in")).toBe("0%");
    });

    it("sums unique visitors across auth states", async () => {
      mockedGet.mockResolvedValue(
        summary({
          requests: {
            ...emptyRequests,
            total: 10,
            unique_visitors_by_auth_state: [
              { key: "anonymous", count: 7 },
              { key: "authenticated", count: 3 },
            ],
          },
        }),
      );
      show();
      await waitFor(() => expect(mockedGet).toHaveBeenCalled());
      expect(statValue("Unique visitors")).toBe("10");
    });
  });

  describe("the visits half", () => {
    // Until the beacon ships, visits is empty. Six blank panels would read
    // as "nobody visited" rather than "this is not wired up yet".
    it("explains an empty visits section rather than showing blank panels", async () => {
      show();
      await waitFor(() =>
        expect(
          screen.getByText(/until the web app sends the visit beacon/i),
        ).toBeInTheDocument(),
      );
    });

    it("hides the breakdown panels while visits are empty", async () => {
      show();
      await waitFor(() =>
        expect(screen.getByText(/visit beacon/i)).toBeInTheDocument(),
      );
      expect(screen.queryByText("CHANNEL")).not.toBeInTheDocument();
    });

    it("shows the breakdowns once there are visits", async () => {
      mockedGet.mockResolvedValue(
        summary({
          visits: {
            ...emptyVisits,
            total: 3,
            by_channel: [
              { key: "search", count: 2 },
              { key: "social", count: 1 },
            ],
            top_referrers: [{ key: "google.com", count: 2 }],
          },
        }),
      );
      show();
      await waitFor(() => expect(screen.getByText("Channel")).toBeInTheDocument());
      expect(screen.getByText("search")).toBeInTheDocument();
      expect(screen.getByText("google.com")).toBeInTheDocument();
    });
  });

  describe("country", () => {
    // Regression: the guard summed counts, but a facet over an unpopulated
    // field returns one null-keyed row holding every event, so the sum was
    // never zero and the panel drew an "(unknown) 100%" bar that read as a
    // finding rather than as a missing CDN header.
    it("explains the gap when every country row is null", async () => {
      mockedGet.mockResolvedValue(
        summary({
          requests: {
            ...emptyRequests,
            total: 9,
            by_country: [{ key: null, count: 9 }],
          },
        }),
      );
      show();
      await waitFor(() =>
        expect(screen.getByText(/sends no geo header/i)).toBeInTheDocument(),
      );
      expect(screen.queryByText("(unknown)")).not.toBeInTheDocument();
    });

    it("draws the breakdown when real countries are present", async () => {
      mockedGet.mockResolvedValue(
        summary({
          requests: {
            ...emptyRequests,
            total: 9,
            by_country: [
              { key: "CA", count: 7 },
              { key: null, count: 2 },
            ],
          },
        }),
      );
      show();
      await waitFor(() => expect(screen.getByText("CA")).toBeInTheDocument());
      expect(screen.queryByText(/sends no geo header/i)).not.toBeInTheDocument();
    });
  });

  describe("routes", () => {
    it("lists busiest routes with their split and latency", async () => {
      mockedGet.mockResolvedValue(
        summary({
          requests: {
            ...emptyRequests,
            total: 5,
            top_routes: [
              {
                method: "GET",
                route: "/api/v1/jobs/:id",
                count: 5,
                authenticated: 2,
                anonymous: 3,
                avg_ms: 21,
              },
            ],
          },
        }),
      );
      show();
      await waitFor(() =>
        expect(screen.getByText("/api/v1/jobs/:id")).toBeInTheDocument(),
      );
      const row = screen.getByText("/api/v1/jobs/:id").closest("tr")!;
      expect(within(row).getByText("GET")).toBeInTheDocument();
      expect(within(row).getByText("21 ms")).toBeInTheDocument();
    });

    it("says so when there are no routes", async () => {
      show();
      await waitFor(() => expect(mockedGet).toHaveBeenCalled());
      expect(
        within(panel("Busiest routes")).getByText("No requests in this window."),
      ).toBeInTheDocument();
    });
  });

  describe("the window control", () => {
    it("defaults to seven days", async () => {
      show();
      await waitFor(() => expect(mockedGet).toHaveBeenCalled());
      expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    });

    it("refetches with a wider window when the reader changes it", async () => {
      const user = userEvent.setup();
      show();
      await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(1));
      const firstFrom = mockedGet.mock.calls[0][0]!.from!;

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "Last 90 days" }));

      await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(2));
      const secondFrom = mockedGet.mock.calls[1][0]!.from!;
      expect(new Date(secondFrom).getTime()).toBeLessThan(
        new Date(firstFrom).getTime(),
      );
    });
  });

  describe("structure", () => {
    it("renders every section", async () => {
      show();
      await waitFor(() => expect(mockedGet).toHaveBeenCalled());
      for (const title of [
        "Requests over time",
        "Where visitors come from",
        "Who is calling",
        "Busiest routes",
        "Country",
      ]) {
        expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      }
    });

    it("offers a way back to the team page", async () => {
      show();
      await waitFor(() => expect(mockedGet).toHaveBeenCalled());
      expect(screen.getByRole("link", { name: /back to team/i })).toHaveAttribute(
        "href",
        "/admin/team",
      );
    });

    it("labels the unique-visitor caveat, since summing days over-counts", async () => {
      show();
      await waitFor(() => expect(mockedGet).toHaveBeenCalled());
      expect(
        screen.getByText(/summing days over-counts/i),
      ).toBeInTheDocument();
    });
  });
});
