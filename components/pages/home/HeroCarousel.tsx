"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import DottedBox from "@/public/images/dotted_box.svg";

const COLLAGE_IMAGES = [
  { src: "/images/hero/4.jpg", alt: "Veteran finding new career" },
  { src: "/images/hero/5.jpg", alt: "Retiree at work" },
  { src: "/images/hero/6.jpg", alt: "Professional collaboration" },
] as const;

const CAROUSEL_INTERVAL_MS = 5000;

/**
 * The hero's rotating image column — the only part of the hero that needs
 * client JS. The copy column ships as server HTML (#52); this leaf carries
 * the rotation, hover/user pause, and the reduced-motion gate.
 */
export const HeroCarousel = () => {
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
  );
};
