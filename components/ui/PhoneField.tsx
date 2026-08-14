"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import PhoneInput, {
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

/**
 * Country-aware phone input, in two pieces:
 *
 *   PhoneInputControl — the bare control, for forms that render their own
 *                       label (CompanyProfileSetup, JobApplicationForm).
 *   PhoneField        — the control wrapped in the same label / helper /
 *                       error shell as `components/ui/FormField`.
 *
 * Value contract: the callback emits E.164 (`+15551234567`) or `""` when the
 * field is empty — never `undefined`, since every caller stores a `string`.
 * E.164 is what the backend already accepts (`z.string().max(30)`).
 *
 * The country picker is a custom dropdown rather than the library's native
 * `<select>`: a native select renders ~250 countries as an OS-drawn list
 * that ignores the design system and runs the height of the screen. This
 * one matches `components/ui/CustomDropdown`, caps its height, and adds a
 * search box, because 250 options without search is unusable.
 *
 * Flags are bundled rather than fetched from the library's default CDN, so
 * these forms make no third-party image requests.
 */

/** Platform is Canada-first; the picker still offers every country. */
export const DEFAULT_PHONE_COUNTRY = "CA" as const;

/** Box styling used when a caller doesn't supply its own. Mirrors FormField. */
const DEFAULT_BOX_CLASSES =
  "w-full rounded-10 border border-gray-300 bg-white px-3 py-2 md:px-4 md:py-3";

const MENU_WIDTH = 288;
const MENU_MAX_HEIGHT = 288;

/** A `+` followed by digits only — the shape PhoneInput accepts as `value`. */
const E164_PATTERN = /^\+\d+$/;

/**
 * Coerce a stored phone number into something PhoneInput will accept.
 *
 * Rows written before this field existed hold free-form text —
 * "(613) 555-0178", "613-555-0178", "6135550178". Handing those straight to
 * PhoneInput logs `Expected the initial value to be a E.164 phone number`
 * on every render and leaves the field blank, so parse them first.
 *
 * Values that are already E.164-shaped pass through untouched even when
 * incomplete, so a half-typed number stays editable instead of vanishing.
 * Unparseable text yields undefined — an empty field the user can refill.
 *
 * This only affects display. The parent's stored value is left alone rather
 * than silently rewritten on mount, which would mark clean forms dirty.
 */
export function toE164(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (E164_PATTERN.test(trimmed)) return trimmed;

  try {
    return parsePhoneNumber(trimmed, DEFAULT_PHONE_COUNTRY)?.number;
  } catch {
    return undefined;
  }
}

type CountryOption = {
  value?: string;
  label: string;
  divider?: boolean;
};

