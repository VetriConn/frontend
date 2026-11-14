/**
 * Tests for the chart palette.
 *
 * The colours themselves were validated by the palette checker, not here.
 * What a unit test can hold is the contract the charts rely on: a known
 * series always gets its own colour, an unknown one never collides with a
 * known one, and the magnitude hue stays separate from series identity.
 */

import {
  CHART_MAGNITUDE,
  CHART_SERIES,
  CHART_SERIES_FALLBACK,
  seriesColour,
} from "@/components/pages/admin/charts/chartTokens";

describe("seriesColour", () => {
  it("gives each known auth state its own colour", () => {
    expect(seriesColour("authenticated")).toBe(CHART_SERIES.authenticated);
    expect(seriesColour("anonymous")).toBe(CHART_SERIES.anonymous);
  });

  it("keeps the two known states apart", () => {
    expect(seriesColour("authenticated")).not.toBe(seriesColour("anonymous"));
  });

  // invalid_token is a third state the backend can report. It must render,
  // and it must not be mistaken for one of the other two.
  it("falls back for an unknown state", () => {
    expect(seriesColour("invalid_token")).toBe(CHART_SERIES_FALLBACK);
    expect(seriesColour("")).toBe(CHART_SERIES_FALLBACK);
  });

  it("does not let the fallback collide with a known series", () => {
    expect(CHART_SERIES_FALLBACK).not.toBe(CHART_SERIES.authenticated);
    expect(CHART_SERIES_FALLBACK).not.toBe(CHART_SERIES.anonymous);
  });

  it("returns a hex colour for anything", () => {
    for (const key of ["authenticated", "anonymous", "invalid_token", "x"]) {
      expect(seriesColour(key)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("the magnitude hue", () => {
  it("is a single colour, not a list", () => {
    expect(typeof CHART_MAGNITUDE).toBe("string");
    expect(CHART_MAGNITUDE).toMatch(/^#[0-9a-f]{6}$/i);
  });

  // Brand red means "error" everywhere else in this product. A red bar in an
  // analytics chart reads as a problem rather than as a quantity.
  it("is not the brand error red", () => {
    const red = "#c53030";
    expect(CHART_MAGNITUDE.toLowerCase()).not.toBe(red);
    expect(Object.values(CHART_SERIES).map((c) => c.toLowerCase())).not.toContain(
      red,
    );
  });
});
