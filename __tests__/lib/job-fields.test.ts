/**
 * Tests for the shared job-field vocabulary helpers.
 */
import {
  fieldLabel,
  toOptions,
  JOB_TYPE_LABELS,
  WORK_ARRANGEMENTS,
  WORK_ARRANGEMENT_LABELS,
} from "@/lib/job-fields";

describe("fieldLabel", () => {
  it("returns the mapped label for a known value", () => {
    expect(fieldLabel(JOB_TYPE_LABELS, "full-time")).toBe("Full-time");
  });

  it("returns null for empty, null or undefined", () => {
    expect(fieldLabel(JOB_TYPE_LABELS, "")).toBeNull();
    expect(fieldLabel(JOB_TYPE_LABELS, undefined)).toBeNull();
    expect(fieldLabel(JOB_TYPE_LABELS, null)).toBeNull();
  });

  it("de-slugs an unmapped value rather than dropping it", () => {
    expect(fieldLabel(JOB_TYPE_LABELS, "some-legacy-value")).toBe(
      "Some legacy value",
    );
  });
});

describe("toOptions", () => {
  it("pairs each vocabulary value with its label", () => {
    expect(toOptions(WORK_ARRANGEMENTS, WORK_ARRANGEMENT_LABELS)).toEqual([
      { value: "onsite", label: "On-site" },
      { value: "remote", label: "Remote" },
      { value: "hybrid", label: "Hybrid" },
    ]);
  });
});
