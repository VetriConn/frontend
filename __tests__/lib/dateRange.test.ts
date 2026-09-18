/**
 * formatRange, which education and work history both use.
 *
 * Worth pinning because the four branches read as obvious and are not: two
 * separate copies of them existed, and "no start but an end" is the one
 * everybody forgets.
 */
import { formatRange } from "@/lib/date-utils";

describe("formatRange", () => {
  it("joins a start and an end with the word to", () => {
    expect(formatRange("2019", "2023")).toBe("2019 to 2023");
  });

  it("says Present when there is no end", () => {
    expect(formatRange("2019")).toBe("2019 to Present");
  });

  it("returns the end alone when there is no start", () => {
    expect(formatRange(undefined, "2023")).toBe("2023");
  });

  it("returns an empty string when there is neither", () => {
    expect(formatRange()).toBe("");
  });

  it("uses no dash, which a screen reader would read as nothing", () => {
    expect(formatRange("2019", "2023")).not.toMatch(/[-–—]/);
  });
});
