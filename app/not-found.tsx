"use client";

import Link from "next/link";
import { SignupHeader } from "@/components/pages/auth/signup/SignupHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Signup Header */}
      <SignupHeader />
      
      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          {/* 404 Number */}
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          
          {/* Message */}
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
