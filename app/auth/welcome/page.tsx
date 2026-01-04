"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupHeader } from "@/components/pages/auth/signup/SignupHeader";
import GreenCheckCircle from "@/public/images/green_check_circle.svg";

export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Get user data from localStorage token
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      // If no token, redirect to signin
      router.push("/signin");
      return;
    }

    // Try to get user name from session storage (from signup)
    const signupData = sessionStorage.getItem("vetriconn_signup_wizard_state");
    if (signupData) {
      try {
        const data = JSON.parse(signupData);
        if (data.formData?.full_name) {
          setUserName(data.formData.full_name.split(" ")[0]); // First name only
        }
        // Clear signup session storage now that verification is complete
        sessionStorage.removeItem("vetriconn_signup_wizard_state");
      } catch (error) {
        console.error("Error parsing signup data:", error);
      }
    }
  }, [router]);

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <SignupHeader />
      
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon - Green Checkmark with light green background */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <GreenCheckCircle className="w-10 h-10" />
            </div>
          </div>

          {/* Welcome Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You're all set to get started!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your account is ready. Start exploring flexible job opportunities that match your experience.
          </p>

          {/* Benefits List - Red Background */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">You can now:</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Browse thousands of job opportunities
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Connect with top employers
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Build your professional profile
                </span>
              </li>
            </ul>
          </div>

          {/* Dashboard Button */}
          <button
            onClick={handleGoToDashboard}
            className="w-full py-3 px-6 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Go to Dashboard
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
