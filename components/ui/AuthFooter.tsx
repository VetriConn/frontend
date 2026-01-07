"use client";

import Link from "next/link";

export const AuthFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex justify-between items-center w-full py-4 px-6 mobile:px-4 mobile:flex-col mobile:gap-2 bg-white border-t border-[#E2E4E9]">
      <p className="font-open-sans text-sm text-gray-500">
        © {currentYear} Vetriconn. All rights reserved.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="https://vetriconntandc.notion.site/VETRICONN-INC-TERMS-AND-CONDITIONS-22ac6380202c807fa63ef48c7ca69815"
          target="_blank"
          rel="noopener noreferrer"
          className="font-open-sans text-sm text-gray-500 hover:text-primary transition-colors"
        >
          Privacy Policy
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href="https://vetriconntandc.notion.site/VETRICONN-INC-TERMS-AND-CONDITIONS-22ac6380202c807fa63ef48c7ca69815"
          target="_blank"
          rel="noopener noreferrer"
          className="font-open-sans text-sm text-gray-500 hover:text-primary transition-colors"
        >
          Terms of Service
        </Link>
      </div>
    </footer>
  );
};
