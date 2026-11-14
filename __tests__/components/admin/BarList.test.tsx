/**
 * Tests for the ranked magnitude list.
 *
 * Two things this has to get right and can silently get wrong: the share
 * percentage must come from the real total rather than from the longest bar,
 * and every bar must carry the same hue. A per-bar colour would imply the
 * colours mean something.
 */

import { render, screen } from "@testing-library/react";
import BarList from "@/components/pages/admin/charts/BarList";
import { CHART_MAGNITUDE } from "@/components/pages/admin/charts/chartTokens";

const rows = [
  { key: "search", count: 60 },
  { key: "social", count: 30 },
  { key: "direct", count: 10 },
];

/** The coloured fill inside each track, in render order. */
const bars = (c: HTMLElement): HTMLElement[] =>
  Array.from(c.querySelectorAll("li div[style]"));

describe("BarList", () => {
  describe("empty states", () => {
    it("shows the empty label when there are no rows", () => {
      render(<BarList rows={[]} />);
      expect(screen.getByText("No data in this window")).toBeInTheDocument();
    });

    it("accepts a custom empty label", () => {
      render(<BarList rows={[]} emptyLabel="No visits yet" />);
      expect(screen.getByText("No visits yet")).toBeInTheDocument();
    });
  });

  describe("labels", () => {
    it("renders one row per entry", () => {
      render(<BarList rows={rows} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("shows each key", () => {
      render(<BarList rows={rows} />);
      expect(screen.getByText("search")).toBeInTheDocument();
      expect(screen.getByText("social")).toBeInTheDocument();
    });

    // A null key is a real value from the backend: the field was unset on
    // those events. It has to read as something, not as a blank row.
    it("renders a null key with the fallback label", () => {
      render(<BarList rows={[{ key: null, count: 5 }]} />);
      expect(screen.getByText("(not set)")).toBeInTheDocument();
    });

    it("accepts a context-specific null label", () => {
      render(<BarList rows={[{ key: null, count: 5 }]} nullLabel="(direct)" />);
      expect(screen.getByText("(direct)")).toBeInTheDocument();
    });

    it("treats a blank string like a null key", () => {
      render(<BarList rows={[{ key: "   ", count: 5 }]} />);
      expect(screen.getByText("(not set)")).toBeInTheDocument();
    });
  });

  describe("counts and shares", () => {
    it("formats counts with thousands separators", () => {
      render(<BarList rows={[{ key: "search", count: 12345 }]} />);
      expect(screen.getByText(/12,345/)).toBeInTheDocument();
    });

    it("takes the share from the supplied total, not the largest row", () => {
      // 60 of 200 is 30%. Against the largest bar it would read 100%.
      render(<BarList rows={rows} total={200} />);
      expect(screen.getByText("30%")).toBeInTheDocument();
      expect(screen.getByText("15%")).toBeInTheDocument();
    });

    it("falls back to the largest row when no total is given", () => {
      render(<BarList rows={rows} />);
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("does not divide by zero when the total is zero", () => {
      render(<BarList rows={[{ key: "a", count: 0 }]} total={0} />);
      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("appends a suffix when asked", () => {
      render(<BarList rows={[{ key: "a", count: 7 }]} valueSuffix=" ms" />);
      expect(screen.getByText(/7 ms/)).toBeInTheDocument();
    });
  });

  describe("bars", () => {
    it("scales the widest bar to full width", () => {
      const { container } = render(<BarList rows={rows} />);
      expect(bars(container)[0].style.width).toBe("100%");
    });

    it("scales the rest against the widest", () => {
      const { container } = render(<BarList rows={rows} />);
      expect(bars(container)[1].style.width).toBe("50%");
    });

    // A count of 1 against a max of 10,000 would round to a 0%-wide bar and
    // vanish, making a real row look like no row.
    it("keeps a tiny bar visible", () => {
      const { container } = render(
        <BarList rows={[{ key: "big", count: 10000 }, { key: "tiny", count: 1 }]} />,
      );
      expect(parseFloat(bars(container)[1].style.width)).toBeGreaterThan(0);
    });

    it("gives every bar the same hue, because colour is not carrying data here", () => {
      const { container } = render(<BarList rows={rows} />);
      const colours = new Set(bars(container).map((b) => b.style.backgroundColor));
      expect(colours.size).toBe(1);
    });

    it("uses the magnitude token", () => {
      const { container } = render(<BarList rows={rows} />);
      // jsdom normalises hex to rgb(), so compare by converting.
      const hex = CHART_MAGNITUDE.replace("#", "");
      const rgb = `rgb(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(
        hex.slice(2, 4),
        16,
      )}, ${parseInt(hex.slice(4, 6), 16)})`;
      expect(bars(container)[0].style.backgroundColor).toBe(rgb);
    });
  });

  describe("truncation", () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      key: `host-${i}`,
      count: 25 - i,
    }));

    it("shows at most ten rows by default", () => {
      render(<BarList rows={many} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(10);
    });

    it("respects a custom maximum", () => {
      render(<BarList rows={many} max={3} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("keeps the highest rows, since the backend sorts descending", () => {
      render(<BarList rows={many} max={2} />);
      expect(screen.getByText("host-0")).toBeInTheDocument();
      expect(screen.queryByText("host-20")).not.toBeInTheDocument();
    });
  });
});
