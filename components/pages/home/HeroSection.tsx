"use client";
import Image from "next/image";
import Link from "next/link";
import DottedBox from "@/public/images/dotted_box.svg";
import Advert from "@/components/ui/Advert";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef, memo } from "react";


const CAROUSEL_IMAGES = [
  "/images/Hero/4.svg",
  "/images/Hero/5.svg",
  "/images/Hero/6.svg",
  "/images/Hero/7.svg",
  "/images/Hero/8.svg",
  "/images/Hero/1.svg",
  "/images/Hero/2.svg",
  "/images/Hero/3.svg",
] as const;

const CAROUSEL_INTERVAL = 5000;
const TRANSITION_DURATION = 1.8;

const imageVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const transition = { opacity: { duration: TRANSITION_DURATION, ease: "easeInOut" } } as const;

const useCarousel = (imageCount: number, interval: number) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPausedRef.current) {
        setCurrentIndex((prev) => (prev + 1) % imageCount);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [imageCount, interval]);

  const pause = useCallback(() => { isPausedRef.current = true; }, []);
  const resume = useCallback(() => { isPausedRef.current = false; }, []);

  return { currentIndex, pause, resume };
};

const HeroCarousel = memo(function HeroCarousel() {
  const { currentIndex, pause, resume } = useCarousel(CAROUSEL_IMAGES.length, CAROUSEL_INTERVAL);
  const nextIndex = (currentIndex + 1) % CAROUSEL_IMAGES.length;

  return (
    <div
      className="relative w-[650px] max-w-[650px] min-w-[650px] h-[455px] rounded-[10px] overflow-hidden z-[2] mobile:w-full mobile:max-w-full mobile:min-w-0 mobile:h-[250px]"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <link rel="preload" as="image" href={CAROUSEL_IMAGES[nextIndex]} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center [transform:rotateX(15deg)]"
        >
          <div className="relative w-full h-full rounded-[10px] overflow-hidden">
            <Image
              src={CAROUSEL_IMAGES[currentIndex]}
              alt={`Hero image ${currentIndex + 1}`}
              fill
              className="w-full h-full object-cover rounded-[10px]"
              priority={currentIndex === 0}
              loading={currentIndex === 0 ? "eager" : "lazy"}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export const HeroSection = () => {
  return (
    <header className="px-[5%] py-4 pb-0 bg-white relative overflow-hidden mobile:px-[5%] mobile:py-1.5 mobile:pb-4 mobile:min-h-auto ">
      <Advert />
      <div className="flex items-center justify-between gap-8 relative max-w-container mx-auto p-8 mobile:flex-col mobile:text-center mobile:gap-6 mobile:mt-4 mobile:p-4 mobile:pt-8">
        <div className="flex-[0_0_45%] max-w-[500px] relative mobile:flex-none mobile:w-full mobile:mx-auto mobile:max-w-full">
          <DottedBox className="absolute top-0 -left-[150px] z-0 w-[100px] h-auto pointer-events-none mobile:w-[70px] mobile:-top-10 mobile:left-0" />
          <h1 className="font-lato text-[52px] leading-[1.1] font-bold text-text mb-6 mobile:text-[32px] mobile:mb-4">
            Reconnecting <span className="italic font-[var(--font-outfit)] text-[0.85em] underline decoration-primary decoration-2 underline-offset-4">retirees</span> and <span className="italic font-[var(--font-outfit)] text-[0.85em] underline decoration-primary decoration-2 underline-offset-4">veterans</span> through{" "}
            <span className="text-primary">purposeful work</span>
          </h1>
          <p className="font-open-sans text-subtitle text-text-muted mb-2 max-w-[80%] text-base mobile:text-sm mobile:mb-2 mobile:max-w-full">
            From careers to causes, we connect you to purposeful opportunities quickly, easily, and on your terms
          </p>

          <Link 
            href="/signup"
            className="inline-block bg-primary text-white font-open-sans font-semibold border-none rounded-md py-4 px-12 cursor-pointer transition-colors shadow-none hover:bg-primary-hover mobile:w-full mobile:py-3.5 mobile:px-4 mt-4 text-center"
          >
            Sign Up
          </Link>
        </div>

        <div className="relative flex-[0_0_auto] flex w-[650px] max-w-[650px] justify-center items-center h-[455px] mobile:flex-none mobile:w-full mobile:max-w-full mobile:h-[250px] before:content-[''] before:absolute before:w-full before:max-w-[650px] before:h-[455px] before:top-5 before:-right-5 before:rounded-[10px] before:bg-primary before:bg-[url('/favicon-white.svg')] before:bg-no-repeat before:bg-center before:bg-[length:200px_200px] before:opacity-100 before:z-[1] before:[transform:rotateX(15deg)] mobile:before:hidden">
          <DottedBox className="absolute -bottom-[30px] -right-[70px] z-[3] w-[100px] h-auto pointer-events-none" />
          <HeroCarousel />
        </div>
      </div>
    </header>
  );
};
