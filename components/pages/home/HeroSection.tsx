"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BrushUnderline from "@/components/ui/BrushUnderline";
import { HiOutlineArrowRight } from "react-icons/hi2";
import DottedBox from "@/public/images/dotted_box.svg";

const COLLAGE_IMAGES = [
  { src: "/images/hero/4.jpg", alt: "Veteran finding new career" },
  { src: "/images/hero/5.jpg", alt: "Retiree at work" },
  { src: "/images/hero/6.jpg", alt: "Professional collaboration" },
] as const;

const CAROUSEL_INTERVAL_MS = 5000;

export const HeroSection = () => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Hover-pause and the user's explicit pause are separate: leaving the
  // carousel with the mouse must not restart a rotation someone stopped.
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);

  const goToNextImage = useCallback(() => {
    setActiveImageIndex(
      (currentIndex) => (currentIndex + 1) % COLLAGE_IMAGES.length,
    );
  }, []);

  useEffect(() => {
    if (isHoverPaused || isUserPaused) {
      return;
    }
    // A reduced-motion request means no auto-rotation at all — the rest of
    // the page's motion already respects this; the carousel was the outlier.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const intervalId = window.setInterval(goToNextImage, CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [goToNextImage, isHoverPaused, isUserPaused]);

  return (
    <header className="bg-white relative overflow-hidden flex items-center py-12 md:py-16 lg:min-h-[82vh]">
      {/* Decorative dots */}

      {/* Top-left, in the band above the headline. It previously hung off the
          copy column at -left-40, outside the section's overflow bounds, so the
          grid was cut off; anchoring it to the hero and lifting it clear of the
          first line keeps the whole grid visible without touching the type. */}
      <DottedBox
        className="absolute top-4 lg:top-6 left-6 lg:left-10 z-0 w-24 lg:w-28 h-auto pointer-events-none hidden md:block"
        aria-hidden="true"
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 relative w-full max-w-[1600px] mx-auto px-[5%] md:px-10 lg:px-14 lg:text-left text-center">
        <div className="w-full lg:w-[47%] max-w-2xl relative">
          {/* One emphasis device. The words carried italic AND an underline AND
              a colour before - and the underline read as a link. */}
          <h1 className="font-lato text-[clamp(2.25rem,1.2rem+3.6vw,3.25rem)] xl:text-[clamp(2.5rem,1.2rem+3vw,4.25rem)] leading-[1.05] tracking-[-0.025em] font-bold text-text mb-6">
            Reconnecting <BrushUnderline>retirees</BrushUnderline> and{" "}
            <BrushUnderline>veterans</BrushUnderline> through{" "}
            <span className="text-primary">purposeful work</span>
          </h1>

          <p className="font-open-sans text-gray-600 mb-7 max-w-[46ch] mx-auto lg:mx-0 text-base md:text-lg leading-relaxed">
            From careers to causes, we connect you to purposeful opportunities
            quickly, easily, and on your terms.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-auto justify-center lg:justify-start">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-full py-3.5 px-8 min-h-[52px] transition-colors shadow-sm hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 w-full sm:w-auto text-center group no-underline whitespace-nowrap"
            >
              Get Started
              <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
            </Link>
            {/* Somewhere to go for the visitor who wants to look before
                committing to an account. */}
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold rounded-full py-3.5 px-8 min-h-[52px] border border-gray-300 transition-colors hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 w-full sm:w-auto text-center no-underline whitespace-nowrap"
            >
              Browse jobs
            </Link>
          </div>

          {/* What's on offer, stated rather than decorated. Pills and ticks
              turn four plain words into four boxed UI objects competing with
              the CTAs; a tracked line reads as a caption and lets the buttons
              stay the loudest thing in the column. */}
          <div className="mt-8 max-w-lg mx-auto lg:mx-0">
            <p className="meta-list flex flex-wrap items-center justify-center lg:justify-start gap-y-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-gray-500">
              {["Part-time", "Full-time", "Volunteer", "Remote & on-site"].map(
                (item) => (
                  <span key={item}>{item}</span>
                ),
              )}
            </p>
          </div>

          {/* Employers lead in behind job seekers rather than being stranded.
              No counts here until the numbers are worth stating. */}
          <div className="mt-5">
            <Link
              href="/dashboard/post-job"
              className="inline-flex items-center min-h-[44px] text-sm font-semibold text-gray-600 hover:text-primary transition-colors no-underline"
            >
              Hiring? Post a job
            </Link>
          </div>
        </div>

        {/* Right — Hero image carousel */}
        <div
          className="group relative w-full lg:w-[50%] max-w-3xl h-[clamp(260px,46vh,420px)] lg:h-[min(620px,66vh)]"
          onMouseEnter={() => setIsHoverPaused(true)}
          onMouseLeave={() => setIsHoverPaused(false)}
          role="region"
          aria-roledescription="carousel"
          aria-label="Photos of people at work"
        >
          {/* Out of sight until the carousel is hovered or the button is
              keyboard-focused — but never hidden while paused, or the resume
              control would vanish. Still tappable and tabbable throughout. */}
          <button
            type="button"
            onClick={() => setIsUserPaused((paused) => !paused)}
            aria-pressed={isUserPaused}
            className={`absolute bottom-3 left-3 z-10 w-11 h-11 rounded-full bg-white/90 shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-primary transition-[color,opacity] focus-visible:opacity-100 ${
              isUserPaused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            aria-label={
              isUserPaused ? "Resume image rotation" : "Pause image rotation"
            }
          >
            {isUserPaused ? (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.34-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.84Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
              </svg>
            )}
          </button>
          {/* Maple leaf watermark */}
          <div
            className="absolute bottom-2 right-2 w-28 h-28 rounded-lg bg-[url('/favicon.svg')] bg-no-repeat bg-center bg-contain z-[1] opacity-80 hidden md:block"
            aria-hidden="true"
          />

          {/* Dotted box decoration */}
          <DottedBox
            className="absolute -bottom-8 -right-20 z-[5] w-28 h-auto pointer-events-none hidden md:block"
            aria-hidden="true"
          />

          {/* Carousel frame */}
          <div className="absolute inset-0 md:inset-2 rounded-2xl overflow-hidden shadow-xl z-4 bg-white">
            {COLLAGE_IMAGES.map((image, index) => (
              <div
                key={image.src}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === activeImageIndex
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
                aria-hidden={index !== activeImageIndex}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover w-full h-full"
                  sizes="(max-width: 850px) 92vw, 40vw"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* Decorative accents near images */}
          <div
            className="absolute -right-3 top-[45%] w-4 h-4 rounded-full bg-amber-400 z-[5] hidden md:block"
            aria-hidden="true"
          />
          <div
            className="absolute -left-4 top-[35%] w-2.5 h-2.5 rounded-full bg-pink-400 opacity-60 z-[5] hidden md:block"
            aria-hidden="true"
          />
          <div
            className="absolute right-[20%] -top-3 w-2 h-2 rounded-full bg-primary opacity-50 z-[5] hidden md:block"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
};
