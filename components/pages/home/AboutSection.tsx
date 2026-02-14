"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const aboutContent = {
  headline: {
    prefix: "A Legacy of Purpose:",
    highlight: "Reconnecting Experience with Opportunity",
  },
  description:
    "At Vetriconn, our mission is to strengthen the Canadian workforce and economy by reconnecting Canadian retirees and veterans with flexible work, volunteer, and remote opportunities. We believe in offering renewed purpose, engagement, and community for those transitioning from full-time service into retirement.",
  features: [
    "Part-time positions",
    "Full-time roles",
    "Volunteer opportunities",
  ],
  cta: {
    text: "Explore Opportunities",
    href: "/jobs",
  },
};

const decorativeImages = [
  {
    src: "/images/Hero/1.svg",
    alt: "Professional working at desk",
    className:
      "absolute -top-4 -left-6 w-40 h-40 rotate-[15deg] rounded-2xl overflow-hidden shadow-lg xl:w-44 xl:h-44",
  },
  {
    src: "/images/Hero/2.svg",
    alt: "Team collaboration",
    className:
      "absolute -top-2 -right-4 w-36 h-36 -rotate-[12deg] rounded-2xl overflow-hidden shadow-lg xl:w-40 xl:h-40",
  },
  {
    src: "/images/Hero/3.svg",
    alt: "Career growth",
    className:
      "absolute -bottom-6 -left-4 w-36 h-36 -rotate-[18deg] rounded-2xl overflow-hidden shadow-lg xl:w-40 xl:h-40",
  },
  {
    src: "/images/Hero/4.svg",
    alt: "Community connection",
    className:
      "absolute -bottom-4 -right-6 w-40 h-40 rotate-[20deg] rounded-2xl overflow-hidden shadow-lg xl:w-44 xl:h-44",
  },
];

const CheckIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="flex-shrink-0"
  >
    <circle cx="11" cy="11" r="11" fill="#FEE2E2" />
    <path
      d="M7 11L10 14L15 8"
      stroke="#E53E3E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface AboutSectionProps {
  id?: string;
}

export const AboutSection = ({ id }: AboutSectionProps) => (
  <section
    id={id}
    className="py-24 bg-gray-light relative overflow-hidden mobile:py-14"
    aria-labelledby="about-heading"
  >
    <div className="max-w-[1340px] mx-auto px-[5%] relative">
      {/* Decorative corner images — hidden below xl */}
      <div
        className="absolute inset-0 pointer-events-none hidden xl:block"
        aria-hidden="true"
      >
        {decorativeImages.map((img, idx) => (
          <div key={idx} className={img.className}>
            <Image src={img.src} alt={img.alt} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Centered content */}
      <div className="text-center max-w-2xl mx-auto relative z-10">
        <h2 id="about-heading" className="heading-1 mb-6 mobile:mb-4">
          {aboutContent.headline.prefix}{" "}
          <span className="text-primary italic font-[var(--font-outfit)]">
            {aboutContent.headline.highlight}
          </span>
        </h2>

        <p className="body-text text-lg leading-relaxed mb-8 mobile:text-base mobile:mb-6">
          {aboutContent.description}
        </p>

        {/* Feature pills */}
        <div className="flex justify-center gap-8 mb-10 flex-wrap mobile:flex-col mobile:items-center mobile:gap-3 mobile:mb-8">
          {aboutContent.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 font-open-sans font-semibold text-text"
            >
              <CheckIcon />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Link
          href={aboutContent.cta.href}
          className="inline-flex items-center gap-2.5 bg-primary hover:bg-red-700 text-white font-semibold py-3.5 px-10 rounded-full transition-colors shadow-sm"
        >
          {aboutContent.cta.text}
        </Link>
      </div>
    </div>
  </section>
);
