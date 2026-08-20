/**
 * Countries and their first-level regions.
 *
 * Deliberately not a full ISO dataset. Vetriconn is a Canadian job board, so
 * Canada and the United States are enumerated properly and everything else
 * falls back to a free-text region — which is the honest behaviour anyway,
 * since "province or state" does not mean the same thing everywhere.
 */

export interface Region {
  /** The stored value: an ISO 3166-2 subdivision code. */
  code: string;
  name: string;
}

export const CANADA = "Canada";
export const UNITED_STATES = "United States";

/** Ordered for a Canadian audience: home first, then the nearest neighbour. */
export const COUNTRIES: string[] = [
  CANADA,
  UNITED_STATES,
  "United Kingdom",
  "Australia",
  "New Zealand",
  "Ireland",
  "India",
  "Philippines",
  "Nigeria",
  "South Africa",
  "Germany",
  "France",
  "Netherlands",
  "Other",
];

const CANADIAN_REGIONS: Region[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

const US_REGIONS: Region[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const REGIONS_BY_COUNTRY: Record<string, Region[]> = {
  [CANADA]: CANADIAN_REGIONS,
  [UNITED_STATES]: US_REGIONS,
};

/** Regions for a country, or an empty list where we do not enumerate them. */
export const regionsFor = (country: string | undefined): Region[] =>
  (country && REGIONS_BY_COUNTRY[country]) || [];

/** Whether the region field should be a dropdown rather than free text. */
export const hasRegions = (country: string | undefined): boolean =>
  regionsFor(country).length > 0;

/** What to call the region in this country. */
export const regionLabelFor = (country: string | undefined): string => {
  if (country === UNITED_STATES) return "State";
  if (country === CANADA) return "Province";
  return "Province or state";
};

/** Display name for a stored code, falling back to the raw value. */
export const regionName = (
  country: string | undefined,
  code: string | undefined,
): string => {
  if (!code) return "";
  return regionsFor(country).find((r) => r.code === code)?.name ?? code;
};
