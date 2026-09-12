/**
 * Tests for job display rules.
 *
 * These encode the two failures that aggregated listings caused: applications
 * routed into our own flow when the real posting lives elsewhere, and hourly
 * pay rendered as "$0K/year".
 */

import {
  isAggregatedJob,
  getSourceLabel,
  getExternalApplyUrl,
  formatJobSalary,
  getPayBasis,
  hasComparableSalary,
  jobPreviewParts,
} from "@/lib/job-display";

/**
 * Pay, as the API now ships it: one object. `currency` is always present;
 * everything else is stated only when the listing says so, so an omitted
 * `min` means "no figure given" rather than "pays nothing".
 */
const pay = (fields: {
  min?: number;
  max?: number;
  basis?: "hourly" | "salary" | "commission";
  text?: string;
}) => ({ compensation: { currency: "CAD", ...fields } });

/** A listing that states nothing at all about pay. */
const noPay = { compensation: undefined };

describe("isAggregatedJob", () => {
  it("should be true for scraped listings", () => {
    expect(isAggregatedJob({ source: "scraped" })).toBe(true);
  });

  it("should be false for employer-posted listings", () => {
    expect(isAggregatedJob({ source: "user" })).toBe(false);
  });

  it("should be false when source is absent, as on older rows", () => {
    expect(isAggregatedJob({})).toBe(false);
  });
});

describe("getSourceLabel", () => {
  it("should name the board a listing came from", () => {
    expect(
      getSourceLabel({ source: "scraped", source_name: "Job Bank" }),
    ).toBe("Job Bank");
  });

  it("should fall back to generic wording when the board is unnamed", () => {
    expect(getSourceLabel({ source: "scraped" })).toBe(
      "an external job board",
    );
  });

  it("should return null for employer-posted listings", () => {
    expect(getSourceLabel({ source: "user", source_name: "ignored" })).toBeNull();
  });
});

describe("getExternalApplyUrl", () => {
  it("should use external_url for a scraped listing", () => {
    expect(
      getExternalApplyUrl({
        source: "scraped",
        external_url: "https://jobbank.gc.ca/posting/123",
      }),
    ).toBe("https://jobbank.gc.ca/posting/123");
  });

  it("should use applicationLink for an employer's external process", () => {
    expect(
      getExternalApplyUrl({ applicationLink: "https://acme.com/careers/7" }),
    ).toBe("https://acme.com/careers/7");
  });

  it("should prefer external_url when a listing somehow has both", () => {
    expect(
      getExternalApplyUrl({
        source: "scraped",
        external_url: "https://jobbank.gc.ca/posting/123",
        applicationLink: "https://acme.com/careers/7",
      }),
    ).toBe("https://jobbank.gc.ca/posting/123");
  });

  it("should return null for a normal listing, keeping it in our own flow", () => {
    expect(getExternalApplyUrl({ source: "user" })).toBeNull();
  });

  it("should treat a whitespace-only URL as absent", () => {
    expect(getExternalApplyUrl({ external_url: "   " })).toBeNull();
  });
});

describe("getPayBasis", () => {
  it.each([
    ["$18.50 hourly", "hourly"],
    ["$22.00 / hr", "hourly"],
    ["$25 per hour", "hourly"],
    ["$45,000 annually", "annual"],
    ["$60,000 to $75,000 per year", "annual"],
  ])("should read %s as %s", (text, expected) => {
    expect(getPayBasis(pay({ text: text }))).toBe(expected);
  });

  it("should treat weekly and monthly rates as unspecified, not annual", () => {
    expect(getPayBasis(pay({ text: "$1,200 monthly" }))).toBe("unspecified");
    expect(getPayBasis(pay({ text: "$500 weekly" }))).toBe("unspecified");
  });

  it("should treat non-numeric wording as unspecified", () => {
    expect(getPayBasis(pay({ text: "Competitive" }))).toBe("unspecified");
    expect(getPayBasis(pay({ text: "To be discussed" }))).toBe("unspecified");
  });

  it("should read a numeric salary with no source text as annual", () => {
    expect(getPayBasis(pay({ min: 45000 }))).toBe("annual");
  });

  it("should read a job with no pay information as unspecified", () => {
    expect(getPayBasis(noPay)).toBe("unspecified");
    expect(getPayBasis(pay({}))).toBe("unspecified");
  });
});

