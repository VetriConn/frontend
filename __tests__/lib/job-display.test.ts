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
} from "@/lib/job-display";

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

describe("formatJobSalary", () => {
  const money = (number: number) => ({
    symbol: "$",
    number,
    currency: "CAD",
  });

  describe("aggregated listings", () => {
    it("should show the source's own wording for hourly pay", () => {
      // The regression: 18.5 / 1000 rounded to 0 and was labelled "/year".
      expect(
        formatJobSalary({
          salary: money(18.5),
          salary_text: "$18.50 hourly",
        }),
      ).toBe("$18.50 hourly");
    });

    it("should prefer salary_text over a parsed number", () => {
      expect(
        formatJobSalary({
          salary: money(2),
          salary_text: "2 positions, $25.00 hourly",
        }),
      ).toBe("2 positions, $25.00 hourly");
    });

    it("should ignore a whitespace-only salary_text", () => {
      expect(
        formatJobSalary({ salary: money(45000), salary_text: "   " }),
      ).toBe("$45K/year");
    });
  });

  describe("unknown pay", () => {
    it("should return null when the scraper found no figure", () => {
      // The scraper writes 0 when it cannot parse a salary.
      expect(formatJobSalary({ salary: money(0) })).toBeNull();
    });

    it("should return null when there is no salary at all", () => {
      expect(formatJobSalary({})).toBeNull();
    });

    it("should return null for a range missing both ends", () => {
      expect(
        formatJobSalary({
          salary_range: {
            start_salary: { symbol: "$", currency: "CAD" },
            end_salary: { symbol: "$", currency: "CAD" },
          },
        }),
      ).toBeNull();
    });
  });

  describe("compact variant", () => {
    it("should render a single salary in thousands per year", () => {
      expect(formatJobSalary({ salary: money(45000) })).toBe("$45K/year");
    });

    it("should render a range", () => {
      expect(
        formatJobSalary({
          salary_range: {
            start_salary: money(45000),
            end_salary: money(60000),
          },
        }),
      ).toBe("$45K – $60K/year");
    });

    it("should prefer a complete range over a single salary", () => {
      expect(
        formatJobSalary({
          salary: money(45000),
          salary_range: {
            start_salary: money(50000),
            end_salary: money(70000),
          },
        }),
      ).toBe("$50K – $70K/year");
    });
  });

  describe("full variant", () => {
    it("should render the exact amount with its currency", () => {
      expect(formatJobSalary({ salary: money(45000) }, "full")).toBe(
        "$45,000 CAD",
      );
    });

    it("should render a full range", () => {
      expect(
        formatJobSalary(
          {
            salary_range: {
              start_salary: money(45000),
              end_salary: money(60000),
            },
          },
          "full",
        ),
      ).toBe("$45,000 CAD – $60,000 CAD");
    });

    it("should not render a bare zero as free work", () => {
      // JobResultsList previously showed "$0 CAD" for unparseable salaries.
      expect(formatJobSalary({ salary: money(0) }, "full")).toBeNull();
    });
  });
});
