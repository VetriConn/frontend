"use client";

import { useEffect, useState } from "react";
import { HiOutlineShieldCheck } from "react-icons/hi2";

export interface StepUpCreds {
  password: string;
  totp_code?: string;
  reason?: string;
}

interface StepUpDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  /** Show a required reason field (e.g. suspensions). */
  requireReason?: boolean;
  busy: boolean;
  danger?: boolean;
  onClose: () => void;
  onConfirm: (creds: StepUpCreds) => void;
}

/**
 * Re-authentication prompt for high-risk admin actions (ADM-5). The backend's
 * requireStepUp expects the admin's password and, if they have 2FA, a current
 * TOTP code — so we collect both here rather than letting the action 403.
 */
const StepUpDialog = ({
  open,
  title,
  description,
  confirmLabel,
  requireReason = false,
  busy,
  danger = false,
  onClose,
  onConfirm,
}: StepUpDialogProps) => {
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setTotp("");
      setReason("");
    }
  }, [open]);

  if (!open) return null;

  const reasonOk = !requireReason || reason.trim().length >= 3;
  const canSubmit = password.length > 0 && reasonOk && !busy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 flex items-center justify-center shrink-0">
            <HiOutlineShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          {requireReason && (
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">Reason</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Recorded in the audit log."
                className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">
              Your password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-700">
              Authentication code{" "}
              <span className="font-normal text-gray-400">(if 2FA is on)</span>
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
              placeholder="123456"
              autoComplete="one-time-code"
              className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 tracking-widest"
            />
          </label>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onConfirm({
                password,
                totp_code: totp.trim() || undefined,
                reason: requireReason ? reason.trim() : undefined,
              })
            }
            disabled={!canSubmit}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed ${
              danger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-primary hover:bg-primary-hover"
            }`}
          >
            {busy ? "Verifying…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepUpDialog;
