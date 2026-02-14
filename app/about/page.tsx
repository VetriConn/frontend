"use client";

import Image from "next/image";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import DottedBox from "@/public/images/dotted_box.svg";

// ── Data ─────────────────────────────────────────────────────────────

const commitments = [
  "Featuring job postings tailored specifically for retirees and veterans.",
  "Automating job matches based on individual experience and interests.",
  "Offering hands-on support with resume building and application processes.",
  "Promoting opportunities for community involvement and volunteer work.",
];

const benefits = [
  {
    title: "More Convenient",
    description:
      "Create a profile, browse jobs, and apply in minutes. Our streamlined platform saves you time so you can focus on what matters.",
    icon: (
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
    ),
    cta: "Get Started",
    href: "/signup",
  },
  {
    title: "More Connected",
    description:
      "Receive personalized job alerts and curated opportunities that match your skills, experience, and lifestyle.",
    icon: (
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
    ),
    cta: "Learn More",
    href: "/jobs",
  },
  {
    title: "Stronger Communities",
    description:
      "Organizations gain experienced talent. You gain purpose, income, and connection — a true win-win for Canada.",
    icon: (
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
    ),
    cta: "Browse Jobs",
    href: "/jobs",
  },
];

// ── Check Icon ───────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="flex-shrink-0 mt-0.5"
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

// ── Decorative Images ────────────────────────────────────────────────

const heroImages = [
  { src: "/images/Hero/4.svg", alt: "Veteran finding new career" },
  { src: "/images/Hero/5.svg", alt: "Retiree at work" },
  { src: "/images/Hero/6.svg", alt: "Professional collaboration" },
];

