/**
 * A warm, localized greeting for the dashboard heading.
 *
 * Rotates so the same person sees a different one across visits, and leans on
 * greetings common where they are — Canada, the US, the UK, or Nigeria. With
 * no country set it stays with the plain "Greetings, {name}" rather than
 * guessing a locale.
 */

type Region = "CA" | "US" | "UK" | "NG";
type Band = "morning" | "afternoon" | "evening";

function firstNameOf(fullName: string | undefined): string {
  return (fullName ?? "").trim().split(/\s+/)[0] ?? "";
}

function regionOf(country: string | undefined): Region | null {
  const c = (country ?? "").trim().toLowerCase();
  if (!c) return null;
  if (c === "ca" || c.includes("canada")) return "CA";
  if (
    c === "us" ||
    c === "usa" ||
    c.includes("united states") ||
    c.includes("america")
  ) {
    return "US";
  }
  if (
    c === "uk" ||
    c === "gb" ||
    c.includes("united kingdom") ||
    c.includes("britain") ||
    c.includes("england") ||
    c.includes("scotland") ||
    c.includes("wales")
  ) {
    return "UK";
  }
  if (c === "ng" || c.includes("nigeria")) return "NG";
  return null;
}

export function timeBand(now: Date): Band {
  const h = now.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// Base greetings per region and time band; the first name is appended when set.
const GREETINGS: Record<Region, Record<Band, string[]>> = {
  CA: {
    morning: ["Good morning", "Morning", "Bonjour"],
    afternoon: ["Good afternoon", "Bonjour"],
    evening: ["Good evening", "Bonsoir"],
  },
  US: {
    morning: ["Good morning", "Morning", "Rise and shine"],
    afternoon: ["Good afternoon", "Howdy"],
    evening: ["Good evening", "Evening"],
  },
  UK: {
    morning: ["Good morning", "Morning"],
    afternoon: ["Good afternoon", "Afternoon"],
    evening: ["Good evening", "Evening"],
  },
  NG: {
    morning: ["Good morning", "Well done", "Morning o"],
    afternoon: ["Good afternoon", "Well done"],
    evening: ["Good evening", "Well done", "Good evening o"],
  },
};

/** The candidate greetings for a person, before one is chosen. */
export function greetingOptions(
  fullName: string | undefined,
  country: string | undefined,
  now: Date,
): string[] {
  const name = firstNameOf(fullName);
  const region = regionOf(country);

  if (!region) {
    return [name ? `Greetings, ${name}` : "Greetings"];
  }

  return GREETINGS[region][timeBand(now)].map((base) =>
    name ? `${base}, ${name}` : base,
  );
}

/** One greeting, chosen at random from the candidates for this visit. */
export function pickGreeting(
  fullName: string | undefined,
  country: string | undefined,
  now: Date = new Date(),
  rand: () => number = Math.random,
): string {
  const options = greetingOptions(fullName, country, now);
  return options[Math.floor(rand() * options.length)] ?? options[0];
}
