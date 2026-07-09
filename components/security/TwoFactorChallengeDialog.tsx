"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiOutlineShieldCheck,
  HiOutlineXMark,
  HiOutlineKey,
  HiOutlineDevicePhoneMobile,
} from "react-icons/hi2";
import { challengeTwoFactor, challengeTwoFactorRecovery } from "@/lib/api/two-factor";

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
  const [isRecovery, setIsRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state on open/close or mode switch
  useEffect(() => {
    if (open) {
      setCode("");
      setError("");
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, isRecovery]);

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

    const cleanCode = code.trim();
    if (isRecovery) {
      if (!/^[A-Z0-9-]{8,}$/i.test(cleanCode)) {
        setError("Please enter a valid recovery code (minimum 8 characters).");
        return;
      }
    } else {
      if (!/^\d{6}$/.test(cleanCode)) {
        setError("Please enter a valid 6-digit authentication code.");
        return;
      }
    }

    setBusy(true);
    try {
      void partialSessionToken;
      if (isRecovery) {
        await challengeTwoFactorRecovery(cleanCode);
      } else {
        await challengeTwoFactor(cleanCode);
      }
      onVerified();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.",
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !busy && onClose()}
      />

      {/* Dialog container */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-50 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-sm border border-red-100">
            {isRecovery ? (
              <HiOutlineKey className="w-5 h-5 animate-pulse" />
            ) : (
              <HiOutlineShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="2fa-challenge-title"
              className="text-lg font-bold text-gray-900 leading-snug"
            >
              {isRecovery ? "Enter recovery code" : "Two-factor verification"}
            </h2>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {emailHint ? `Signing in as ${emailHint}` : "Secure account access"}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isRecovery ? "Backup Recovery Code" : "Authentication Code"}
            </label>
            
            {isRecovery ? (
              <input
                ref={inputRef}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="XXXX-XXXX-XXXX"
                className="w-full text-center text-lg tracking-widest font-mono px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all placeholder:text-gray-300"
              />
            ) : (
              <input
                ref={inputRef}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                className="w-full text-center text-3xl tracking-[0.3em] font-mono px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all placeholder:text-gray-300 placeholder:tracking-normal"
              />
            )}
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50/50 border border-red-100 rounded-lg px-3.5 py-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-gray-500 leading-relaxed">
            {isRecovery
              ? "Enter one of the 10 backup codes generated during 2FA setup. Each recovery code can only be used once."
              : "Open the authenticator app on your mobile device to view your temporary 6-digit verification code."}
          </p>
        </div>

        {/* Footer & Toggles */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setIsRecovery(!isRecovery);
              setError("");
            }}
            className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1.5"
          >
            {isRecovery ? (
              <>
                <HiOutlineDevicePhoneMobile className="w-4 h-4" />
                Use authenticator app
              </>
            ) : (
              <>
                <HiOutlineKey className="w-4 h-4" />
                Use a recovery code
              </>
            )}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={busy || code.length === 0}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {busy ? "Verifying…" : "Verify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorChallengeDialog;
