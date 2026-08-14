/**
 * Unit Tests for date formatting helpers
 *
 * Time-sensitive assertions run against a frozen clock so the relative-time
 * buckets ("Just now" / "5m ago" / "3h ago" / "2d ago") are deterministic.
 * Locale-dependent output is compared against the same Intl call rather than
 * a hard-coded string, so these pass under any TZ/locale.
 */

import {
  formatRelativeTime,
  formatTime,
  formatFullDateTime,
  formatDate,
} from "@/lib/date-utils";

const NOW = new Date("2026-05-11T12:00:00.000Z");

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** A Date that is `ms` milliseconds before the frozen "now". */
const ago = (ms: number) => new Date(NOW.getTime() - ms);

describe("date-utils", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("formatRelativeTime", () => {
    it("should return 'Recently' for undefined", () => {
      expect(formatRelativeTime(undefined)).toBe("Recently");
    });

    it("should return 'Recently' for an empty string", () => {
      expect(formatRelativeTime("")).toBe("Recently");
    });

    it("should return 'Recently' for an unparseable date", () => {
      expect(formatRelativeTime("not-a-date")).toBe("Recently");
    });

    it("should return 'Just now' for the current instant", () => {
      expect(formatRelativeTime(NOW)).toBe("Just now");
    });

    it("should return 'Just now' just under one minute", () => {
      expect(formatRelativeTime(ago(59 * 1000))).toBe("Just now");
    });

    it("should switch to minutes exactly at one minute", () => {
      expect(formatRelativeTime(ago(MINUTE))).toBe("1m ago");
    });

    it("should report minutes below one hour", () => {
      expect(formatRelativeTime(ago(45 * MINUTE))).toBe("45m ago");
    });

    it("should switch to hours exactly at one hour", () => {
      expect(formatRelativeTime(ago(HOUR))).toBe("1h ago");
    });

    it("should report hours below one day", () => {
      expect(formatRelativeTime(ago(23 * HOUR))).toBe("23h ago");
    });

    it("should switch to days exactly at one day", () => {
      expect(formatRelativeTime(ago(DAY))).toBe("1d ago");
    });

    it("should report days below one week", () => {
      expect(formatRelativeTime(ago(6 * DAY))).toBe("6d ago");
    });

    it("should fall back to a locale date at one week and older", () => {
      const oneWeekAgo = ago(7 * DAY);
      expect(formatRelativeTime(oneWeekAgo)).toBe(
        oneWeekAgo.toLocaleDateString(),
      );
    });

    it("should fall back to a locale date for much older dates", () => {
      const old = new Date("2020-01-15T08:30:00.000Z");
      expect(formatRelativeTime(old)).toBe(old.toLocaleDateString());
    });

    it("should accept an ISO string as well as a Date", () => {
      expect(formatRelativeTime(ago(5 * MINUTE).toISOString())).toBe("5m ago");
    });

    it("should treat future dates as 'Just now'", () => {
      const future = new Date(NOW.getTime() + HOUR);
      expect(formatRelativeTime(future)).toBe("Just now");
    });
  });

  describe("formatTime", () => {
    it("should return an empty string for undefined", () => {
      expect(formatTime(undefined)).toBe("");
    });

    it("should return an empty string for an invalid date", () => {
      expect(formatTime("nonsense")).toBe("");
    });

    it("should format a valid date as a locale time", () => {
      const date = new Date("2026-05-11T15:45:00.000Z");
      expect(formatTime(date)).toBe(
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    });

    it("should accept an ISO string", () => {
      const iso = "2026-05-11T15:45:00.000Z";
      expect(formatTime(iso)).toBe(formatTime(new Date(iso)));
    });
  });

  describe("formatFullDateTime", () => {
    it("should return 'Recently' for undefined", () => {
      expect(formatFullDateTime(undefined)).toBe("Recently");
    });

    it("should return 'Recently' for an invalid date", () => {
      expect(formatFullDateTime("nope")).toBe("Recently");
    });

    it("should format a valid date as a full locale string", () => {
      const date = new Date("2026-05-11T15:45:00.000Z");
      expect(formatFullDateTime(date)).toBe(date.toLocaleString());
    });
  });

  describe("formatDate", () => {
    it("should return an em-dash placeholder for undefined", () => {
      expect(formatDate(undefined)).toBe("—");
    });

    it("should return an em-dash placeholder for an empty string", () => {
      expect(formatDate("")).toBe("—");
    });

    it("should return an em-dash placeholder for an invalid date", () => {
      expect(formatDate("2026-13-45")).toBe("—");
    });

    it("should format a valid date as a locale date", () => {
      const date = new Date("2026-05-11T15:45:00.000Z");
      expect(formatDate(date)).toBe(date.toLocaleDateString());
    });

    it("should accept an ISO string", () => {
      const iso = "2026-05-11T15:45:00.000Z";
      expect(formatDate(iso)).toBe(new Date(iso).toLocaleDateString());
    });
  });
});
