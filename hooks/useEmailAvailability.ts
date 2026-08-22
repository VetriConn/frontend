"use client";

import { useEffect, useState } from "react";
import { checkEmailAvailable } from "@/lib/api/auth";

export type EmailAvailability = "idle" | "checking" | "available" | "taken";

// A plausible-address gate, matching the server's — no lookup for input that
// isn't an email yet, so we don't probe on every keystroke of "a@b".
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Debounced "is this email already registered?" for the signup form. Returns a
 * status the field can render and the wizard can gate Continue on. Never
 * throws and never lands on "taken" from an error — the backend's duplicate
 * rejection is the real guarantee; this is the friendly heads-up.
 */
export function useEmailAvailability(
  email: string,
  debounceMs = 500,
): EmailAvailability {
  const [status, setStatus] = useState<EmailAvailability>("idle");

  useEffect(() => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    let cancelled = false;
    const timer = setTimeout(async () => {
      const available = await checkEmailAvailable(trimmed);
      if (!cancelled) setStatus(available ? "available" : "taken");
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email, debounceMs]);

  return status;
}
