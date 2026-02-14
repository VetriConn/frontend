"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { FAQ_DATA } from "@/lib/faq-data";

// Show only the first 4 FAQs on the home page
const homeFaqs = FAQ_DATA.slice(0, 4);

interface FaqSectionProps {
  id?: string;
}

export const FaqSection = ({ id }: FaqSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      className="w-full py-16 px-[5%] pb-20 mobile:py-10 mobile:pb-12 relative overflow-hidden"
      id={id}
    >
      {/* Decorative dots */}
      <div
        className="absolute top-12 left-[6%] w-3 h-3 rounded-full bg-amber-400 opacity-50"
        aria-hidden="true"
      />
      <div
        className="absolute top-8 right-[5%] w-2 h-2 rounded-full bg-primary opacity-40"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-16 right-[8%] w-2.5 h-2.5 rounded-full bg-amber-400 opacity-40"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-12 left-[4%] w-2 h-2 rounded-full bg-primary opacity-35"
        aria-hidden="true"
      />
      <div
        className="absolute top-[55%] right-[3%] w-2 h-2 rounded-full bg-pink-400 opacity-30"
        aria-hidden="true"
      />

      <h2 className="heading-1 text-center mb-10 mobile:mb-6 relative z-10">
        Got <span className="text-primary">Questions</span>?
        <br />
        We&apos;ve Got <span className="text-primary">Answers</span>
      </h2>

      <div className="w-full max-w-[900px] mx-auto flex flex-col gap-5 mobile:gap-4">
        {homeFaqs.map((faq, idx) => (
          <Accordion
            key={idx}
            className="bg-gray-50 rounded-2xl shadow-sm p-0 transition-shadow w-full hover:shadow-md"
            title={faq.question}
            symbol={openIndex === idx ? <FaMinus /> : <FaPlus />}
            content={faq.answer}
            open={openIndex === idx}
            onToggle={() => handleToggle(idx)}
          />
        ))}
      </div>

      {/* See More link */}
      <div className="text-center mt-10 relative z-10">
        <Link
          href="/faq"
          className="inline-flex items-center gap-2 text-primary font-semibold font-open-sans text-lg hover:text-red-700 transition-colors"
        >
          See all FAQs
          <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};
