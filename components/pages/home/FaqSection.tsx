"use client";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import React, { useState } from "react";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { HiOutlineArrowRight, HiOutlineChevronDown } from "react-icons/hi2";
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
      className="w-full bg-white py-20 md:py-28 mobile:py-14 relative overflow-hidden"
      id={id}
    >
      {/* Decorative dots */}

      <div className="max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14 relative z-10">
        <Reveal className="text-center mb-10 mobile:mb-6">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="heading-1">
            Questions, <span className="text-primary">answered</span>.
          </h2>
        </Reveal>

        <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 mobile:gap-4">
        {homeFaqs.map((faq, idx) => (
          <Reveal key={idx} index={idx}>
          <Accordion
            className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-0 w-full hover:shadow-md"
            title={faq.question}
            symbol={<HiOutlineChevronDown className="w-4 h-4" />}
            content={faq.answer}
            open={openIndex === idx}
            onToggle={() => handleToggle(idx)}
          />
          </Reveal>
        ))}
        </div>

        {/* See More link */}
        <div className="text-center mt-10">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 min-h-[44px] px-2 text-primary font-semibold font-open-sans text-lg hover:text-primary-hover transition-colors no-underline"
          >
            See all FAQs
            <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};
