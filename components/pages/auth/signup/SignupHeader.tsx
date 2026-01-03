"use client";

import Logo from "@/public/images/logo_1.svg";
import Link from "next/link";

export const SignupHeader = () => {
  return (
    <header className="flex justify-between items-center w-full py-4 px-6 mobile:px-4">
      <Link href="/" aria-label="Go to homepage">
        <Logo className="w-[160px] h-auto block overflow-visible mobile:w-[120px]" />
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
