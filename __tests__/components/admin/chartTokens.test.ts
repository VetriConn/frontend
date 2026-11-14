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

  // Product decision: the charts wear the Vetriconn red. This asserts it so
  // a future palette change has to be deliberate rather than incidental.
  it("is the Vetriconn brand red", () => {
    expect(CHART_MAGNITUDE.toLowerCase()).toBe("#c53030");
  });
});

describe("the validated series pair", () => {
  // Changing either colour invalidates the colourblind separation that was
  // measured for this specific pair, so pin both. ΔE 29.1 protan, 32.4
  // tritan, 35.3 normal vision.
  it("is the pair that was checked, not merely two different colours", () => {
    expect(CHART_SERIES.authenticated.toLowerCase()).toBe("#c53030");
    expect(CHART_SERIES.anonymous.toLowerCase()).toBe("#2563eb");
  });

  // The obvious grey partners drop below the chroma floor and read as grey
  // rather than as a series, so the second colour must stay saturated.
  it("does not pair the brand with a grey", () => {
    for (const greyish of ["#4b5563", "#1f2937", "#6b7280"]) {
      expect(CHART_SERIES.anonymous.toLowerCase()).not.toBe(greyish);
    }
  });
});
