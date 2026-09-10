"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiArrowRight, HiCheckCircle } from "react-icons/hi2";
import GreenCheckCircle from "@/public/images/green_check_circle.svg";

/**
 * "Your account is ready", shown the moment an email is verified.
 *
 * It used to be a separate page: verification said "Redirecting to sign in
 * page…" and then pushed to /auth/welcome instead — so the copy named one
 * destination and the router went to another, and the screen that appeared
 * was a surprise. This is the same panel, rendered where the verification
 * actually happens.
 *
 * /auth/welcome still renders it too, so an old link or a bookmark from a
 * previous session lands somewhere sensible rather than 404ing.
 */

/** What the account can do now. Deliberately modest. */
const NEXT_STEPS = [
  "Browse roles matched to your experience",
  "Message the people hiring, directly",
  "Build a profile that speaks for you",
];

export function AccountReadyPanel({
  /**
   * Seconds before moving to sign-in on its own. Omit to stay put.
   *
   * The countdown is shown rather than silent, and the button below goes
   * immediately — a page that moves under you with no warning and no way to
   * act first is the thing to avoid, more than the moving itself.
   */
  redirectAfter,
}: {
  redirectAfter?: number;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [remaining, setRemaining] = useState(redirectAfter ?? 0);

  useEffect(() => {
    const signupData = sessionStorage.getItem("vetriconn_signup_wizard_state");
    if (!signupData) return;
    try {
      const data = JSON.parse(signupData);
      if (data.formData?.full_name) {
        setFirstName(String(data.formData.full_name).trim().split(" ")[0]);
      }
      // Verification is done, so the half-finished signup can go.
      sessionStorage.removeItem("vetriconn_signup_wizard_state");
    } catch {
      // Ignore malformed session payload.
    }
  }, []);

  useEffect(() => {
    if (!redirectAfter) return;
    if (remaining <= 0) {
      router.replace("/signin");
      return;
    }
    const id = setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [redirectAfter, remaining, router]);

  return (
    <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8 text-center">
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
          <GreenCheckCircle className="w-10 h-10" />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        {/* The first name was already being read out of session storage and
            then thrown away. Using it costs nothing and this is the one
            moment the greeting is worth something. */}
        {firstName ? `You're all set, ${firstName}!` : "You're all set to get started!"}
      </h1>

      <p className="text-gray-600 mb-6">
        Your email is verified and your account is ready.
      </p>

      {/* Neutral, not red. A red-tinted panel directly under a green tick
          reads as a warning and undercuts the thing the page exists to say. */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 mb-6 text-left">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">You can now</h2>
        <ul className="flex flex-col gap-2.5">
          {NEXT_STEPS.map((step) => (
            <li key={step} className="flex items-start gap-3">
              <HiCheckCircle className="w-5 h-5 text-emerald-500 mt-px shrink-0" />
              <span className="text-sm text-gray-700">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* A link, not a button with router.push — this navigates, so it should
          survive middle-click, open-in-new-tab and prefetch. */}
      <Link
        href="/signin"
        className="w-full py-3 px-6 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors no-underline inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Sign in to your account
        <HiArrowRight className="w-5 h-5" aria-hidden="true" />
      </Link>

      {redirectAfter ? (
        <p className="mt-4 text-sm text-gray-500" role="status">
          Taking you there in {remaining} second{remaining === 1 ? "" : "s"}…
        </p>
      ) : null}
    </div>
  );
}

export default AccountReadyPanel;