describe("hasComparableSalary", () => {
  it("should be true for a numeric annual salary", () => {
    expect(hasComparableSalary(pay({ min: 45000 }))).toBe(true);
  });

  it("should be true for a complete range", () => {
    expect(
      hasComparableSalary(pay({ min: 45000, max: 60000 })),
    ).toBe(true);
  });

  it("should be false for an hourly role, which salary filters cannot match", () => {
    expect(
      hasComparableSalary(pay({ min: 0, text: "$18.50 hourly" })),
    ).toBe(false);
  });

  it("should be false when there is no pay information", () => {
    expect(hasComparableSalary(noPay)).toBe(false);
  });
});

describe("formatJobSalary", () => {
  describe("aggregated listings", () => {
    it("should show the source's own wording for hourly pay", () => {
      // The regression: 18.5 / 1000 rounded to 0 and was labelled "/year".
      expect(
        formatJobSalary(pay({ min: 18.5, text: "$18.50 hourly" })),
      ).toBe("$18.50 hourly");
    });

    it("should prefer salary_text over a parsed number", () => {
      expect(
        formatJobSalary(pay({ min: 2, text: "2 positions, $25.00 hourly" })),
      ).toBe("2 positions, $25.00 hourly");
    });

    it("should ignore a whitespace-only salary_text", () => {
      expect(
        formatJobSalary(pay({ min: 45000, max: 45000, text: "   " })),
      ).toBe("$45K/year");
    });
  });

  describe("unknown pay", () => {
    it("should return null when the scraper found no figure", () => {
      // The scraper writes 0 when it cannot parse a salary.
      expect(formatJobSalary(pay({}))).toBeNull();
    });

    it("should return null when there is no salary at all", () => {
      expect(formatJobSalary(noPay)).toBeNull();
    });

    it("should return null for a range missing both ends", () => {
      expect(
        formatJobSalary(pay({})),
      ).toBeNull();
    });
  });

  describe("compact variant", () => {
    it("should state a lone minimum as a floor, not an exact figure", () => {
      // The wizard has separate minimum and maximum boxes, so a lone minimum
      // genuinely means "from". This is the one rendering the collapsed shape
      // changed, and deliberately: the old model kept an exact figure and a
      // range floor in different fields and rendered both identically.
      expect(formatJobSalary(pay({ min: 45000 }))).toBe("From $45K/year");
    });

    it("should render equal ends as one figure, not a range", () => {
      expect(formatJobSalary(pay({ min: 45000, max: 45000 }))).toBe("$45K/year");
    });

    it("should render a range", () => {
      expect(
        formatJobSalary(pay({ min: 45000, max: 60000 })),
      ).toBe("$45K – $60K/year");
    });

    it("should prefer a complete range over a single salary", () => {
      expect(
        formatJobSalary(pay({ min: 50000, max: 70000 })),
      ).toBe("$50K – $70K/year");
    });
  });

  describe("full variant", () => {
    it("should render the exact amount with its currency", () => {
      expect(formatJobSalary(pay({ min: 45000, max: 45000 }), "full")).toBe(
        "$45,000 CAD",
      );
    });

    it("should render a full range", () => {
      expect(
        formatJobSalary(
          pay({ min: 45000, max: 60000 }),
          "full",
        ),
      ).toBe("$45,000 CAD – $60,000 CAD");
    });

    it("should not render a bare zero as free work", () => {
      // JobResultsList previously showed "$0 CAD" for unparseable salaries.
      expect(formatJobSalary(pay({}), "full")).toBeNull();
    });
  });

  describe("payment type", () => {
    it("should word an hourly range hourly, not as $0K/year", () => {
      expect(
        formatJobSalary(pay({ basis: "hourly", min: 25, max: 30 })),
      ).toBe("$25 – $30/hour");
    });

    it("should word an hourly single figure hourly in full variant", () => {
      expect(
        formatJobSalary(pay({ basis: "hourly", min: 28, max: 28 }), "full"),
      ).toBe("$28 CAD hourly");
    });

    it("should keep annual wording for salary payment type", () => {
      expect(
        formatJobSalary(pay({ basis: "salary", min: 45000, max: 45000 })),
      ).toBe("$45K/year");
    });

    it("getPayBasis should trust the stored column over text inference", () => {
      expect(
        getPayBasis(pay({ basis: "hourly", text: "$45,000 a year" })),
      ).toBe("hourly");
      expect(getPayBasis(pay({ basis: "commission" }))).toBe("unspecified");
    });

    it("should keep cents on an hourly rate, but not on a round one", () => {
      // The bug: toLocaleString() rendered 18.5 as "$18.5/hour".
      expect(
        formatJobSalary(
          pay({ basis: "hourly", min: 18.5, max: 24.75 }),
          "compact",
        ),
      ).toBe("$18.50 – $24.75/hour");
      // A whole rate stays clean rather than "$25.00/hour".
      expect(
        formatJobSalary(pay({ basis: "hourly", min: 25, max: 25 }), "compact"),
      ).toBe("$25/hour");
    });
  });

  describe("partial ranges", () => {
    it('renders a min-only range as "From"', () => {
      expect(
        formatJobSalary(pay({ min: 50000, max: 0 })),
      ).toBe("From $50K/year");
    });

    it('renders a max-only range as "Up to"', () => {
      expect(
        formatJobSalary(pay({ min: 0, max: 90000 })),
      ).toBe("Up to $90K/year");
    });

    it("renders nothing when neither bound is set", () => {
      expect(
        formatJobSalary(pay({ min: 0, max: 0 })),
      ).toBeNull();
    });
  });
});

