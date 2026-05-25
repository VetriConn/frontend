"use client";

import { useEffect, useState } from "react";
import {
  HiOutlineShieldExclamation,
  HiOutlineXMark,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { disableTwoFactor } from "@/lib/api/two-factor";
import { useToaster } from "@/components/ui/Toaster";

interface DisableTwoFactorDialogProps {
  open: boolean;
  onClose: () => void;
  onDisabled: () => void;
}

const DisableTwoFactorDialog = ({
  open,
  onClose,
  onDisabled,
}: DisableTwoFactorDialogProps) => {
  const { showToast } = useToaster();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setShowPassword(false);
      setBusy(false);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (busy) return;
    if (!password) {
      setError("Enter your password to continue.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await disableTwoFactor(password);
      onDisabled();
      showToast({
        type: "success",
        title: "Two-step verification turned off",
        description: "Re-enable it any time from settings.",
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not disable two-step verification.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => !busy && onClose()}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100 flex items-center justify-center shrink-0">
            <HiOutlineShieldExclamation className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900">
              Turn off two-step verification?
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              You&apos;ll only need your password to sign in.
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
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3.5 text-sm text-amber-900">
            Removing two-step verification weakens your account security. Only
            do this if you understand the risk.
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">
              Confirm your password
            </span>
            <div className="mt-1.5 relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700"
              >
                {showPassword ? (
                  <HiOutlineEyeSlash className="w-4 h-4" />
                ) : (
                  <HiOutlineEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </label>
          {error && <p className="text-xs text-rose-600">{error}</p>}
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
            onClick={handleConfirm}
            disabled={busy || password.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Turning off…" : "Turn off two-step"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisableTwoFactorDialog;
