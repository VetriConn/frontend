"use client";
import React, { useState } from "react";
import Link from "next/link";
import { IoIosClose } from "react-icons/io";
import clsx from "clsx";

const Advert = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className={clsx("flex bg-[#DD342E1F] text-[#DD342E] rounded-lg py-0.5 px-6 items-center justify-between gap-4 mobile:px-3 mobile:py-2 mobile:gap-2")}>
      <p className="flex items-center gap-1 mobile:flex-1 mobile:text-center mobile:flex-col mobile:gap-0">
        <span className="font-lato font-semibold text-sm md:text-base">We are conducting Product Research,</span>
        <Link href="https://forms.gle/Bdwab4EUHJ2eAUu88" target="_blank" rel="noopener noreferrer" className="font-lato text-sm md:text-base font-normal text-primary underline hover:text-primary-hover">Take the survey to help us launch better</Link>
      </p>
      <IoIosClose title="close" onClick={() => setIsOpen(false)} className="text-2xl cursor-pointer hover:scale-90 hover:text-primary-hover transition-transform shrink-0" />
    </div>
  );
};

export default Advert;
