"use client";
import React from "react";

const EmployerDashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="p-6 max-w-[1400px] mx-auto w-full">
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
            🏢
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Employer Dashboard
          </h1>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Access to the employer portal is coming soon. You'll be able to post
            jobs, manage applications, and find the perfect candidates.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Under Development
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
