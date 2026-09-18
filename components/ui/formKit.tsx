"use client";

import React from "react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { regionsFor, hasRegions, regionLabelFor } from "@/lib/regions";
import { FIELD_BASE, fieldBorder, FIELD_LABEL, FIELD_ERROR } from "./fieldStyles";

/**
 * The richest field kit in the product: labels, selects, chips, toggles,
 * location fields, and the shared input classes. Extracted from
 * CreateJobPosting.tsx (#47), where it was private and every other surface
 * (HiringStep included) rebuilt or copied the pieces it needed.
 *
 * It then sat in components/pages/dashboard/postings/ for long enough that
 * nothing outside that folder ever found it, and the rest of the app went on
 * hand-writing labels it already had a component for. Living in components/ui
 * next to fieldStyles is the point: this is where a new form looks first.
 */

/**
 * The box, taken from fieldStyles rather than spelled out again.
 *
 * These two strings were a verbatim copy of FIELD_BASE made before
 * fieldStyles existed, and they had since drifted on three properties:
 * border-gray-200 against the shared gray-300, no transition, and
 * `focus:ring-primary`, the red focus ring fieldStyles removed on purpose
 * because it made every focused field look rejected. The builder kept it
 * only because nobody noticed the copy. Deriving from the token means the
 * next such decision reaches the job builder too.
 */
export const inputClasses = `${FIELD_BASE} ${fieldBorder(false)}`;

export const errorInputClasses = `${FIELD_BASE} ${fieldBorder(true)}`;

export function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={FIELD_LABEL}>
      {children}
      {required && <RequiredMark className="ml-0.5" />}
    </label>
  );
}

export function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 mt-1">{children}</p>;
}

/**
 * A themed select, adapting the shared CustomDropdown to the builder's
 * (field, value) change signature. Replaces every native <select> so the whole
 * builder shows one Vetriconn-styled menu instead of the OS dropdown.
 */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  required,
  error,
  helperText,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}) {
  return (
    <CustomDropdown
      name={id}
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      required={required}
      error={error}
      helperText={helperText}
      hideHeader
    />
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={FIELD_ERROR}>{message}</p>;
}

/**
 * A multi-select rendered as toggle chips — used for languages and benefits.
 * Each chip is a real toggle button (aria-pressed), sized to a 44px touch
 * target, and turns Vetriconn red when selected so it reads clearly at high
 * contrast and scaled text.
 */
export function ChipGroup({
  options,
  selected,
  onToggle,
  ariaLabel,
}: {
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isOn = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(opt.value)}
            className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isOn
                ? "border-primary bg-primary text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * An accessible labelled checkbox row — used for the yes/no eligibility and
 * inclusion flags. The whole row is the label so the tap target is generous.
 */
export function ToggleRow({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-primary/40"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
      />
      <span>
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-gray-600">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * The three fields LocationFields writes, which used to be `keyof
 * JobFormData`. That was fine while the kit lived under postings/, but from
 * components/ui it would have made every form in the app depend on the job
 * builder's form shape to render a country picker. The builder's own handlers
 * still satisfy it, since a handler that accepts any JobFormData key accepts
 * these three.
 */
export type LocationField = "country" | "state_province" | "city";

/**
 * Country → Province/State → City, in that order. The country drives the
 * middle field: a themed dropdown of that country's regions where we enumerate
 * them (Canada, US), or free text elsewhere — labelled correctly per country.
 * Shared by the full builder and the lite Essentials step so location behaves
 * identically in both.
 */
export function LocationFields({
  country,
  stateProvince,
  city,
  onChange,
  cityRequired = false,
  cityError,
}: {
  country: string;
  stateProvince: string;
  city: string;
  onChange: (field: LocationField, value: string) => void;
  cityRequired?: boolean;
  cityError?: string;
}) {
  const regionLabel = regionLabelFor(country);
  const changeCountry = (value: string) => {
    onChange("country", value);
    // The stored region code is country-specific, so a country change clears it.
    if (value !== country) onChange("state_province", "");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <CountrySelect
        value={country}
        onChange={changeCountry}
        label="Country"
        name="country"
      />

      {hasRegions(country) ? (
        <SelectField
          id="state_province"
          label={regionLabel}
          value={stateProvince}
          onChange={(v) => onChange("state_province", v)}
          options={regionsFor(country).map((r) => ({
            value: r.code,
            label: r.name,
          }))}
          placeholder={`Select ${regionLabel.toLowerCase()}`}
        />
      ) : (
        <div>
          <FieldLabel htmlFor="state_province">{regionLabel}</FieldLabel>
          <input
            id="state_province"
            type="text"
            value={stateProvince}
            onChange={(e) => onChange("state_province", e.target.value)}
            placeholder={`e.g. ${country === "Nigeria" ? "Lagos" : "Region"}`}
            className={inputClasses}
          />
        </div>
      )}

      <div>
        <FieldLabel htmlFor="city" required={cityRequired}>
          City
        </FieldLabel>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="e.g. Toronto"
          className={cityError ? errorInputClasses : inputClasses}
        />
        <FieldError message={cityError} />
      </div>
    </div>
  );
}
