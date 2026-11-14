/**
 * Tests for the daily traffic chart.
 *
 * Two of these are regressions for bugs that the build, the typechecker and
 * the test suite all passed and only looking at the page caught: a one-day
 * window drew nothing, because a polyline of one point paints no pixels.
 * The sparse-series gap is the same class of bug waiting to happen.
 */

import { render, screen, fireEvent, within } from "@testing-library/react";
import TimeSeries from "@/components/pages/admin/charts/TimeSeries";
import type { TelemetryDaily } from "@/lib/api/telemetry";

const rows: TelemetryDaily[] = [
  { day: "2026-11-01", auth_state: "anonymous", count: 10 },
  { day: "2026-11-01", auth_state: "authenticated", count: 4 },
  { day: "2026-11-03", auth_state: "anonymous", count: 6 },
  { day: "2026-11-03", auth_state: "authenticated", count: 2 },
];

const svgOf = (c: HTMLElement) => c.querySelector("svg") as SVGSVGElement;
const polylines = (c: HTMLElement) => Array.from(c.querySelectorAll("polyline"));
const hitStrips = (c: HTMLElement) =>
  Array.from(c.querySelectorAll('rect[fill="transparent"]'));

describe("TimeSeries", () => {
  describe("empty state", () => {
    it("says there is nothing rather than drawing empty axes", () => {
      render(<TimeSeries rows={[]} label="requests" />);
      expect(screen.getByText(/No requests in this window/)).toBeInTheDocument();
    });

    it("names the series in the empty message", () => {
      render(<TimeSeries rows={[]} label="visits" />);
      expect(screen.getByText(/No visits in this window/)).toBeInTheDocument();
    });
  });

  describe("a single day", () => {
    const oneDay: TelemetryDaily[] = [
      { day: "2026-11-14", auth_state: "anonymous", count: 9 },
    ];

    // Regression: the default window is seven days, so a freshly deployed
    // install has exactly one day of data and rendered a chart with axes,
    // a legend and no visible data at all.
    it("draws a visible mark when there is only one point", () => {
      const { container } = render(<TimeSeries rows={oneDay} label="requests" />);
      expect(container.querySelectorAll("circle").length).toBeGreaterThan(0);
    });

    it("draws no polyline for one point, because it would paint nothing", () => {
      const { container } = render(<TimeSeries rows={oneDay} label="requests" />);
      expect(polylines(container)).toHaveLength(0);
    });

    it("still renders the axis label", () => {
      render(<TimeSeries rows={oneDay} label="requests" />);
      expect(screen.getAllByText("Nov 14").length).toBeGreaterThan(0);
    });
  });

  describe("sparse days", () => {
    // The backend emits no row for a day with no events. Joining Nov 1 to
    // Nov 3 with a straight line would hide the quiet day entirely.
    it("fills the gap so a quiet day reads as zero", () => {
      render(<TimeSeries rows={rows} label="requests" />);
      const table = screen.getByRole("table");
      expect(within(table).getByText("Nov 2")).toBeInTheDocument();
    });

    it("gives the filled day a zero, not a blank", () => {
      render(<TimeSeries rows={rows} label="requests" />);
      const row = screen.getByRole("table").querySelectorAll("tbody tr")[1];
      expect(row.textContent).toContain("Nov 2");
      expect(within(row as HTMLElement).getAllByText("0").length).toBeGreaterThan(0);
    });

    it("plots every day in the range, not just the ones with rows", () => {
      const { container } = render(<TimeSeries rows={rows} label="requests" />);
      // Nov 1, 2, 3.
      expect(hitStrips(container)).toHaveLength(3);
    });
  });

  describe("series identity", () => {
    it("renders one line per auth state", () => {
      const { container } = render(<TimeSeries rows={rows} label="requests" />);
      expect(polylines(container)).toHaveLength(2);
    });

    // Identity must never be colour-alone.
    it("always shows a legend naming each series", () => {
      render(<TimeSeries rows={rows} label="requests" />);
      expect(screen.getAllByText("anonymous").length).toBeGreaterThan(0);
      expect(screen.getAllByText("authenticated").length).toBeGreaterThan(0);
    });

    it("gives the two series different colours", () => {
      const { container } = render(<TimeSeries rows={rows} label="requests" />);
      const strokes = polylines(container).map((p) => p.getAttribute("stroke"));
      expect(new Set(strokes).size).toBe(2);
    });

    it("renders an unexpected auth state rather than dropping it", () => {
      render(
        <TimeSeries
          rows={[{ day: "2026-11-01", auth_state: "invalid_token", count: 3 }]}
          label="requests"
        />,
      );
      expect(screen.getAllByText("invalid_token").length).toBeGreaterThan(0);
    });
  });

  describe("hover", () => {
    // Scoped to the tooltip: the same day labels and counts also live in the
    // always-rendered table and on the axis, so an unscoped query passes
    // whether the tooltip exists or not.
    it("shows no tooltip until the reader hovers", () => {
      render(<TimeSeries rows={rows} label="requests" />);
      expect(screen.queryByTestId("chart-tooltip")).not.toBeInTheDocument();
    });

    it("shows the day and both values on hover", () => {
      const { container } = render(<TimeSeries rows={rows} label="requests" />);
      fireEvent.mouseEnter(hitStrips(container)[0]);
      const tip = screen.getByTestId("chart-tooltip");
      expect(within(tip).getByText("Nov 1")).toBeInTheDocument();
      expect(within(tip).getByText("10")).toBeInTheDocument();
      expect(within(tip).getByText("4")).toBeInTheDocument();
    });

    it("updates the tooltip when the reader moves to another day", () => {
      const { container } = render(<TimeSeries rows={rows} label="requests" />);
      fireEvent.mouseEnter(hitStrips(container)[0]);
      fireEvent.mouseEnter(hitStrips(container)[2]);
      const tip = screen.getByTestId("chart-tooltip");
      expect(within(tip).getByText("Nov 3")).toBeInTheDocument();
      expect(within(tip).getByText("6")).toBeInTheDocument();
    });

    it("marks the hovered point", () => {
      const { container } = render(<TimeSeries rows={rows} label="requests" />);
      expect(container.querySelectorAll("circle")).toHaveLength(0);
      fireEvent.mouseEnter(hitStrips(container)[0]);
      expect(container.querySelectorAll("circle")).toHaveLength(2);
    });

    it("clears the tooltip when the pointer leaves the chart", () => {
      const { container } = render(<TimeSeries rows={rows} label="requests" />);
      fireEvent.mouseEnter(hitStrips(container)[0]);
      fireEvent.mouseLeave(svgOf(container));
      expect(container.querySelectorAll("circle")).toHaveLength(0);
    });
  });

  describe("accessibility", () => {
    it("exposes the chart as an image with a description", () => {
      render(<TimeSeries rows={rows} label="requests" />);
      expect(screen.getByRole("img")).toHaveAttribute(
        "aria-label",
        expect.stringContaining("requests"),
      );
    });

    // The same numbers must be reachable without separating two line colours.
    it("offers the same data as a table", () => {
      render(<TimeSeries rows={rows} label="requests" />);
      expect(screen.getByText("View as table")).toBeInTheDocument();
      const table = screen.getByRole("table");
      expect(within(table).getByText("10")).toBeInTheDocument();
      expect(within(table).getByText("6")).toBeInTheDocument();
    });

    it("heads the table with each series name", () => {
      render(<TimeSeries rows={rows} label="requests" />);
      const heads = screen.getByRole("table").querySelectorAll("thead th");
      expect(Array.from(heads).map((h) => h.textContent)).toEqual([
        "Day",
        "anonymous",
        "authenticated",
      ]);
    });
  });

  describe("dates", () => {
    // The backend buckets by UTC day. Formatting in the reader's zone would
    // shift every label off its bucket for anyone west of Greenwich, which
    // is every Canadian user.
    it("labels days in UTC, not the local zone", () => {
      render(
        <TimeSeries
          rows={[{ day: "2026-11-01", auth_state: "anonymous", count: 1 }]}
          label="requests"
        />,
      );
      expect(screen.getAllByText("Nov 1").length).toBeGreaterThan(0);
      expect(screen.queryByText("Oct 31")).not.toBeInTheDocument();
    });
  });
});
