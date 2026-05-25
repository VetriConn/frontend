"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import {
  fetchInvitePreview,
  acceptAdminInvite,
  type InvitePreview,
} from "@/hooks/useAdminInviteAcceptance";
import { useToaster } from "@/components/ui/Toaster";

interface AcceptInviteFormProps {
  token: string;
}

const formatExpiry = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AcceptInviteForm = ({ token }: AcceptInviteFormProps) => {
  const router = useRouter();
  const { showToast } = useToaster();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchInvitePreview(token)
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const passwordOk =
    password.length >= 8 && password === confirm && fullName.trim().length >= 2;

  const handleAccept = async () => {
    if (!passwordOk) return;
    setBusy(true);
    try {
      await acceptAdminInvite({ token, full_name: fullName.trim(), password });
      showToast({
        type: "success",
        title: "Welcome aboard",
        description: "Sign in to access the admin console.",
      });
      router.replace("/signin?next=/admin");
    } catch {
      showToast({ type: "error", title: "Could not accept invite" });
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
              Set up your account to join the Vetriconn admin team.
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-shimmer" />
              <div className="h-10 w-full bg-gray-100 rounded animate-shimmer" />
              <div className="h-10 w-full bg-gray-100 rounded animate-shimmer" />
              <div className="h-10 w-full bg-gray-100 rounded animate-shimmer" />
            </div>
          ) : loadError || !preview ? (
            <InvalidInvite message={loadError ?? "This invite is invalid."} />
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Inviting
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {preview.email}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Role:{" "}
                  <span className="font-semibold">
                    {preview.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span>
                  {" · "}
                  Invited by{" "}
                  <span className="font-semibold">{preview.invitedBy}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Expires: {formatExpiry(preview.expiresAt)}
                </p>
              </div>

              <Field label="Full name">
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  placeholder="Jane Doe"
                />
              </Field>
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
                <p className="text-xs text-rose-600">
                  Passwords don&apos;t match.
                </p>
              )}

              <p className="text-[11px] text-gray-500 leading-relaxed">
                You&apos;ll be asked to set up two-factor authentication on
                your first sign-in. Admin sessions are short-lived and every
                action you take is recorded in the audit log.
              </p>

              <button
                onClick={handleAccept}
                disabled={busy || !passwordOk}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? "Creating account…" : "Create admin account"}
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
          )}
        </div>
      </div>
    </div>
  );
};

const InvalidInvite = ({ message }: { message: string }) => (
  <div className="text-center py-6">
    <div className="mx-auto w-11 h-11 rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100 flex items-center justify-center mb-3">
      <HiOutlineExclamationTriangle className="w-5 h-5" />
    </div>
    <h2 className="text-base font-semibold text-gray-900">
      This invite can&apos;t be used
    </h2>
    <p className="text-sm text-gray-500 mt-1">{message}</p>
    <Link
      href="/signin"
      className="inline-flex mt-5 text-sm font-semibold text-primary hover:text-primary-hover"
    >
      Go to sign in
    </Link>
  </div>
);

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
