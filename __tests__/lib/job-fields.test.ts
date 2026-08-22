/**
 * Tests for the shared job-field vocabulary helpers.
 */
import {
  fieldLabel,
  toOptions,
  JOB_TYPE_LABELS,
  WORK_ARRANGEMENTS,
  WORK_ARRANGEMENT_LABELS,
  MIN_QUALIFICATIONS,
  MIN_QUALIFICATION_LABELS,
  SECURITY_CLEARANCES,
  SECURITY_CLEARANCE_LABELS,
  LANGUAGES,
  LANGUAGE_LABELS,
  BENEFITS,
  BENEFIT_LABELS,
  CURRENCIES,
  CURRENCY_LABELS,
  SCREENING_QUESTION_TYPES,
  SCREENING_QUESTION_TYPE_LABELS,
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

// A missing label silently falls back to a de-slugged value in the UI, which
// masks a real gap — so assert every Phase-1 vocabulary is fully mapped, and
// that toOptions produces one non-empty option per value.
describe("Phase-1 job-builder vocabularies", () => {
  const vocabularies = [
    { name: "min_qualification", values: MIN_QUALIFICATIONS, labels: MIN_QUALIFICATION_LABELS },
    { name: "security_clearance", values: SECURITY_CLEARANCES, labels: SECURITY_CLEARANCE_LABELS },
    { name: "languages", values: LANGUAGES, labels: LANGUAGE_LABELS },
    { name: "benefits", values: BENEFITS, labels: BENEFIT_LABELS },
    { name: "currency", values: CURRENCIES, labels: CURRENCY_LABELS },
    {
      name: "screening_question_type",
      values: SCREENING_QUESTION_TYPES,
      labels: SCREENING_QUESTION_TYPE_LABELS,
    },
  ] as const;

  it.each(vocabularies)(
    "$name has a non-empty label for every value",
    ({ values, labels }) => {
      for (const value of values) {
        const label = (labels as Record<string, string>)[value];
        expect(typeof label).toBe("string");
        expect(label.trim().length).toBeGreaterThan(0);
      }
    },
  );

  it.each(vocabularies)(
    "$name produces one option per value via toOptions",
    ({ values, labels }) => {
      // Cast past the per-row union so the shared generic resolves to string.
      const options = toOptions(
        values as readonly string[],
        labels as Record<string, string>,
      );
      expect(options).toHaveLength(values.length);
      expect(options.every((o) => o.value && o.label)).toBe(true);
    },
  );
});
