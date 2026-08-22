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

describe("getPayBasis", () => {
  const money = (number: number) => ({
    symbol: "$",
    number,
    currency: "CAD",
  });

  it.each([
    ["$18.50 hourly", "hourly"],
    ["$22.00 / hr", "hourly"],
    ["$25 per hour", "hourly"],
    ["$45,000 annually", "annual"],
    ["$60,000 to $75,000 per year", "annual"],
  ])("should read %s as %s", (text, expected) => {
    expect(getPayBasis({ salary_text: text })).toBe(expected);
  });

  it("should treat weekly and monthly rates as unspecified, not annual", () => {
    expect(getPayBasis({ salary_text: "$1,200 monthly" })).toBe("unspecified");
    expect(getPayBasis({ salary_text: "$500 weekly" })).toBe("unspecified");
  });

  it("should treat non-numeric wording as unspecified", () => {
    expect(getPayBasis({ salary_text: "Competitive" })).toBe("unspecified");
    expect(getPayBasis({ salary_text: "To be discussed" })).toBe("unspecified");
  });

  it("should read a numeric salary with no source text as annual", () => {
    expect(getPayBasis({ salary: money(45000) })).toBe("annual");
  });

  it("should read a job with no pay information as unspecified", () => {
    expect(getPayBasis({})).toBe("unspecified");
    expect(getPayBasis({ salary: money(0) })).toBe("unspecified");
  });
});

describe("hasComparableSalary", () => {
  const money = (number: number) => ({
    symbol: "$",
    number,
    currency: "CAD",
  });

  it("should be true for a numeric annual salary", () => {
    expect(hasComparableSalary({ salary: money(45000) })).toBe(true);
  });

  it("should be true for a complete range", () => {
    expect(
      hasComparableSalary({
        salary_range: { start_salary: money(45000), end_salary: money(60000) },
      }),
    ).toBe(true);
  });

  it("should be false for an hourly role, which salary filters cannot match", () => {
    expect(
      hasComparableSalary({ salary: money(0), salary_text: "$18.50 hourly" }),
    ).toBe(false);
  });

  it("should be false when there is no pay information", () => {
    expect(hasComparableSalary({})).toBe(false);
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

  describe("payment type", () => {
    it("should word an hourly range hourly, not as $0K/year", () => {
      expect(
        formatJobSalary({
          payment_type: "hourly",
          salary_range: {
            start_salary: money(25),
            end_salary: money(30),
          },
        }),
      ).toBe("$25 – $30/hour");
    });

    it("should word an hourly single figure hourly in full variant", () => {
      expect(
        formatJobSalary({ payment_type: "hourly", salary: money(28) }, "full"),
      ).toBe("$28 CAD hourly");
    });

    it("should keep annual wording for salary payment type", () => {
      expect(
        formatJobSalary({ payment_type: "salary", salary: money(45000) }),
      ).toBe("$45K/year");
    });

    it("getPayBasis should trust the stored column over text inference", () => {
      expect(
        getPayBasis({ payment_type: "hourly", salary_text: "$45,000 a year" }),
      ).toBe("hourly");
      expect(getPayBasis({ payment_type: "commission" })).toBe("unspecified");
    });

    it("should keep cents on an hourly rate, but not on a round one", () => {
      // The bug: toLocaleString() rendered 18.5 as "$18.5/hour".
      expect(
        formatJobSalary(
          {
            payment_type: "hourly",
            salary_range: { start_salary: money(18.5), end_salary: money(24.75) },
          },
          "compact",
        ),
      ).toBe("$18.50 – $24.75/hour");
      // A whole rate stays clean rather than "$25.00/hour".
      expect(
        formatJobSalary({ payment_type: "hourly", salary: money(25) }, "compact"),
      ).toBe("$25/hour");
    });
  });

  describe("partial ranges", () => {
    it('renders a min-only range as "From"', () => {
      expect(
        formatJobSalary({
          salary: money(50000),
          salary_range: { start_salary: money(50000), end_salary: money(0) },
        }),
      ).toBe("From $50K/year");
    });

    it('renders a max-only range as "Up to"', () => {
      expect(
        formatJobSalary({
          salary: money(0),
          salary_range: { start_salary: money(0), end_salary: money(90000) },
        }),
      ).toBe("Up to $90K/year");
    });

    it("renders nothing when neither bound is set", () => {
      expect(
        formatJobSalary({
          salary: money(0),
          salary_range: { start_salary: money(0), end_salary: money(0) },
        }),
      ).toBeNull();
    });
  });
});
