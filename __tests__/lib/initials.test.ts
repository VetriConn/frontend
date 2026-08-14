/**
 * Unit Tests for getInitials
 * Covers name splitting, the 2-initial cap, and fallback behaviour.
 */

import { getInitials } from "@/lib/initials";

describe("getInitials", () => {
  it("should return both initials for a two-part name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("should return a single initial for a one-part name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("should cap at the first two parts for longer names", () => {
    expect(getInitials("John Ronald Reuel Tolkien")).toBe("JR");
  });

  it("should uppercase lowercase input", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("should collapse repeated whitespace between parts", () => {
    expect(getInitials("John    Doe")).toBe("JD");
  });

  it("should ignore leading and trailing whitespace", () => {
    expect(getInitials("  John Doe  ")).toBe("JD");
  });

  it("should return the default fallback for an empty string", () => {
    expect(getInitials("")).toBe("U");
  });

  it("should return the default fallback for a whitespace-only string", () => {
    expect(getInitials("   ")).toBe("U");
  });

  it("should return a custom fallback when provided", () => {
    expect(getInitials("", "?")).toBe("?");
  });

  it("should not use the fallback when at least one part exists", () => {
    expect(getInitials("Ada", "?")).toBe("A");
  });

  it("should handle non-letter first characters", () => {
    expect(getInitials("7-Eleven Corp")).toBe("7C");
  });

  it("should handle tab and newline separators", () => {
    expect(getInitials("John\tDoe")).toBe("JD");
    expect(getInitials("John\nDoe")).toBe("JD");
  });
});
