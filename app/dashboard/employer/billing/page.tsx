"use client";

import { HiOutlineCreditCard } from "react-icons/hi2";

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Billing &amp; Subscription
          </h1>
          <p className="text-gray-500">
            Manage your subscription plan, payment methods, and billing history.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineCreditCard className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Billing Coming Soon
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Subscription management and payment features are under development.
            You&apos;ll be able to upgrade plans, manage payment methods, and
            view invoices.
          </p>
        </div>
      </div>
    </div>
  );
}
