"use client";

import { ReactNode } from "react";
import Image from "next/image";

interface Benefit {
  icon: ReactNode;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

// SVG Icons as components
const ConvenienceIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="24" fill="#FEE2E2" />
    <path
      d="M24 14V24L30 27"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 34C29.5228 34 34 29.5228 34 24C34 18.4772 29.5228 14 24 14C18.4772 14 14 18.4772 14 24C14 29.5228 18.4772 34 24 34Z"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ConnectedIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="24" fill="#FEE2E2" />
    <path
      d="M20 28C20 28 21.5 30 24 30C26.5 30 28 28 28 28"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 21H21.01"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27 21H27.01"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 34C29.5228 34 34 29.5228 34 24C34 18.4772 29.5228 14 24 14C18.4772 14 14 18.4772 14 24C14 29.5228 18.4772 34 24 34Z"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CommunityIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="24" fill="#FEE2E2" />
    <path
      d="M30 32V30C30 28.9391 29.5786 27.9217 28.8284 27.1716C28.0783 26.4214 27.0609 26 26 26H22C20.9391 26 19.9217 26.4214 19.1716 27.1716C18.4214 27.9217 18 28.9391 18 30V32"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 22C26.2091 22 28 20.2091 28 18C28 15.7909 26.2091 14 24 14C21.7909 14 20 15.7909 20 18C20 20.2091 21.7909 22 24 22Z"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M35 32V30C34.9993 29.1137 34.7044 28.2528 34.1614 27.5523C33.6184 26.8519 32.8581 26.3516 32 26.13"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M29 14.13C29.8604 14.3503 30.623 14.8507 31.1676 15.5523C31.7122 16.2539 32.0078 17.1168 32.0078 18.005C32.0078 18.8932 31.7122 19.7561 31.1676 20.4577C30.623 21.1593 29.8604 21.6597 29 21.88"
      stroke="#E53E3E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const benefits: Benefit[] = [
  {
    icon: <ConvenienceIcon />,
    title: "More Convenient",
    description:
      "Vetriconn's intuitive, user-friendly platform makes it simple to create a profile and apply for jobs, saving time and reducing stress. Whether you're looking for part-time work, volunteer opportunities, or ways to stay engaged, we help you connect with meaningful roles quickly and effortlessly.",
    image: "/images/jobs_hero3.jpg",
    imageAlt: "Easy and convenient job searching",
  },
  {
    icon: <ConnectedIcon />,
    title: "More Connected",
    description:
      "With personalized job alerts and tailored opportunity notifications, users receive updates that align with their skills, preferences, and interests. Vetriconn goes beyond generic listings—our platform curates opportunities specifically suited to your experience and lifestyle.",
    image: "/images/Hero/8.svg",
    imageAlt: "Connected professionals collaborating",
  },
  {
    icon: <CommunityIcon />,
    title: "Stronger Communities",
    description:
      "By connecting retirees and veterans with purposeful work and volunteer opportunities, we help strengthen communities. Organizations gain valuable experienced support, while our users find purpose, income, and connection—creating a true win-win for everyone.",
    image: "/images/Hero/2.svg",
    imageAlt: "Building stronger communities together",
  },
];

interface BenefitsSectionProps {
  id?: string;
}

export const BenefitsSection = ({ id }: BenefitsSectionProps) => (
  <section
    id={id}
    className="py-20 bg-gray-bg mobile:py-12 relative overflow-hidden"
    aria-labelledby="benefits-heading"
  >
    {/* Decorative dots */}
    <div
      className="absolute top-10 left-[5%] w-3 h-3 rounded-full bg-primary opacity-40"
      aria-hidden="true"
    />
    <div
      className="absolute top-20 right-[6%] w-2.5 h-2.5 rounded-full bg-amber-400 opacity-50"
      aria-hidden="true"
    />
    <div
      className="absolute bottom-14 left-[8%] w-2 h-2 rounded-full bg-amber-400 opacity-40"
      aria-hidden="true"
    />
    <div
      className="absolute bottom-20 right-[4%] w-3 h-3 rounded-full bg-primary opacity-30"
      aria-hidden="true"
    />
    <div
      className="absolute top-[50%] left-[2%] w-2 h-2 rounded-full bg-pink-400 opacity-30"
      aria-hidden="true"
    />

    <div className="container-main relative z-10">
      {/* Headline */}
      <div className="text-center max-w-3xl mx-auto mb-16 mobile:mb-10">
        <h2 id="benefits-heading" className="heading-1 mb-5 mobile:mb-4">
          Why Choose <span className="text-primary">Vetriconn</span>?
        </h2>
        <p className="body-text text-lg mobile:text-base">
          Discover how our platform makes finding meaningful opportunities
          easier, more personalized, and more impactful for retirees and
          veterans across Canada.
        </p>
      </div>

      {/* Benefit rows — alternating image + text */}
      <div className="flex flex-col gap-20 max-w-[1100px] mx-auto mobile:gap-14">
        {benefits.map((benefit, idx) => {
          const isReversed = idx % 2 !== 0;
          return (
            <article
              key={idx}
              className={`grid grid-cols-2 gap-12 items-center mobile:grid-cols-1 mobile:gap-8 ${isReversed ? "direction-rtl" : ""}`}
            >
              {/* Image */}
              <div
                className={`relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-lg ${isReversed ? "mobile:order-1 order-2" : "order-1"}`}
              >
                <Image
                  src={benefit.image}
                  alt={benefit.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Text */}
              <div
                className={`${isReversed ? "mobile:order-2 order-1" : "order-2"}`}
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="font-lato text-[26px] font-bold text-text mb-3 leading-tight mobile:text-xl">
                  {benefit.title}
                </h3>
                <p className="font-open-sans text-base text-text-muted leading-relaxed m-0">
                  {benefit.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);