/**
 * What a result card says about a job.
 *
 * The card showed the brief and nothing else, which penalised the postings
 * that used the builder as intended: `summary` derives from the Job Brief
 * alone, so putting the substance under "What You'll Do" produced a
 * near-empty card, while an aggregated listing whose whole body is one run of
 * duties looked full.
 */
describe("jobPreviewParts", () => {
  it("continues a brief with the duties it did not state", () => {
    expect(
      jobPreviewParts("Lead a crew of twelve on our Burnaby floor.", [
        "Run the daily shift plan",
        "Own the safety walk",
      ]),
    ).toEqual([
      "Lead a crew of twelve on our Burnaby floor.",
      "Run the daily shift plan",
      "Own the safety walk",
    ]);
  });

  it("gives a posting with no brief something to say", () => {
    // A real row in the database: no summary at all, three duties. The card
    // rendered an empty paragraph and no reason to click.
    expect(jobPreviewParts(undefined, ["Greet people", "Heal people"])).toEqual([
      "Greet people",
      "Heal people",
    ]);
    expect(jobPreviewParts("", [])).toEqual([]);
  });

  it("does not repeat what a truncated brief already began", () => {
    // Aggregated listings: the brief is the first 280 characters of the same
    // text the duties were pulled from, so it ends part-way through the list.
    const brief =
      "Tasks: Collect and document user's requirements. Coordinate the development, installation, integration a…";
    expect(
      jobPreviewParts(brief, [
        "Collect and document user's requirements",
        "Define system functionality",
      ]),
    ).toEqual([brief, "Define system functionality"]);
  });

  it("matches a restated duty regardless of casing or spacing", () => {
    expect(
      jobPreviewParts("Tasks: define system   functionality.", [
        "Define System Functionality",
        "Upgrade and maintain software",
      ]),
    ).toEqual(["Tasks: define system   functionality.", "Upgrade and maintain software"]);
  });

  it("still splits a piped brief into its fragments", () => {
    expect(jobPreviewParts("Sort freight | Load trucks", ["Close the yard"])).toEqual([
      "Sort freight",
      "Load trucks",
      "Close the yard",
    ]);
  });
});
