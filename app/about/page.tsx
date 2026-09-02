"use client";

import Image from "next/image";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import DottedBox from "@/public/images/dotted_box.svg";
import Eyebrow from "@/components/ui/Eyebrow";

// ── Data ─────────────────────────────────────────────────────────────

const commitments = [
  "Featuring job postings tailored specifically for retirees and veterans.",
  "Automating job matches based on individual experience and interests.",
  "Offering hands-on support with resume building and application processes.",
  "Promoting opportunities for community involvement and volunteer work.",
];

const benefits = [
  {
    title: "One profile, every application",
    description:
      "Fill in your details once. Apply to any role with the same profile - no starting over each time.",
    cta: "Get Started",
    href: "/signup",
  },
  {
    title: "Roles that come to you",
    description:
      "Tell us the work and hours you want. Matching jobs arrive as they're posted.",
    cta: "Learn More",
    href: "/jobs",
  },
  {
    title: "Paid work and volunteering",
    description:
      "Full-time, part-time, and volunteer placements from Canadian organisations that want experienced people.",
    cta: "Browse Jobs",
    href: "/jobs",
  },
];

// ── Check Icon ───────────────────────────────────────────────────────


// ── Decorative Images ────────────────────────────────────────────────

const heroImages = [
  { src: "/images/hero/2.jpg", alt: "Veteran finding new career" },
  { src: "/images/hero/3.jpg", alt: "Retiree at work" },
  { src: "/images/hero/8.jpg", alt: "Professional collaboration" },
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
      <section className="px-[5%] md:px-6 py-4 pb-16 bg-white relative overflow-hidden mobile:px-[5%] mobile:py-1.5 mobile:pb-8">
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

        {/* Anchored to the section, not the column — at -left-[150px] the grid
            clipped against overflow-hidden, the bug fixed on home and /jobs. */}
        <DottedBox
          className="absolute top-6 left-6 lg:left-10 z-0 w-24 lg:w-28 h-auto pointer-events-none hidden md:block"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-8 relative max-w-[1600px] mx-auto p-8 md:px-10 lg:px-14 mobile:flex-col mobile:text-center mobile:gap-6 mobile:mt-4 mobile:p-4 mobile:pt-8">
          {/* Left — Text */}
          <div className="flex-[0_0_45%] max-w-[500px] relative mobile:flex-none mobile:w-full mobile:mx-auto mobile:max-w-full">
            <h1 className="heading-1 mb-6 mobile:mb-4">
              About <span className="text-primary">Vetriconn</span>
            </h1>
            <p className="font-open-sans text-subtitle text-text-muted mb-2 max-w-[90%] text-base mobile:text-sm mobile:mb-2 mobile:max-w-full leading-relaxed">
              Strengthening the Canadian workforce by reconnecting retirees and
              veterans with flexible work, volunteer, and remote opportunities.
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 px-8 min-h-[52px] rounded-full transition-colors shadow-sm group no-underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 mt-4"
            >
              Get Started
              <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
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
              className="absolute bottom-2 right-2 w-[100px] h-[100px] rounded-lg bg-[url('/favicon.svg')] bg-no-repeat bg-center bg-contain z-[1] opacity-80 mobile:hidden"
              aria-hidden="true"
            />

            <div className="absolute left-0 top-0 w-[48%] h-[55%] -rotate-3 rounded-2xl overflow-hidden shadow-lg z-[3]">
              <Image
                src={heroImages[0].src}
                alt={heroImages[0].alt}
                fill
                className="object-cover w-full h-auto"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
            </div>
            <div className="absolute right-0 top-2 w-[48%] h-[55%] rotate-3 rounded-2xl overflow-hidden shadow-lg z-[4]">
              <Image
                src={heroImages[1].src}
                alt={heroImages[1].alt}
                fill
                className="object-cover w-full h-auto"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
            </div>
            <div className="absolute left-[15%] bottom-0 w-[52%] h-[50%] rotate-2 rounded-2xl overflow-hidden shadow-lg z-[5]">
              <Image
                src={heroImages[2].src}
                alt={heroImages[2].alt}
                fill
                className="object-cover w-full h-auto"
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
        <div className="max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14">
          {/* Two-column: text left, image right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 items-center">
            {/* Left — Text */}
            <div className="relative">
              <DottedBox
                className="absolute -top-6 -left-10 w-16 h-auto pointer-events-none opacity-40 mobile:hidden"
                aria-hidden="true"
              />
              <Eyebrow>Our Mission</Eyebrow>
              <h2 className="heading-2 mb-6">
                Reconnecting experience{" "}
                <span className="text-primary">
                  with opportunity
                </span>
              </h2>
              <p className="body-text text-lg mobile:text-base leading-relaxed mb-6">
                At Vetriconn, our mission is to strengthen the Canadian
                workforce and economy by reconnecting Canadian retirees and
                veterans with flexible work, volunteer, and remote
                opportunities. We believe in offering renewed purpose,
                engagement, and community for those transitioning from full-time
                service into retirement.
              </p>
              <p className="meta-list flex flex-wrap items-center gap-y-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                {["Part-time", "Full-time", "Volunteer"].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </p>
            </div>

            {/* Right — Image */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg mobile:aspect-[16/10]">
              <Image
                src="/images/hero/7.jpg"
                alt="Community of veterans and retirees"
                fill
                className="object-cover w-full h-auto"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Commitments Section ──────────────────────────────────── */}
      <section className="py-20 bg-gray-light relative overflow-hidden mobile:py-14">
        <div className="max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14">
          {/* Two-column: image left, text right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 items-center">
            {/* Left — Image */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg mobile:order-2 mobile:aspect-[16/10]">
              <Image
                src="/images/hero/1.jpg"
                alt="Meaningful employment opportunities"
                fill
                className="object-cover w-full h-auto"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>

            {/* Right — Text */}
            <div className="relative mobile:order-1">
              <Eyebrow>Our Commitment</Eyebrow>
              <h2 className="heading-2 mb-6">
                Making workforce re-entry{" "}
                <span className="text-primary">
                  smooth &amp; fulfilling
                </span>
              </h2>
              <div className="flex flex-col gap-4">
                {commitments.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 font-open-sans text-base text-text-muted leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"
                    />
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

        <div className="max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14 mobile:mb-10">
            <Eyebrow>Why Vetriconn</Eyebrow>
            <h2 className="heading-1 mb-5 mobile:mb-4">
              What you get with{" "}
              <span className="text-primary">Vetriconn</span>
            </h2>
            <p className="body-text text-lg mobile:text-base">
              Discover how our platform makes finding meaningful opportunities
              easier, more personalized, and more impactful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {benefits.map((benefit, idx) => (
              <article key={idx} className="group flex flex-col">
                {/* Grows toward half the column when the card is hovered —
                    width only, so nothing around it shifts. */}
                <span
                  aria-hidden="true"
                  className="block mb-5 h-1 w-10 rounded-full bg-primary/70 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-1/2 motion-reduce:transition-none"
                />
                <h3 className="heading-3 mb-3">
                  {benefit.title}
                </h3>
                <p className="font-open-sans text-sm md:text-base text-text-muted leading-relaxed mb-5 flex-1">
                  {benefit.description}
                </p>
                <Link
                  href={benefit.href}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-red-700 transition-all font-open-sans group"
                >
                  {benefit.cta}
                  <HiOutlineArrowRight
                    className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45"
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
        <div className="max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14 text-center">
          <h2 className="heading-1 mb-4 mobile:mb-3">
            Ready to <span className="text-primary">get started</span>?
          </h2>
          <p className="body-text text-lg max-w-2xl mx-auto mb-8 mobile:text-base mobile:mb-6">
            Join thousands of Canadian retirees and veterans who are finding
            purpose, income, and connection through Vetriconn.
          </p>
          <div className="flex items-center justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 px-8 min-h-[52px] rounded-full transition-colors shadow-sm group no-underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              Create Your Free Account
              <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
