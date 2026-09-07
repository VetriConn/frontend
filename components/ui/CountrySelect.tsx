"use client";

import React from "react";
import { CustomDropdown } from "./CustomDropdown";
import { COUNTRY_OPTIONS } from "@/lib/countries";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  name?: string;
  required?: boolean;
  error?: string;
}

/**
 * The country field: the full country list with flags and a type-to-filter
 * search, on top of the shared dropdown. The dropdown's big red placeholder
 * header is hidden here — with the field label above and a search box inside,
 * it was only noise.
 */
export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  label = "Country",
  name = "country",
  required = false,
  error,
}) => {
  // Flags are static assets (public/flags, see scripts/copy-flags.mjs), not
  // bundled components — the browser only fetches the few actually scrolled
  // into view. Decorative next to the visible name, hence the empty alt.
  const options = COUNTRY_OPTIONS.map(({ code, name: countryName }) => ({
    value: countryName,
    searchText: countryName,
    label: (
      <span className="flex items-center gap-2.5">
        <span className="inline-block w-5 shrink-0 overflow-hidden rounded-[2px] leading-none">
          <img
            src={`/flags/${code}.svg`}
            alt=""
            loading="lazy"
            className="block h-auto w-full"
          />
        </span>
        <span>{countryName}</span>
      </span>
    ),
  }));

  return (
    <CustomDropdown
      label={label}
      name={name}
      placeholder="Select your country"
      value={value}
      onChange={onChange}
      options={options}
      required={required}
      error={error}
      hideHeader
    />
  );
};

export default CountrySelect;
