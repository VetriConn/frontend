/**
 * Tests for the country → region helpers behind the Country → Province/State →
 * City location fields.
 */
import {
  regionsFor,
  hasRegions,
  regionLabelFor,
  regionName,
} from "@/lib/regions";

describe("regionsFor", () => {
  it("enumerates Canadian provinces", () => {
    const r = regionsFor("Canada");
    expect(r.find((x) => x.code === "ON")?.name).toBe("Ontario");
    expect(r.find((x) => x.code === "QC")?.name).toBe("Quebec");
    expect(r.length).toBe(13);
  });

  it("enumerates US states", () => {
    const r = regionsFor("United States");
    expect(r.find((x) => x.code === "CA")?.name).toBe("California");
    expect(r.length).toBeGreaterThan(50);
  });

  it("returns an empty list for countries we don't enumerate", () => {
    expect(regionsFor("Nigeria")).toEqual([]);
    expect(regionsFor(undefined)).toEqual([]);
    expect(regionsFor("")).toEqual([]);
  });
});

describe("hasRegions", () => {
  it("is true only where regions are enumerated", () => {
    expect(hasRegions("Canada")).toBe(true);
    expect(hasRegions("United States")).toBe(true);
    expect(hasRegions("Nigeria")).toBe(false);
    expect(hasRegions(undefined)).toBe(false);
  });
});

describe("regionLabelFor", () => {
  it("names the region correctly per country", () => {
    expect(regionLabelFor("Canada")).toBe("Province");
    expect(regionLabelFor("United States")).toBe("State");
    expect(regionLabelFor("Nigeria")).toBe("Province or state");
    expect(regionLabelFor(undefined)).toBe("Province or state");
  });
});

describe("regionName", () => {
  it("resolves a stored code to its display name", () => {
    expect(regionName("Canada", "ON")).toBe("Ontario");
    expect(regionName("United States", "CA")).toBe("California");
  });

  it("falls back to the raw value for free-text or unknown regions", () => {
    expect(regionName("Nigeria", "Lagos")).toBe("Lagos");
    expect(regionName("Canada", "ZZ")).toBe("ZZ");
  });

  it("returns empty string when there is no code", () => {
    expect(regionName("Canada", undefined)).toBe("");
    expect(regionName(undefined, "")).toBe("");
  });
});
