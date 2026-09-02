"use client";

import BrushUnderline from "@/components/ui/BrushUnderline";
import Eyebrow from "@/components/ui/Eyebrow";
import React, { useState } from "react";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Accordion } from "@/components/ui/Accordion";
import { FAQ_DATA } from "@/lib/faq-data";

// ── FAQ Icons — one per question for visual variety ──────────────────


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
      <section className="px-[5%] md:px-6 pt-16 pb-12 bg-white mobile:pt-10 mobile:pb-8">
        <div className="max-w-[1600px] mx-auto md:px-4 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>FAQ</Eyebrow>
            <h1 className="heading-1 mb-5 mobile:mb-4">
              Frequently <BrushUnderline>asked questions</BrushUnderline>
            </h1>
            <p className="body-text text-lg mobile:text-base leading-relaxed mb-6">
              Stuck on something? We&apos;re here to help with all your
              questions and answers in one place.
            </p>
            <Link
              href="/#contact-section"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 px-8 min-h-[52px] rounded-full transition-colors shadow-sm group no-underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              Contact us
              <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ Grid ─────────────────────────────────────────────── */}
      <section className="px-[5%] md:px-6 py-16 bg-white mobile:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {FAQ_DATA.map((faq, idx) => (
              <article key={idx} className="group flex items-start gap-4">
                {/* A quiet marker in the theme's own vocabulary (the meta-list
                    dot), not a per-question glyph from an icon kit. */}
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60 transition-colors duration-300 group-hover:bg-primary motion-reduce:transition-none"
                />
                <div>
                  <h3 className="font-lato text-base font-bold text-text mb-2 leading-snug">
                    {faq.question}
                  </h3>
                  <p className="font-open-sans text-sm md:text-base text-text-muted leading-relaxed m-0">
                    {faq.answer}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Divider ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-[5%] md:px-6">
        <hr className="border-gray-200" />
      </div>

      {/* ─── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-16 bg-white mobile:py-12">
        <div className="max-w-7xl mx-auto px-[5%] md:px-6 text-center">
          <h2 className="font-lato text-xl md:text-3xl font-bold text-text mb-4 mobile:mb-3">
            Still have questions?
          </h2>
          <p className="font-open-sans text-lg text-text-muted max-w-xl mx-auto mb-8 mobile:text-base mobile:mb-6 leading-relaxed">
            Our support team is always happy to help. Reach out by phone or
            email and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <Link
              href="/#contact-section"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 px-8 min-h-[52px] rounded-full transition-colors shadow-sm group no-underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              Contact us
              <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-hover transition-all group"
            >
              Create an account
              <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
