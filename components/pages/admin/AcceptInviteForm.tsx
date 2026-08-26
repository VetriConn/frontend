"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import { acceptAdminInvite } from "@/hooks/useAdminInviteAcceptance";
import { useToaster } from "@/components/ui/Toaster";

interface AcceptInviteFormProps {
  token: string;
}

const AcceptInviteForm = ({ token }: AcceptInviteFormProps) => {
  const router = useRouter();
  const { showToast } = useToaster();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordOk = password.length >= 8 && password === confirm;

  const handleAccept = async () => {
    if (!passwordOk || !token) return;
    setBusy(true);
    setError(null);
    try {
      await acceptAdminInvite({ token, password });
      showToast({
        type: "success",
        title: "Invite accepted",
        description: "Sign in and set up two-factor authentication to continue.",
      });
      router.replace("/signin?next=/admin");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "This invite link may be invalid or expired.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 flex items-center justify-center shrink-0">
            <HiOutlineShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900">
              Accept admin invite
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Set a password to join the Vetriconn admin team.
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="space-y-4">
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </Field>
            <Field label="Confirm password">
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
            {confirm.length > 0 && password !== confirm && (
              <p className="text-xs text-rose-600">Passwords don&apos;t match.</p>
            )}
            {error && <p className="text-xs text-rose-600">{error}</p>}

            <p className="text-[11px] text-gray-500 leading-relaxed">
              You&apos;ll be asked to set up two-factor authentication on your
              first sign-in. Admin sessions are short-lived and every action you
              take is recorded in the audit log.
            </p>

            <button
              onClick={handleAccept}
              disabled={busy || !passwordOk}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? "Setting up…" : "Set password & continue"}
            </button>

            <p className="text-center text-xs text-gray-500">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-primary hover:text-primary-hover"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="block text-xs font-semibold text-gray-700 mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
  />
);

export default AcceptInviteForm;
