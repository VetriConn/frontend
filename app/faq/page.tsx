"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Accordion } from "@/components/ui/Accordion";
import { FAQ_DATA } from "@/lib/faq-data";

// ── FAQ Icons — one per question for visual variety ──────────────────

const FAQ_ICONS = [
  // What is Vetriconn?
  <svg
    key="info"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="14" fill="#FEE2E2" />
    <path
      d="M14 12V19M14 9H14.01"
      stroke="#E53E3E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  // Who can use?
  <svg
    key="users"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="14" fill="#FEE2E2" />
    <path
      d="M17 19V18C17 16.3431 15.6569 15 14 15H12C10.3431 15 9 16.3431 9 18V19"
      stroke="#E53E3E"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="13" cy="11" r="2.5" stroke="#E53E3E" strokeWidth="1.8" />
    <path
      d="M19 19V18C19 17.07 18.6 16.23 17.97 15.63"
      stroke="#E53E3E"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="17" cy="10.5" r="2" stroke="#E53E3E" strokeWidth="1.5" />
  </svg>,
  // Cost?
  <svg
    key="cost"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="14" fill="#FEE2E2" />
    <path
      d="M14 8V20M17 10.5C17 9.12 15.66 8 14 8C12.34 8 11 9.12 11 10.5C11 11.88 12.34 13 14 13C15.66 13 17 14.12 17 15.5C17 16.88 15.66 18 14 18C12.34 18 11 16.88 11 15.5"
      stroke="#E53E3E"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>,
  // Types of opportunities?
  <svg
    key="list"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="14" fill="#FEE2E2" />
    <path
      d="M10 10H18M10 14H18M10 18H15"
      stroke="#E53E3E"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  // Haven't worked in years?
  <svg
    key="heart"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="14" fill="#FEE2E2" />
    <path
      d="M14 19L9.5 14.5C8.12 13.12 8.12 10.88 9.5 9.5C10.88 8.12 13.12 8.12 14.5 9.5L14 10L13.5 9.5C14.88 8.12 17.12 8.12 18.5 9.5C19.88 10.88 19.88 13.12 18.5 14.5L14 19Z"
      stroke="#E53E3E"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  // How do matches work?
  <svg
    key="match"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="14" fill="#FEE2E2" />
    <path
      d="M18 11L12 17L10 15"
      stroke="#E53E3E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  // Not tech-savvy?
  <svg
    key="support"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="14" fill="#FEE2E2" />
    <path
      d="M10 18V12C10 9.79 11.79 8 14 8C16.21 8 18 9.79 18 12V18"
      stroke="#E53E3E"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M9 15V17C9 17.55 9.45 18 10 18H11V14H10C9.45 14 9 14.45 9 15ZM17 14V18H18C18.55 18 19 17.55 19 17V15C19 14.45 18.55 14 18 14H17Z"
      fill="#E53E3E"
    />
  </svg>,
  // Browse anonymously?
  <svg
    key="shield"
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="14" fill="#FEE2E2" />
    <path
      d="M14 8L9 10V14C9 17.31 11.14 20.39 14 21C16.86 20.39 19 17.31 19 14V10L14 8Z"
      stroke="#E53E3E"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
];

// ── Page ─────────────────────────────────────────────────────────────

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white">
        <Header />
      </div>

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="px-[5%] pt-16 pb-12 bg-white mobile:pt-10 mobile:pb-8">
        <div className="max-w-[1340px] mx-auto">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-red-50 rounded-full px-4 py-1.5 mb-6 font-open-sans">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#E53E3E"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 5V8.5M8 10.5H8.005"
                  stroke="#E53E3E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              FAQs
            </span>
            <h1 className="font-lato text-[48px] leading-[1.1] font-bold text-text mb-5 mobile:text-[32px] mobile:mb-4">
              Frequently asked questions
            </h1>
            <p className="font-open-sans text-lg text-text-muted leading-relaxed mobile:text-base">
              Stuck on something? We&apos;re here to help with all your
              questions and answers in one place. Can&apos;t find what you need?{" "}
              <Link
                href="/#contact-section"
                className="text-primary font-medium hover:text-red-700 transition-colors underline underline-offset-2"
              >
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ Grid ─────────────────────────────────────────────── */}
      <section className="px-[5%] py-16 bg-white mobile:py-10">
        <div className="max-w-[1340px] mx-auto">
          <div className="grid grid-cols-2 gap-x-12 gap-y-10 mobile:grid-cols-1 mobile:gap-y-8">
            {FAQ_DATA.map((faq, idx) => (
              <article key={idx} className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {FAQ_ICONS[idx] || FAQ_ICONS[0]}
                </div>
                {/* Text */}
                <div>
                  <h3 className="font-lato text-base font-bold text-text mb-2 leading-snug">
                    {faq.question}
                  </h3>
                  <p className="font-open-sans text-[15px] text-text-muted leading-relaxed m-0">
                    {faq.answer}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Divider ──────────────────────────────────────────────── */}
      <div className="max-w-[1340px] mx-auto px-[5%]">
        <hr className="border-gray-200" />
      </div>

      {/* ─── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-16 bg-white mobile:py-12">
        <div className="max-w-[1340px] mx-auto px-[5%] text-center">
          <h2 className="font-lato text-[32px] font-bold text-text mb-4 mobile:text-[24px] mobile:mb-3">
            Still have questions?
          </h2>
          <p className="font-open-sans text-lg text-text-muted max-w-xl mx-auto mb-8 mobile:text-base mobile:mb-6 leading-relaxed">
            Our support team is always happy to help. Reach out by phone or
            email and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#contact-section"
              className="inline-flex items-center gap-2 bg-primary hover:bg-red-700 text-white font-semibold py-3.5 px-10 rounded-full transition-colors shadow-sm"
            >
              Contact Us
              <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-red-700 transition-colors"
            >
              Create an Account
              <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
