"use client";

import Image from "next/image";
import Link from "next/link";

export const AuthHeader = () => {
  return (
    <header className="flex justify-between items-center w-full px-6 mobile:px-4 bg-white border-b border-[#E2E4E9]">
      <Link href="/" aria-label="Go to homepage">
        <Image
          src="/images/logo.png"
          alt="Vetriconn"
          width={360}
          height={164}
          priority
          sizes="160px"
          className="w-[160px] h-auto mobile:w-[120px]"
        />
      </Link>
      <p  className="font-open-sans text-sm text-gray-500 hover:text-gray-700 transition-colors ">
        Need help? {" "}
      <Link
        href="/contact"
       className="text-primary"
      >
      
         Contact support
    
      </Link>
      </p>
    </header>
  );
};
