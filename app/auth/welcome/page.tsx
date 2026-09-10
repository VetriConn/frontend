"use client";

import { AuthHeader } from "@/components/ui/AuthHeader";
import { AccountReadyPanel } from "@/components/pages/auth/AccountReadyPanel";

/**
 * Kept as a route so an old link or a bookmark still lands somewhere
 * sensible, but nothing navigates here any more — verification shows this
 * panel where the verification happens, which is where people expect it.
 *
 * No countdown on this one. Arriving by bookmark is not the end of a flow,
 * and a page that moves on its own when you deliberately opened it is
 * hostile rather than helpful.
 */
export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <AuthHeader />
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-10 md:px-6 md:py-16"
      >
        <AccountReadyPanel />
      </main>
    </div>
  );
}
