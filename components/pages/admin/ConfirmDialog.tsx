"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

type Tone = "danger" | "neutral";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  subject?: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: Tone;
  /** When set, requires the admin to enter a reason >= minReasonLength chars. */
  reasonLabel?: string;
  reasonPlaceholder?: string;
  minReasonLength?: number;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export const ConfirmDialog = ({
  open,
  title,
  subject,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  reasonLabel,
  reasonPlaceholder,
  minReasonLength = 5,
  busy = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  const requiresReason = !!reasonLabel;
  const reasonValid =
    !requiresReason || reason.trim().length >= minReasonLength;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
          <div
            className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1",
              tone === "danger"
                ? "bg-rose-50 text-rose-600 ring-rose-100"
                : "bg-gray-50 text-gray-600 ring-gray-100",
            )}
          >
            <HiOutlineExclamationTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3
              id="confirm-dialog-title"
              className="text-base font-semibold text-gray-900"
            >
              {title}
            </h3>
            {subject && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{subject}</p>
            )}
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          {requiresReason && (
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">
                {reasonLabel}
              </span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder={reasonPlaceholder}
                className="mt-1.5 w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </label>
          )}
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() =>
              onConfirm(requiresReason ? reason.trim() : undefined)
            }
            disabled={busy || !reasonValid}
            className={clsx(
              "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              tone === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-primary hover:bg-primary-hover",
            )}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
