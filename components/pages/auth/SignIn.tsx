"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import DottedBox7 from "@/public/images/dotted_box_7.svg";
import DottedBox9 from "@/public/images/dotted_box_9.svg";
import DottedBox4 from "@/public/images/dotted_box_4.svg";
import DottedBox3 from "@/public/images/dotted_box_3.svg";
import { signInSchema } from "@/lib/validation";
import { useToaster } from "@/components/ui/Toaster";
import { ZodError } from "zod";
import { loginUser, storeAuthToken } from "@/lib/api";
import { FormField, PasswordField } from ".";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { showToast } = useToaster();
  const isButtonDisabled = isSubmitting || !email.trim() || !password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      signInSchema.parse({ email, password });
      const response = await loginUser(email, password);
      if (response.success && response.data) {
        storeAuthToken(response.data.token, terms);
        showToast({ type: "success", title: "Login successful", description: "Welcome back! Redirecting to dashboard..." });
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as ZodError;
        const errorMessages: Record<string, string> = {};
        zodError.issues?.forEach((err) => {
          if (err.path?.length > 0) errorMessages[String(err.path[0])] = err.message;
        });
        setErrors(errorMessages);
        showToast({ type: "error", title: "Validation Error", description: "Please fix the errors and try again" });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Login failed";
        showToast({ type: "error", title: "Login Failed", description: errorMessage });
        if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("incorrect")) setPassword("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen font-open-sans">
      {/* Desktop: Left side with image */}
      <div className="flex-1 bg-gray-100 items-center justify-center p-8 text-left bg-[linear-gradient(70deg,rgba(0,0,0,0.6),rgba(0,0,0,0.3)),url('/images/Hero/1.svg')] bg-right bg-cover hidden mobile:hidden tablet:hidden relative md:flex">
        <DottedBox9 className="absolute top-50 right-10 w-[120px] h-auto z-0 opacity-60" />
        <h1 className="font-lato text-heading-2 mb-4 text-white text-[2.5rem] font-semibold leading-tight">Join the <br /> <span className="text-primary">Vetriconn</span> community</h1>
        <DottedBox7 className="absolute bottom-80 left-15 w-[120px] h-auto z-0 opacity-60" />
      </div>

      {/* Form side - Desktop */}
      <div className="flex-1 items-center justify-center p-16 bg-white relative flex">
        <DottedBox4 className="absolute top-8 left-15 h-auto z-0 opacity-60" />
        <div className="w-full max-w-[500px]">
          {/* Logo */}
          <img src="/images/logo_1.svg" alt="Vetriconn" className="w-40 mb-8" />
          
          <h2 className="text-3xl mb-4">Welcome back</h2>
          <p className="text-sm mb-4">Sign in to continue to your account and find opportunities.</p>
          <form onSubmit={handleSubmit}>
            <FormField name="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} helperText="Use the email you registered with." />
            
            {errors.email && <span className="text-primary text-sm -mt-3 mb-4 block">{errors.email}</span>}
            <PasswordField name="password" label="Password" placeholder="Enter your password" value={password} onChange={setPassword}/>
            {errors.password && <span className="text-primary text-sm -mt-3 mb-4 block">{errors.password}</span>}
              <div className="flex items-start gap-2 text-sm mb-6">
                <input type="checkbox" id="terms-desktop" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="appearance-none w-5 h-5 border-2 border-primary rounded-full cursor-pointer relative checked:before:content-[''] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:w-2.5 checked:before:h-2.5 checked:before:bg-primary checked:before:rounded-full" />
              <label htmlFor="terms-desktop">Remember me on this device</label>
            </div>
            <button type="submit" className="bg-primary text-white py-3 px-7 border-none rounded-[10px] text-sm cursor-pointer transition-colors ml-auto mt-2 inline-block hover:bg-red-700 disabled:bg-gray-300 disabled:text-text-muted disabled:cursor-not-allowed w-full" disabled={isButtonDisabled}>{isSubmitting ? "Signing In..." : "Sign In to your account"}</button>
          </form>

          {/* Divider with text */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">New to Vetriconn?</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Create account CTA */}
          <div className="text-center mb-8">
            <a href="/signup" className="text-primary text-2xl font-normal hover:underline">
              Create a free account
            </a>
            <p className="text-gray-500 text-sm mt-2">It only takes a few minutes to get started</p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure login</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Privacy protected</span>
            </div>
          </div>

        </div>  
        <DottedBox3 className="absolute bottom-15 right-8 h-auto z-0 opacity-60" />
      </div>
    </div>
  );
};
