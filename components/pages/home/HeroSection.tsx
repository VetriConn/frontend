"use client";
import Image from "next/image";
import Link from "next/link";
import DottedBox from "@/public/images/dotted_box.svg";
import Advert from "@/components/ui/Advert";

const COLLAGE_IMAGES = [
  { src: "/images/Hero/4.svg", alt: "Veteran finding new career" },
  { src: "/images/Hero/5.svg", alt: "Retiree at work" },
  { src: "/images/Hero/6.svg", alt: "Professional collaboration" },
] as const;

export const HeroSection = () => {
  return (
    <header className="px-[5%] py-4 pb-16 bg-white relative overflow-hidden mobile:px-[5%] mobile:py-1.5 mobile:pb-8 mobile:min-h-auto">
      <div className="max-w-[1340px] mx-auto">
        <Advert />
      </div>

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
        <div className="flex-[0_0_45%] max-w-[500px] relative mobile:flex-none mobile:w-full mobile:mx-auto mobile:max-w-full">
          <DottedBox className="absolute top-0 -left-[150px] z-0 w-[100px] h-auto pointer-events-none mobile:w-[70px] mobile:-top-10 mobile:left-0" />
          <h1 className="font-lato text-[52px] leading-[1.1] font-bold text-text mb-6 mobile:text-[32px] mobile:mb-4">
            Reconnecting{" "}
            <span className="italic font-[var(--font-outfit)] text-[0.85em] underline decoration-primary decoration-2 underline-offset-4">
              retirees
            </span>{" "}
            and{" "}
            <span className="italic font-[var(--font-outfit)] text-[0.85em] underline decoration-primary decoration-2 underline-offset-4">
              veterans
            </span>{" "}
            through <span className="text-primary">purposeful work</span>
          </h1>
          <p className="font-open-sans text-subtitle text-text-muted mb-2 max-w-[80%] text-base mobile:text-sm mobile:mb-2 mobile:max-w-full">
            From careers to causes, we connect you to purposeful opportunities
            quickly, easily, and on your terms
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2.5 bg-primary text-white font-open-sans font-semibold border-none rounded-full py-3.5 px-10 cursor-pointer transition-colors shadow-none hover:bg-primary-hover mobile:w-full mobile:py-3.5 mobile:px-4 mobile:justify-center mt-4 text-center"
          >
            Get Started
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>

        {/* Right — Image collage with Vetriconn logo background */}
        <div className="relative flex-[0_0_auto] w-[650px] max-w-[650px] h-[455px] mobile:flex-none mobile:w-full mobile:max-w-full mobile:h-[300px]">
          {/* Maple leaf watermark */}
          <div
            className="absolute bottom-2 right-2 w-[100px] h-[100px] rounded-[10px] bg-[url('/favicon.svg')] bg-no-repeat bg-center bg-contain z-[1] opacity-80 mobile:hidden"
            aria-hidden="true"
          />

          {/* Dotted box decoration */}
          <DottedBox
            className="absolute -bottom-[30px] -right-[70px] z-[5] w-[100px] h-auto pointer-events-none"
            aria-hidden="true"
          />

          {/* Image 1 — top-left */}
          <div className="absolute left-0 top-0 w-[48%] h-[55%] -rotate-3 rounded-2xl overflow-hidden shadow-lg z-[3]">
            <Image
              src={COLLAGE_IMAGES[0].src}
              alt={COLLAGE_IMAGES[0].alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              priority
            />
          </div>

          {/* Image 2 — top-right */}
          <div className="absolute right-0 top-2 w-[48%] h-[55%] rotate-3 rounded-2xl overflow-hidden shadow-lg z-[4]">
            <Image
              src={COLLAGE_IMAGES[1].src}
              alt={COLLAGE_IMAGES[1].alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              priority
            />
          </div>

          {/* Image 3 — bottom-center */}
          <div className="absolute left-[15%] bottom-0 w-[52%] h-[50%] rotate-2 rounded-2xl overflow-hidden shadow-lg z-[5]">
            <Image
              src={COLLAGE_IMAGES[2].src}
              alt={COLLAGE_IMAGES[2].alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 30vw"
              priority
            />
          </div>

          {/* Decorative accents near images */}
          <div
            className="absolute -right-3 top-[45%] w-4 h-4 rounded-full bg-amber-400 z-[5]"
            aria-hidden="true"
          />
          <div
            className="absolute left-[45%] bottom-[42%] w-3 h-3 rounded-full bg-primary z-[5]"
            aria-hidden="true"
          />
          <div
            className="absolute -left-4 top-[35%] w-2.5 h-2.5 rounded-full bg-pink-400 opacity-60 z-[5]"
            aria-hidden="true"
          />
          <div
            className="absolute right-[20%] -top-3 w-2 h-2 rounded-full bg-primary opacity-50 z-[5]"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
};
