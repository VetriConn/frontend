"use client";

import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";

const aboutContent = {
  eyebrow: "Who it's for",
  headline: {
    prefix: "Decades of experience",
    highlight: "don't expire",
  },
  // Names the reader's actual situation, then states the offer. The version
  // before this ("You spent a career getting good at something…") set up at
  // length and landed on a platitude; this one earns its length.
  description:
    "Retiring, already retired, or leaving the forces - what you learned still works. Find Canadian employers who want it, on the hours you choose.",
  features: ["Part-time", "Full-time", "Volunteer"],
  cta: {
    text: "Browse jobs",
    href: "/jobs",
  },
};

const aboutImage = {
  src: "/images/Hero/1.svg",
  alt: "An experienced worker back at the bench, doing skilled work",
};

interface AboutSectionProps {
  id?: string;
}

export const AboutSection = ({ id }: AboutSectionProps) => (
  <section
    id={id}
    className="py-20 md:py-28 bg-gray-bg relative overflow-hidden mobile:py-14"
    aria-labelledby="about-heading"
  >
    <div className="max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14 relative">
      {/* One image, one column of copy. Left-aligned to match the hero rather
          than centring a second reading axis on the same page. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16">
        <Reveal className="group relative w-full aspect-[16/10] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg order-2 lg:order-1">
          <Image
            src={aboutImage.src}
            alt={aboutImage.alt}
            unoptimized
            fill
            className="object-cover w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 850px) 100vw, 50vw"
            loading="lazy"
          />
        </Reveal>

        <Reveal index={1} className="order-1 lg:order-2 text-center lg:text-left">
          <Eyebrow>{aboutContent.eyebrow}</Eyebrow>
          <h2 id="about-heading" className="heading-1 mb-5 mobile:mb-4">
            {aboutContent.headline.prefix}{" "}
            <span className="text-primary italic font-[var(--font-outfit)]">
              {aboutContent.headline.highlight}
            </span>
          </h2>

          <p className="body-text text-lg leading-relaxed mb-7 mobile:text-base mobile:mb-6 max-w-[46ch] mx-auto lg:mx-0">
            {aboutContent.description}
          </p>

          {/* The tracked line the hero uses — the ✓ pills were the pattern
              rejected there, and two treatments for one idea is one too many. */}
          <p className="meta-list mb-8 flex flex-wrap items-center justify-center lg:justify-start gap-y-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-gray-500">
            {aboutContent.features.map((feature) => (
              <span key={feature}>{feature}</span>
            ))}
          </p>

          <Link
            href={aboutContent.cta.href}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 px-8 rounded-full transition-colors shadow-sm group no-underline"
          >
            {aboutContent.cta.text}
            <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </div>
  </section>
);
