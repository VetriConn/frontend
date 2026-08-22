/**
 * The full country list, from react-phone-number-input (already a dependency
 * for the phone field) rather than the short hand-kept list the profile form
 * used to carry. The stored value stays the English name, so the region logic
 * and the dashboard greeting — both keyed on names like "Canada" — keep
 * working unchanged.
 */
import { getCountries } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";

export interface CountryOption {
  /** ISO 3166-1 alpha-2, for the flag lookup. */
  code: string;
  /** English name; also the stored value. */
  name: string;
}

const labels = en as Record<string, string>;

// Home market first for a Canadian board, then everyone else alphabetically.
const PINNED = ["CA", "US", "GB"];

export const COUNTRY_OPTIONS: CountryOption[] = (() => {
  const all: CountryOption[] = getCountries().map((code) => ({
    code,
    name: labels[code] ?? code,
  }));
  const pinned = PINNED.map((code) =>
    all.find((c) => c.code === code),
  ).filter((c): c is CountryOption => Boolean(c));
  const rest = all
    .filter((c) => !PINNED.includes(c.code))
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...pinned, ...rest];
})();
