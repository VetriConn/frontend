"use client";

import Link from "next/link";
import { HiOutlineUsers, HiOutlineArrowLeft } from "react-icons/hi2";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function CommunityComingSoonPage() {
  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto py-10">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] px-6 md:px-10 py-12 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 flex items-center justify-center mb-5">
            <HiOutlineUsers className="w-7 h-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Community is coming soon
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
            Share advice, swap stories, and connect with other Vetriconn
            members. We&apos;re putting the finishing touches on it — check
            back shortly.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)]"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