interface CountrySelectProps {
  value?: string;
  onChange: (value?: string) => void;
  options: CountryOption[];
  iconComponent?: React.ComponentType<{ country?: string; label?: string }>;
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * Custom replacement for the library's native country `<select>`.
 *
 * Renders a compact flag trigger; the menu is portalled to `document.body`
 * so it escapes the dialog/card overflow contexts these forms live in.
 */
const CountrySelect = ({
  value,
  onChange,
  options,
  iconComponent: IconComponent,
  disabled,
  "aria-label": ariaLabel = "Country",
}: CountrySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Dividers are presentational; a country without a value is the library's
  // "International" entry, which the search list has no use for.
  const selectable = useMemo(
    () => options.filter((option) => !option.divider && option.value),
    [options],
  );

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return selectable;
    return selectable.filter((option) =>
      option.label.toLowerCase().includes(trimmed),
    );
  }, [selectable, query]);

  const selectedLabel = selectable.find((o) => o.value === value)?.label;

  const updateCoords = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < MENU_MAX_HEIGHT && rect.top > spaceBelow;

    setCoords({
      top: openUpward
        ? rect.top + window.scrollY - MENU_MAX_HEIGHT - 8
        : rect.bottom + window.scrollY + 8,
      left: Math.max(
        8,
        Math.min(
          rect.left + window.scrollX,
          window.innerWidth - MENU_WIDTH - 8,
        ),
      ),
      openUpward,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();
    searchRef.current?.focus();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  // Reset the filter each time the menu closes so it reopens clean.
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const handleSelect = (next?: string) => {
    onChange(next);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const menu = isOpen && (
    <div
      ref={menuRef}
      className="absolute z-[9999] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        width: MENU_WIDTH,
      }}
    >
      <div className="border-b border-gray-100 p-2">
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search countries"
          aria-label="Search countries"
          className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div
        role="listbox"
        aria-label={ariaLabel}
        className="overflow-y-auto"
        style={{ maxHeight: MENU_MAX_HEIGHT - 52 }}
      >
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-gray-400">
            No countries found
          </p>
        ) : (
          filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
              className={clsx(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                option.value === value
                  ? "bg-red-50 text-primary font-medium"
                  : "text-gray-700",
              )}
            >
              {IconComponent && (
                <span className="w-5 shrink-0">
                  <IconComponent country={option.value} label={option.label} />
                </span>
              )}
              <span className="truncate">{option.label}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={selectedLabel}
        className={clsx(
          "flex shrink-0 items-center gap-1 rounded-md px-1 py-1 transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-primary",
          disabled ? "cursor-not-allowed opacity-60" : "hover:bg-gray-100",
        )}
      >
        {IconComponent && (
          <span className="w-6 shrink-0">
            <IconComponent country={value} label={selectedLabel} />
          </span>
        )}
        <ChevronIcon
          className={clsx(
            "h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {typeof document !== "undefined" && createPortal(menu, document.body)}
    </>
  );
};

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export interface PhoneInputControlProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Draws the error border without owning the message. */
  invalid?: boolean;
  describedBy?: string;
  /** Replaces the default box styling so the control matches its host form. */
  className?: string;
  /** Accessible name for the country dropdown. */
  countryLabel?: string;
}

export const PhoneInputControl = ({
  id,
  name,
  value,
  onChange,
  disabled = false,
  placeholder,
  invalid = false,
  describedBy,
  className,
  countryLabel = "Country",
}: PhoneInputControlProps) => {
  // Border and focus ring live on the wrapper so the country picker and the
  // number input read as a single control.
  const wrapperClasses = clsx(
    "flex items-center gap-2 transition-colors",
    "focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent",
    className ?? DEFAULT_BOX_CLASSES,
    invalid && "border-red-500",
    disabled && "bg-gray-100 cursor-not-allowed",
  );

  return (
    <PhoneInput
      id={id}
      name={name}
      flags={flags}
      international
      countryCallingCodeEditable={false}
      defaultCountry={DEFAULT_PHONE_COUNTRY}
      value={toE164(value)}
      onChange={(next) => onChange(next ?? "")}
      disabled={disabled}
      placeholder={placeholder}
      className={wrapperClasses}
      countrySelectComponent={CountrySelect}
      numberInputProps={{
        className:
          "w-full border-none bg-transparent p-0 text-sm md:text-base outline-none disabled:cursor-not-allowed",
        "aria-describedby": describedBy,
        "aria-invalid": invalid,
      }}
      countrySelectProps={{ "aria-label": countryLabel }}
    />
  );
};

export interface PhoneFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const PhoneField = ({
  label,
  name,
  value,
  onChange,
  helperText,
  error,
  required = false,
  optional = false,
  disabled = false,
  placeholder,
}: PhoneFieldProps) => {
  const inputId = `field-${name}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label
        htmlFor={inputId}
        className="block text-sm text-text-muted mb-1.5 md:mb-2 font-medium"
      >
        {label}
        {optional && (
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        )}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <PhoneInputControl
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        invalid={!!error}
        describedBy={[helperId, errorId].filter(Boolean).join(" ") || undefined}
        countryLabel={`${label} country`}
      />

      {helperText && !error && (
        <p id={helperId} className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-xs text-red-500 mt-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Validate a phone number for form submission.
 *
 * Returns an error message, or undefined when acceptable. Optional fields
 * accept empty; required fields do not. Anything non-empty must be a real,
 * dialable number per libphonenumber's metadata rather than a digit-count
 * heuristic.
 */
export function validatePhone(
  value: string,
  { required = false }: { required?: boolean } = {},
): string | undefined {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return required ? "Phone number is required" : undefined;
  }

  if (!isValidPhoneNumber(trimmed)) {
    return "Please enter a valid phone number";
  }

  return undefined;
}

export default PhoneField;
