"use client";

import dynamic from "next/dynamic";
import type { validatePhone as validatePhoneSync } from "./PhoneField";

/**
 * Lazy facade over PhoneField: react-phone-number-input + libphonenumber
 * metadata is the heaviest shared UI dependency, and a static import put a
 * full copy of it in every form's route chunk. Importing from this module
 * instead gives all forms one shared async chunk.
 */

export const PhoneField = dynamic(
  () => import("./PhoneField").then((m) => m.PhoneField),
  {
    // Placeholder mirrors PhoneField's rendered height (label + input) so
    // the form doesn't shift when the chunk lands.
    loading: () => <div className="mb-4 h-[74px] md:h-[86px]" />,
    ssr: false,
  },
);

export const PhoneInputControl = dynamic(
  () => import("./PhoneField").then((m) => m.PhoneInputControl),
  {
    loading: () => <div className="h-[38px] md:h-[50px]" />,
    ssr: false,
  },
);

// The validator rides in the same chunk. It is kicked off at module load, so
// by the time a phone value exists to validate (typed into the lazily
// rendered field above) the real implementation is in place. Until then only
// the dependency-free required-empty check runs — the format check re-fires
// on the next change/submit once loaded. A failed chunk load (flaky network,
// deploy mid-session) clears the in-flight marker so the next validate call
// retries instead of leaving format validation off for the page's lifetime.
let impl: typeof validatePhoneSync | null = null;
let loading: Promise<void> | null = null;

function loadValidator(): void {
  if (impl || loading) return;
  loading = import("./PhoneField").then(
    (m) => {
      impl = m.validatePhone;
    },
    () => {
      loading = null;
    },
  );
}
loadValidator();

export const validatePhone: typeof validatePhoneSync = (value, opts) => {
  if (impl) return impl(value, opts);
  loadValidator();
  const trimmed = value?.trim() ?? "";
  if (!trimmed && opts?.required) return "Phone number is required";
  return undefined;
};