// ── Page ─────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white">
        <Header />
      </div>

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="px-[5%] py-4 pb-16 bg-white relative overflow-hidden mobile:px-[5%] mobile:py-1.5 mobile:pb-8">
        {/* Decorative dots */}
        <div
          className="absolute top-10 left-[8%] w-3 h-3 rounded-full bg-amber-400 opacity-70"
          aria-hidden="true"
        />
        <div
          className="absolute top-28 left-[3%] w-2 h-2 rounded-full bg-primary opacity-50"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-20 left-[12%] w-2.5 h-2.5 rounded-full bg-primary opacity-40"
          aria-hidden="true"
        />
        <div
          className="absolute top-16 right-[5%] w-2 h-2 rounded-full bg-amber-400 opacity-50"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-12 right-[8%] w-3 h-3 rounded-full bg-primary opacity-50"
          aria-hidden="true"
        />
        <div
          className="absolute top-[50%] right-[2%] w-2 h-2 rounded-full bg-pink-400 opacity-40"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-8 relative max-w-[1340px] mx-auto p-8 mobile:flex-col mobile:text-center mobile:gap-6 mobile:mt-4 mobile:p-4 mobile:pt-8">
          {/* Left — Text */}
          <div className="flex-[0_0_45%] max-w-[500px] relative mobile:flex-none mobile:w-full mobile:mx-auto mobile:max-w-full">
            <DottedBox
              className="absolute top-0 -left-[150px] z-0 w-[100px] h-auto pointer-events-none mobile:w-[70px] mobile:-top-10 mobile:left-0"
              aria-hidden="true"
            />

            <h1 className="font-lato text-[52px] leading-[1.1] font-bold text-text mb-6 mobile:text-[32px] mobile:mb-4">
              About <span className="text-primary">Vetriconn</span>
            </h1>
            <p className="font-open-sans text-subtitle text-text-muted mb-2 max-w-[90%] text-base mobile:text-sm mobile:mb-2 mobile:max-w-full leading-relaxed">
              Strengthening the Canadian workforce by reconnecting retirees and
              veterans with flexible work, volunteer, and remote opportunities.
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 bg-primary hover:bg-red-700 text-white font-semibold py-3.5 px-8 rounded-full transition-colors shadow-sm mt-4"
            >
              Get Started
              <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Right — Image collage */}
          <div className="relative flex-[0_0_auto] w-[650px] max-w-[650px] h-[455px] mobile:flex-none mobile:w-full mobile:max-w-full mobile:h-[300px]">
            <DottedBox
              className="absolute -bottom-[30px] -right-[70px] z-[3] w-[100px] h-auto pointer-events-none"
              aria-hidden="true"
            />

            {/* Maple leaf watermark */}
            <div
              className="absolute bottom-2 right-2 w-[100px] h-[100px] rounded-[10px] bg-[url('/favicon.svg')] bg-no-repeat bg-center bg-contain z-[1] opacity-80 mobile:hidden"
              aria-hidden="true"
            />

            <div className="absolute left-0 top-0 w-[48%] h-[55%] -rotate-3 rounded-2xl overflow-hidden shadow-lg z-[3]">
              <Image
                src={heroImages[0].src}
                alt={heroImages[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
            </div>
            <div className="absolute right-0 top-2 w-[48%] h-[55%] rotate-3 rounded-2xl overflow-hidden shadow-lg z-[4]">
              <Image
                src={heroImages[1].src}
                alt={heroImages[1].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
            </div>
            <div className="absolute left-[15%] bottom-0 w-[52%] h-[50%] rotate-2 rounded-2xl overflow-hidden shadow-lg z-[5]">
              <Image
                src={heroImages[2].src}
                alt={heroImages[2].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 30vw"
                priority
              />
            </div>

            <div
              className="absolute -right-3 top-[45%] w-4 h-4 rounded-full bg-amber-400 z-[6]"
              aria-hidden="true"
            />
            <div
              className="absolute left-[45%] bottom-[42%] w-3 h-3 rounded-full bg-primary z-[6]"
              aria-hidden="true"
            />
            <div
              className="absolute -left-4 top-[35%] w-2.5 h-2.5 rounded-full bg-pink-400 opacity-60 z-[6]"
              aria-hidden="true"
            />
            <div
              className="absolute right-[20%] -top-3 w-2 h-2 rounded-full bg-primary opacity-50 z-[6]"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* ─── Mission Section ──────────────────────────────────────── */}
      <section className="py-20 bg-white relative overflow-hidden mobile:py-14">
        <div className="max-w-[1340px] mx-auto px-[5%]">
          {/* Two-column: text left, image right */}
          <div className="grid grid-cols-2 gap-16 items-center mobile:grid-cols-1 mobile:gap-10">
            {/* Left — Text */}
            <div className="relative">
              <DottedBox
                className="absolute -top-6 -left-10 w-16 h-auto pointer-events-none opacity-40 mobile:hidden"
                aria-hidden="true"
              />
              <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4 font-open-sans">
                Our Mission
              </p>
              <h2 className="font-lato text-[38px] leading-[1.15] font-bold text-text mb-6 mobile:text-[28px]">
                Reconnecting experience{" "}
                <span className="text-primary italic font-[var(--font-outfit)] text-[0.9em]">
                  with opportunity
                </span>
              </h2>
              <p className="font-open-sans text-base text-text-muted leading-relaxed mb-6">
                At Vetriconn, our mission is to strengthen the Canadian
                workforce and economy by reconnecting Canadian retirees and
                veterans with flexible work, volunteer, and remote
                opportunities. We believe in offering renewed purpose,
                engagement, and community for those transitioning from full-time
                service into retirement.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Part-time positions",
                  "Full-time roles",
                  "Volunteer opportunities",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 font-open-sans text-base text-text"
                  >
                    <CheckIcon />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Image */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg mobile:aspect-[16/10]">
              <Image
                src="/images/Hero/7.svg"
                alt="Community of veterans and retirees"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Commitments Section ──────────────────────────────────── */}
      <section className="py-20 bg-gray-light relative overflow-hidden mobile:py-14">
        <div className="max-w-[1340px] mx-auto px-[5%]">
          {/* Two-column: image left, text right */}
          <div className="grid grid-cols-2 gap-16 items-center mobile:grid-cols-1 mobile:gap-10">
            {/* Left — Image */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg mobile:order-2 mobile:aspect-[16/10]">
              <Image
                src="/images/Hero/1.svg"
                alt="Meaningful employment opportunities"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Right — Text */}
            <div className="relative mobile:order-1">
              <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4 font-open-sans">
                Our Commitment
              </p>
              <h2 className="font-lato text-[38px] leading-[1.15] font-bold text-text mb-6 mobile:text-[28px]">
                Making workforce re-entry{" "}
                <span className="text-primary italic font-[var(--font-outfit)] text-[0.9em]">
                  smooth &amp; fulfilling
                </span>
              </h2>
              <div className="flex flex-col gap-4">
                {commitments.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 font-open-sans text-base text-text-muted leading-relaxed"
                  >
                    <CheckIcon />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="font-open-sans text-base text-text-muted leading-relaxed mt-6 pt-6 border-t border-gray-200">
                By helping retirees and veterans find purpose, income, and
                connection, Vetriconn contributes to closing labour gaps and
                building a stronger, more inclusive Canadian workforce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Benefits Section ─────────────────────────────────────── */}
      <section className="py-20 bg-white relative overflow-hidden mobile:py-14">
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

        <div className="max-w-[1340px] mx-auto px-[5%] relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14 mobile:mb-10">
            <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-4 font-open-sans">
              Why Vetriconn
            </p>
            <h2 className="heading-1 mb-5 mobile:mb-4">
              Benefits of Using{" "}
              <span className="text-primary italic font-[var(--font-outfit)] text-[0.9em]">
                Vetriconn
              </span>
            </h2>
            <p className="body-text text-lg mobile:text-base">
              Discover how our platform makes finding meaningful opportunities
              easier, more personalized, and more impactful.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 mobile:grid-cols-1 mobile:gap-6">
            {benefits.map((benefit, idx) => (
              <article key={idx} className="flex flex-col">
                <div className="mb-5">{benefit.icon}</div>
                <h3 className="font-lato text-lg font-bold text-text mb-3">
                  {benefit.title}
                </h3>
                <p className="font-open-sans text-[15px] text-text-muted leading-relaxed mb-5 flex-1">
                  {benefit.description}
                </p>
                <Link
                  href={benefit.href}
                  className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:text-red-700 transition-colors font-open-sans"
                >
                  {benefit.cta}
                  <HiOutlineArrowRight
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-16 bg-gray-light mobile:py-12">
        <div className="max-w-[1340px] mx-auto px-[5%] text-center">
          <h2 className="heading-1 mb-4 mobile:mb-3">
            Ready to{" "}
            <span className="text-primary italic font-[var(--font-outfit)]">
              Get Started
            </span>
            ?
          </h2>
          <p className="body-text text-lg max-w-2xl mx-auto mb-8 mobile:text-base mobile:mb-6">
            Join thousands of Canadian retirees and veterans who are finding
            purpose, income, and connection through Vetriconn.
          </p>
          <div className="flex items-center justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary hover:bg-red-700 text-white font-semibold py-3.5 px-10 rounded-full transition-colors shadow-sm"
            >
              Create Your Free Account
              <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
