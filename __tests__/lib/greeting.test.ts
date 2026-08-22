/**
 * Tests for the dashboard greeting — time bands, locale-specific options, the
 * generic fallback when no country is set, and deterministic selection.
 */
import {
  timeBand,
  greetingOptions,
  pickGreeting,
} from "@/lib/greeting";

const at = (hour: number) => new Date(2026, 7, 22, hour, 0, 0);

describe("timeBand", () => {
  it("splits the day into morning / afternoon / evening", () => {
    expect(timeBand(at(8))).toBe("morning");
    expect(timeBand(at(13))).toBe("afternoon");
    expect(timeBand(at(20))).toBe("evening");
  });
});

describe("greetingOptions", () => {
  it("uses the plain greeting when no country is set", () => {
    expect(greetingOptions("Adele Wisdom", undefined, at(9))).toEqual([
      "Greetings, Adele",
    ]);
  });

  it("drops the name gracefully when it is missing", () => {
    expect(greetingOptions("", undefined, at(9))).toEqual(["Greetings"]);
  });

  it("offers Canadian morning greetings, first name only", () => {
    const opts = greetingOptions("Adele Wisdom", "Canada", at(9));
    expect(opts).toContain("Good morning, Adele");
    expect(opts).toContain("Bonjour, Adele");
  });

  it("offers Nigerian greetings including 'Well done'", () => {
    const opts = greetingOptions("Chidi Okafor", "Nigeria", at(14));
    expect(opts).toContain("Well done, Chidi");
  });

  it("recognizes country codes and full names alike", () => {
    expect(greetingOptions("Sam", "US", at(19))).toContain("Good evening, Sam");
    expect(greetingOptions("Sam", "United Kingdom", at(19))).toContain(
      "Good evening, Sam",
    );
  });
});

describe("pickGreeting", () => {
  it("chooses deterministically from the candidates", () => {
    // rand=0 → first option
    expect(pickGreeting("Adele", "Canada", at(9), () => 0)).toBe(
      "Good morning, Adele",
    );
  });
});
