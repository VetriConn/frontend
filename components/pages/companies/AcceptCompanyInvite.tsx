"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineBuildingOffice2,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { acceptInvite, type Company } from "@/lib/api";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToaster } from "@/components/ui/Toaster";
import { withReturnUrl } from "@/lib/auth-redirect";

/**
 * Redeems a company hiring-team invite.
 *
 * The invite email links here with `?token=…`. Accepting requires a session,
 * and the recipient may not have an account at all, so an unauthenticated
 * visitor is sent to sign in (or sign up) with this page — token included — as
 * their return destination.
 *
 * Acceptance is behind an explicit button rather than firing on load: link
 * scanners in corporate mail systems follow URLs automatically, and a seat on
 * a hiring team should not be claimed by a crawler.
 */

const PANEL =
  "bg-white rounded-xl border border-gray-200 p-8 md:p-10 text-center max-w-md w-full";
const PAGE = "min-h-screen bg-gray-50 flex items-center justify-center p-6";

export const AcceptCompanyInvite = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToaster();
  const { userProfile, isLoading: profileLoading } = useUserProfile();

  const token = searchParams.get("token")?.trim() || "";

  const [isAccepting, setIsAccepting] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const isSignedIn = !!userProfile;

  // Bounce unauthenticated visitors through auth, preserving the token.
  useEffect(() => {
    if (profileLoading || isSignedIn || !token) return;

    const returnTo = `/companies/invites/accept?token=${encodeURIComponent(token)}`;
    router.replace(withReturnUrl("/signin", returnTo));
  }, [profileLoading, isSignedIn, token, router]);

  const handleAccept = async () => {
    setIsAccepting(true);
    setAcceptError(null);
    try {
      const joined = await acceptInvite(token);
      setCompany(joined);
      showToast({
        type: "success",
        title: "Invite accepted",
        description: `You're now on the ${joined.name} hiring team.`,
      });
    } catch (err) {
      setAcceptError(
        err instanceof Error
          ? err.message
          : "We couldn't accept this invite. Please ask for a new one.",
      );
    } finally {
      setIsAccepting(false);
    }
  };

  // ── Missing token ──────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className={PAGE}>
        <div className={PANEL}>
          <HiOutlineExclamationTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            This invite link is incomplete
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            The link is missing its invite code. Open the link from your
            invitation email again, or ask whoever invited you to resend it.
          </p>
          <Link
            href="/dashboard"
            className="text-primary font-medium hover:underline no-underline"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Waiting on the session check ───────────────────────────────────────
  if (profileLoading || !isSignedIn) {
    return (
      <div className={PAGE}>
        <div className={PANEL}>
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">
            {profileLoading
              ? "Checking your account…"
              : "Taking you to sign in…"}
          </p>
        </div>
      </div>
    );
  }

  // ── Accepted ───────────────────────────────────────────────────────────
  if (company) {
    return (
      <div className={PAGE}>
        <div className={PANEL}>
          <HiOutlineCheckCircle className="w-10 h-10 text-green-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            You&apos;ve joined {company.name}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            You can now help manage this company&apos;s job postings and
            applicants.
          </p>
          <Link
            href={`/dashboard/companies/${company._id}`}
            className="block w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors no-underline mb-3"
          >
            Go to {company.name}
          </Link>
          <Link
            href="/dashboard"
            className="block text-sm text-gray-500 hover:text-gray-700 no-underline"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Ready to accept, or failed ─────────────────────────────────────────
  return (
    <div className={PAGE}>
      <div className={PANEL}>
        <HiOutlineBuildingOffice2 className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Join a hiring team
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          You&apos;ve been invited to help manage a company&apos;s job postings
          on Vetriconn. Accepting adds this to your account
          {userProfile?.email ? ` (${userProfile.email})` : ""} — your personal
          profile stays your own.
        </p>

        {acceptError && (
          <div
            role="alert"
            className="text-left bg-red-50 border border-red-200 rounded-lg p-3 mb-5"
          >
            <p className="text-sm text-red-700 font-medium mb-1">
              We couldn&apos;t accept this invite
            </p>
            <p className="text-xs text-red-600">{acceptError}</p>
            <p className="text-xs text-red-600 mt-1.5">
              Invites expire after seven days. Ask the person who invited you to
              send a new one.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleAccept}
          disabled={isAccepting}
          className="block w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors mb-3"
        >
          {isAccepting ? "Accepting…" : "Accept invite"}
        </button>

        <Link
          href="/dashboard"
          className="block text-sm text-gray-500 hover:text-gray-700 no-underline"
        >
          Not now
        </Link>
      </div>
    </div>
  );
};

export default AcceptCompanyInvite;
