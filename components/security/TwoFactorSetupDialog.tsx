"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineShieldCheck,
  HiOutlineXMark,
  HiOutlineClipboardDocument,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowLeft,
} from "react-icons/hi2";
import {
  startTwoFactorSetup,
  verifyTwoFactorSetup,
  type TwoFactorSetupResponse,
} from "@/lib/api/two-factor";
import { useToaster } from "@/components/ui/Toaster";

type Step = "loading" | "scan" | "verify" | "recovery" | "done";

interface TwoFactorSetupDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called when the user completes enrollment. */
  onEnrolled: () => void;
}

const COPY_LABEL_DEFAULT = "Copy";
const COPY_LABEL_DONE = "Copied";

const TwoFactorSetupDialog = ({
  open,
  onClose,
  onEnrolled,
}: TwoFactorSetupDialogProps) => {
  const { showToast } = useToaster();

  const [step, setStep] = useState<Step>("loading");
  const [setup, setSetup] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copyLabel, setCopyLabel] = useState(COPY_LABEL_DEFAULT);
  const [recoveryCopied, setRecoveryCopied] = useState(false);
  const [setupLoadError, setSetupLoadError] = useState<string | null>(null);

  // Reset on open / close
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStep("loading");
    setSetup(null);
    setCode("");
    setVerifyError("");
    setCopyLabel(COPY_LABEL_DEFAULT);
    setRecoveryCopied(false);
    setSetupLoadError(null);
    setBusy(false);

    startTwoFactorSetup()
      .then((data) => {
        if (cancelled) return;
        setSetup(data);
        setStep("scan");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setSetupLoadError(err.message || "Could not start setup.");
      });

    return () => {
      cancelled = true;
    };
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

  // Close on Escape (only when nothing critical is busy and we're not on the
  // recovery-codes step — that step explicitly requires acknowledgement).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (busy) return;
      if (step === "recovery") return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, step, onClose]);

  const recoveryCodesText = useMemo(
    () => (setup ? setup.recoveryCodes.join("\n") : ""),
    [setup],
  );

  const handleCopySecret = async () => {
    if (!setup) return;
    try {
      await navigator.clipboard.writeText(setup.secret);
      setCopyLabel(COPY_LABEL_DONE);
      setTimeout(() => setCopyLabel(COPY_LABEL_DEFAULT), 1500);
    } catch {
      showToast({ type: "error", title: "Couldn't copy to clipboard" });
    }
  };

  const handleCopyRecoveryCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodesText);
      setRecoveryCopied(true);
      setTimeout(() => setRecoveryCopied(false), 1500);
    } catch {
      showToast({ type: "error", title: "Couldn't copy to clipboard" });
    }
  };

  const handleDownloadCodes = () => {
    if (!setup) return;
    const blob = new Blob([recoveryCodesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vetriconn-recovery-codes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVerify = async () => {
    if (busy) return;
    setVerifyError("");
    if (!/^\d{6}$/.test(code)) {
      setVerifyError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    try {
      const recoveryCodes = await verifyTwoFactorSetup(code);
      setSetup((prev) => prev ? { ...prev, recoveryCodes } : null);
      setStep("recovery");
    } catch (err) {
      setVerifyError(
        err instanceof Error ? err.message : "Verification failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleFinish = () => {
    setStep("done");
    onEnrolled();
    showToast({
      type: "success",
      title: "Two-step verification on",
      description: "You'll be asked for a code next time you sign in.",
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="2fa-setup-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => {
          if (busy || step === "recovery") return;
          onClose();
        }}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-start gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 flex items-center justify-center shrink-0">
            <HiOutlineShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="2fa-setup-title"
              className="text-base font-semibold text-gray-900"
            >
              Set up two-step verification
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {step === "scan" && "Step 1 of 3 — Scan the QR code"}
              {step === "verify" && "Step 2 of 3 — Verify the code"}
              {step === "recovery" && "Step 3 of 3 — Save recovery codes"}
              {step === "loading" && "Preparing setup…"}
              {step === "done" && "All set"}
            </p>
          </div>
          <button
            type="button"
            disabled={busy || step === "recovery"}
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5">
          {/* Loading / load error */}
          {step === "loading" && (
            <div className="space-y-3">
              <div className="h-44 w-44 mx-auto bg-gray-100 rounded-xl animate-shimmer" />
              <div className="h-4 w-3/4 mx-auto bg-gray-100 rounded animate-shimmer" />
              <div className="h-4 w-1/2 mx-auto bg-gray-100 rounded animate-shimmer" />
            </div>
          )}
          {setupLoadError && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">
              {setupLoadError}
            </div>
          )}

          {/* Step: scan */}
          {step === "scan" && setup && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Open an authenticator app like 1Password, Google Authenticator,
                or Authy and scan this QR code.
              </p>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-center">
                {/* Using a regular img is fine — this is a data URL. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setup.qrCodeDataUrl}
                  alt="Two-factor QR code"
                  className="w-44 h-44"
                />
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-3">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Can&apos;t scan? Enter this key manually
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-gray-900 tracking-wider break-all">
                    {setup.secret}
                  </code>
                  <button
                    onClick={handleCopySecret}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50"
                  >
                    <HiOutlineClipboardDocument className="w-3.5 h-3.5" />
                    {copyLabel}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step: verify */}
          {step === "verify" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the 6-digit code from your authenticator app to confirm
                setup.
              </p>
              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono px-3.5 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              {verifyError && (
                <p className="text-xs text-rose-600">{verifyError}</p>
              )}
              <p className="text-[11px] text-gray-500">
                Codes refresh every 30 seconds. If a code doesn&apos;t work,
                wait for a new one.
              </p>
            </div>
          )}

          {/* Step: recovery */}
          {step === "recovery" && setup && (
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3.5 flex gap-2.5">
                <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Save your recovery codes now
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    These codes let you sign in if you lose access to your
                    authenticator app. They&apos;re shown only once.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3">
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm font-mono text-gray-900">
                  {setup.recoveryCodes.map((c) => (
                    <li key={c} className="tracking-wider">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopyRecoveryCodes}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50"
                >
                  <HiOutlineClipboardDocument className="w-3.5 h-3.5" />
                  {recoveryCopied ? "Copied" : "Copy all"}
                </button>
                <button
                  onClick={handleDownloadCodes}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Download .txt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 md:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
          {step === "scan" && (
            <>
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("verify")}
                disabled={!setup}
                className="inline-flex items-center gap-2 bg-primary text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover disabled:opacity-50"
              >
                I&apos;ve scanned it
              </button>
            </>
          )}
          {step === "verify" && (
            <>
              <button
                onClick={() => setStep("scan")}
                disabled={busy}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <HiOutlineArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={busy || code.length !== 6}
                className="inline-flex items-center gap-2 bg-primary text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Verifying…" : "Verify and continue"}
              </button>
            </>
          )}
          {step === "recovery" && (
            <>
              <span className="text-[11px] text-gray-500">
                Store these somewhere safe before continuing.
              </span>
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 bg-primary text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover"
              >
                <HiOutlineCheckCircle className="w-4 h-4" />
                Done
              </button>
            </>
          )}
          {step === "loading" && (
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// (No unused exports — clsx is used implicitly through className concatenation.)

export default TwoFactorSetupDialog;
