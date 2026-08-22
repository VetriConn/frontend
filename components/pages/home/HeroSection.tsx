"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";
import DottedBox from "@/public/images/dotted_box.svg";
import Advert from "@/components/ui/Advert";

const COLLAGE_IMAGES = [
  { src: "/images/Hero/4.svg", alt: "Veteran finding new career" },
  { src: "/images/Hero/5.svg", alt: "Retiree at work" },
  { src: "/images/Hero/6.svg", alt: "Professional collaboration" },
] as const;

const CAROUSEL_INTERVAL_MS = 5000;

export const HeroSection = () => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const goToNextImage = useCallback(() => {
    setActiveImageIndex(
      (currentIndex) => (currentIndex + 1) % COLLAGE_IMAGES.length,
    );
  }, []);

  useEffect(() => {
    if (isCarouselPaused) {
      return;
    }

    const intervalId = window.setInterval(goToNextImage, CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [goToNextImage, isCarouselPaused]);

  return (
    <header className="pt-4 pb-12 md:pt-6 md:pb-20 lg:pb-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-[5%] md:px-6 mb-8 md:mb-12">
        <Advert />
      </div>

      {/* Decorative dots */}
      <div
        className="absolute top-10 left-[8%] w-3 h-3 rounded-full bg-amber-400 opacity-70 hidden md:block"
        aria-hidden="true"
      />
      <div
        className="absolute top-28 left-[3%] w-2 h-2 rounded-full bg-primary opacity-50 hidden md:block"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 left-[12%] w-2.5 h-2.5 rounded-full bg-primary opacity-40 hidden md:block"
        aria-hidden="true"
      />
      <div
        className="absolute top-16 right-[5%] w-2 h-2 rounded-full bg-amber-400 opacity-50 hidden md:block"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-12 right-[8%] w-3 h-3 rounded-full bg-primary opacity-50 hidden md:block"
        aria-hidden="true"
      />
      <div
        className="absolute top-[50%] right-[2%] w-2 h-2 rounded-full bg-pink-400 opacity-40 hidden md:block"
        aria-hidden="true"
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative max-w-7xl mx-auto px-[5%] md:px-6 md:text-left text-center">
        <div className="w-full md:w-1/2 max-w-lg relative">
          <DottedBox className="absolute top-0 -left-40 z-0 w-28 h-auto pointer-events-none md:block hidden" />
          <h1 className="font-lato text-3xl md:text-5xl lg:text-6xl leading-[1.1] font-bold text-text mb-6">
            Reconnecting{" "}
            <span className="italic font-[var(--font-outfit)] underline decoration-primary decoration-2 underline-offset-4">
              retirees
            </span>{" "}
            and{" "}
            <span className="italic font-[var(--font-outfit)] underline decoration-primary decoration-2 underline-offset-4">
              veterans
            </span>{" "}
            through <span className="text-primary">purposeful work</span>
          </h1>
          <p className="font-open-sans text-subtitle text-text-muted mb-2 max-w-[80%] md:max-w-full mx-auto md:mx-0 text-sm md:text-base">
            From careers to causes, we connect you to purposeful opportunities
            quickly, easily, and on your terms
          </p>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-4 w-full md:w-auto">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-full py-3.5 px-8 transition-all shadow-sm hover:bg-red-700 w-full md:w-auto text-center group"
            >
              Get Started
              <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Right — Hero image carousel */}
        <div
          className="relative w-full md:w-1/2 max-w-2xl h-80 md:h-[455px]"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
          aria-label="Homepage hero image carousel"
        >
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
            className="absolute left-[45%] bottom-[42%] w-3 h-3 rounded-full bg-primary z-[5] hidden md:block"
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
