"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import DottedBox7 from "@/public/images/dotted_box_7.svg";
import DottedBox9 from "@/public/images/dotted_box_9.svg";
import DottedBox4 from "@/public/images/dotted_box_4.svg";
import DottedBox3 from "@/public/images/dotted_box_3.svg";
import { signInSchema } from "@/lib/validation";
import { useToaster } from "@/components/ui/Toaster";
import { ZodError } from "zod";
import { loginUser } from "@/lib/api";
import { useSessionCache } from "@/hooks/useSessionCache";
import { resendVerificationEmail } from "@/lib/api/auth";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import TwoFactorChallengeDialog from "@/components/security/TwoFactorChallengeDialog";
import {
  RETURN_URL_PARAM,
  resolvePostAuthPath,
  homePathForRole,
  sanitizeReturnUrl,
  withReturnUrl,
} from "@/lib/auth-redirect";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set when sign-in fails because the address is unverified. A vanishing
  // toast is not a recovery path - this drives a persistent notice with a
  // resend button instead.
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  // 2FA challenge state
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);
  const [partialToken, setPartialToken] = useState<string | undefined>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToaster();
  const isButtonDisabled = isSubmitting || !email.trim() || !password.trim();

  // Someone arriving from a company invite needs to land back on the invite,
  // not the dashboard. Unsafe values fall back to the dashboard.
  const rawReturnUrl = searchParams.get(RETURN_URL_PARAM);
  // Whether a usable destination was carried in, rather than comparing the
  // resolved path against "/dashboard" — that literal stopped meaning "no
  // return url" the moment admins started landing on /admin.
  const isReturningSomewhere = sanitizeReturnUrl(rawReturnUrl) !== null;
  const sessionExpired = searchParams.get("reason") === "session-expired";

  // Carry the destination through if they need an account first.
  const signUpHref = rawReturnUrl
    ? withReturnUrl("/signup", rawReturnUrl)
    : "/signup";

  const { startSession } = useSessionCache();

  /**
   * @param roleHint The role from the login response, which is authoritative
   * and instant. Absent on the 2FA path, where startSession's fetch supplies
   * it instead.
   */
  const finishSignIn = async (roleHint?: string) => {
    showToast({
      type: "success",
      title: "Login successful",
      description: isReturningSomewhere
        ? "Welcome back! Taking you back to where you left off..."
        : "Welcome back!",
    });

    // Drops the previous account's cache and seeds this one's profile, so the
    // destination renders the right person immediately.
    let role = roleHint;
    try {
      role = (await startSession()) ?? roleHint;
    } catch {
      // The destination fetches for itself; the hint still routes us there.
    }

    // Role-aware, and this is the fix for the flash: pushing everyone to
    // /dashboard sent admins to the job-seeker dashboard, where AuthGuard
    // could only bounce them once the profile had loaded. An explicit
    // ?redirect= still wins — that is someone returning to a specific page.
    router.push(resolvePostAuthPath(rawReturnUrl, homePathForRole(role)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      signInSchema.parse({ email, password });
      const response = await loginUser(email, password, rememberMe);

      // 2FA detour — open challenge dialog instead of going to dashboard.
      if (response.success && response.requires2FA) {
        setPartialToken(response.partialSessionToken);
        setTwoFactorOpen(true);
        return;
      }

      if (response.success && response.data) {
        await finishSignIn(response.data.user?.role);
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as ZodError;
        const errorMessages: Record<string, string> = {};
        zodError.issues?.forEach((err) => {
          if (err.path?.length > 0)
            errorMessages[String(err.path[0])] = err.message;
        });
        setErrors(errorMessages);
        showToast({
          type: "error",
          title: "Check your details",
          description: "Please fix the errors and try again",
        });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        if (/verify your email/i.test(errorMessage)) {
          // Recoverable without support: show the persistent notice with the
          // resend affordance rather than a toast that vanishes in seconds.
          setNeedsVerification(true);
          setResendState("idle");
        } else {
          showToast({
            type: "error",
            title: "Login failed",
            description: errorMessage,
          });
        }
        if (
          errorMessage.toLowerCase().includes("invalid") ||
          errorMessage.toLowerCase().includes("incorrect")
        )
          setPassword("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen font-open-sans">
      {/* Desktop: Left side with image */}
      <div className="flex-1 bg-gray-100 items-center justify-center p-8 text-left bg-[linear-gradient(70deg,rgba(0,0,0,0.65),rgba(0,0,0,0.45)),url('/images/hero/1.jpg')] bg-right bg-cover hidden mobile:hidden tablet:hidden relative md:flex">
        <DottedBox9 className="absolute top-50 right-10 w-32 h-auto z-0 opacity-60" />
        <h1 className="font-lato text-2xl md:text-4xl mb-4 text-white font-semibold leading-tight drop-shadow-lg">
          Welcome back to the <br />{" "}
          <span className="text-primary drop-shadow-lg">Vetriconn</span>{" "}
          community
        </h1>
        <DottedBox7 className="absolute bottom-80 left-15 w-32 h-auto z-0 opacity-60" />
      </div>

      {/* Form side - Desktop */}
      <div className="flex-1 items-center justify-center p-16 bg-white relative flex">
        <DottedBox4 className="absolute top-8 left-15 h-auto z-0 opacity-60" />
        <div className="w-full max-w-lg">
          {/* Logo */}
          <img src="/images/logo.png" alt="Vetriconn" className="w-40 mb-8" />

          <h2 className="text-xl md:text-3xl mb-4">Welcome back</h2>
          <p className="text-sm md:text-base mb-4">
            Sign in to continue to your account and find opportunities.
          </p>
          {sessionExpired && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your session expired. Please sign in again to continue.
            </div>
          )}
          {needsVerification && (
            <div
              role="status"
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <p className="mb-2">
                Your email address isn&apos;t verified yet. Check your inbox for
                the verification link, or we can send a new one.
              </p>
              {resendState === "sent" ? (
                <p className="font-medium">
                  Sent. Check your inbox (and your spam folder).
                </p>
              ) : (
                <button
                  type="button"
                  disabled={resendState === "sending" || !email.trim()}
                  onClick={async () => {
                    setResendState("sending");
                    try {
                      await resendVerificationEmail(email.trim());
                      setResendState("sent");
                    } catch {
                      setResendState("idle");
                      showToast({
                        type: "error",
                        title: "Couldn't resend the email",
                        description: "Please try again in a moment.",
                      });
                    }
                  }}
                  className="font-semibold text-primary hover:underline disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none p-0 min-h-[44px]"
                >
                  {resendState === "sending"
                    ? "Sending..."
                    : "Resend verification email"}
                </button>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              helperText="Use the email you registered with."
            />

            {errors.email && (
              <span className="text-primary text-sm -mt-3 mb-4 block">
                {errors.email}
              </span>
            )}
            <PasswordField
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
            />
            {errors.password && (
              <span className="text-primary text-sm -mt-3 mb-4 block">
                {errors.password}
              </span>
            )}
            <div className="flex justify-end -mt-1 mb-4">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary-hover hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="flex items-start gap-2 text-sm mb-6">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="appearance-none w-5 h-5 border-2 border-primary rounded-full cursor-pointer relative checked:before:content-[''] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:w-2.5 checked:before:h-2.5 checked:before:bg-primary checked:before:rounded-full"
              />
              <label htmlFor="remember-me">Remember me on this device</label>
            </div>
            {/* Same treatment as the signup wizard's Continue (WizardNav):
                full-width and large-tap on mobile, a compact right-aligned
                button from sm up. */}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-text-muted sm:w-auto"
                disabled={isButtonDisabled}
              >
                {isSubmitting ? "Signing In…" : "Sign In"}
              </button>
            </div>
          </form>

          {/* Divider with text */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">New to Vetriconn?</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Create account CTA */}
          <div className="text-center mb-8">
            <a
              href={signUpHref}
              className="text-primary text-lg font-medium hover:underline"
            >
              Create a free account
            </a>
            <p className="text-gray-500 text-sm mt-2">
              It only takes a few minutes to get started
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Secure login</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Privacy protected</span>
            </div>
          </div>
        </div>
        <DottedBox3 className="absolute bottom-15 right-8 h-auto z-0 opacity-60" />
      </div>

      {/* 2FA challenge dialog */}
      <TwoFactorChallengeDialog
        open={twoFactorOpen}
        emailHint={email}
        partialSessionToken={partialToken}
        onClose={() => {
          setTwoFactorOpen(false);
          setPartialToken(undefined);
        }}
        onVerified={() => {
          setTwoFactorOpen(false);
          setPartialToken(undefined);
          void finishSignIn();
        }}
      />
    </div>
  );
};
