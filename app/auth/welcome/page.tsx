"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiArrowRight, HiCheckCircle } from "react-icons/hi2";
import { AuthHeader } from "@/components/ui/AuthHeader";
import GreenCheckCircle from "@/public/images/green_check_circle.svg";

/**
 * Shown once an email address has been verified.
 *
 * This is the first thing a new account sees, so it is doing two jobs at once:
 * confirming that the thing they just did worked, and telling them what to do
 * next. Everything here serves one of those two.
 */

/** What the account can do now. Deliberately modest — see the note below. */
const NEXT_STEPS = [
  "Browse roles matched to your experience",
  "Message the people hiring, directly",
  "Build a profile that speaks for you",
];

export default function WelcomePage() {
  const [firstName, setFirstName] = useState<string>("");

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-10 md:px-6 md:py-16">
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
            {firstName
              ? `You're all set, ${firstName}!`
              : "You're all set to get started!"}
          </h1>

          <p className="text-gray-600 mb-6">
            Your email is verified and your account is ready.
          </p>

          {/* Neutral, not red. A red-tinted panel directly under a green tick
              reads as a warning and undercuts the thing the page exists to
              say — the brand colour is doing the wrong job here. */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 mb-6 text-left">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              You can now
            </h2>
            <ul className="flex flex-col gap-2.5">
              {NEXT_STEPS.map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <HiCheckCircle className="w-5 h-5 text-emerald-500 mt-px shrink-0" />
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* A link, not a button with router.push — this navigates, so it
              should survive middle-click, open-in-new-tab and prefetch. */}
          <Link
            href="/signin"
            className="w-full py-3 px-6 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors no-underline inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Sign in to your account
            <HiArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </main>
    </div>
  );
}
