"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiOutlineShieldCheck,
  HiOutlineXMark,
} from "react-icons/hi2";
import { challengeTwoFactor } from "@/lib/api/two-factor";

interface TwoFactorChallengeDialogProps {
  open: boolean;
  /** Identifier the user is signing in with — shown in the header for context. */
  emailHint?: string;
  /** Sent back with the code (no-op in the mock — backend will validate). */
  partialSessionToken?: string;
  onClose: () => void;
  onVerified: () => void;
}

const TwoFactorChallengeDialog = ({
  open,
  emailHint,
  partialSessionToken,
  onClose,
  onVerified,
}: TwoFactorChallengeDialogProps) => {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setCode("");
      setError("");
      setBusy(false);
      // Tiny delay so the focus call lands after the modal is in the DOM.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const handleVerify = async () => {
    if (busy) return;
    setError("");
    if (!/^\d{6}$/.test(code) && !/^[A-Z0-9-]{8,}$/i.test(code)) {
      setError("Enter the 6-digit code or a recovery code.");
      return;
    }
    setBusy(true);
    try {
      // The mock client ignores the partial token; real backend uses it.
      // We pass it via header in the future apiFetch call, but for now
      // the call signature only needs the code.
      void partialSessionToken;
      await challengeTwoFactor(code);
      onVerified();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Code didn't match. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="2fa-challenge-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => !busy && onClose()}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 flex items-center justify-center shrink-0">
            <HiOutlineShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="2fa-challenge-title"
              className="text-base font-semibold text-gray-900"
            >
              Enter your 2FA code
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {emailHint
                ? `Signing in as ${emailHint}`
                : "From your authenticator app"}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 md:px-6 py-5 space-y-3">
          <input
            ref={inputRef}
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value
                  .replace(/[^A-Za-z0-9-]/g, "")
                  .toUpperCase()
                  .slice(0, 16),
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") handleVerify();
            }}
            inputMode="text"
            autoComplete="one-time-code"
            placeholder="123 456 or recovery code"
            className="w-full text-center text-xl tracking-[0.4em] font-mono px-3.5 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <p className="text-[11px] text-gray-500">
            Lost your authenticator? Use any one of the recovery codes you
            saved during setup. Each code works once.
          </p>
        </div>

        <div className="px-5 md:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={busy || code.length === 0}
            className="inline-flex items-center gap-2 bg-primary text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Verifying…" : "Verify and continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorChallengeDialog;
