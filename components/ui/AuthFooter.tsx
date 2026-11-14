"use client";

const LINK =
  "font-open-sans text-xs md:text-sm text-gray-500 hover:text-primary " +
  "transition-colors min-h-[44px] flex items-center";

export const AuthFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col md:flex-row justify-between items-center w-full py-4 px-4 md:px-6 gap-3 md:gap-0 bg-white border-t border-[#E2E4E9]">
      <p className="font-open-sans text-xs md:text-sm text-gray-500">
        © {currentYear} Vetriconn. All rights reserved.
      </p>
      <div className="flex items-center gap-4">
        {/* Both of these pointed at the same external terms document, so
            "Privacy Policy" led to the terms. They are our own routes now,
            but still open in a new tab: this footer sits under the forgot and
            reset password forms, and a same-tab navigation would discard what
            somebody had already typed. */}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className={LINK}>
          Privacy Policy
        </a>
        <span className="text-gray-300">|</span>
        <a href="/terms" target="_blank" rel="noopener noreferrer" className={LINK}>
          Terms of Service
        </a>
      </div>
    </footer>
  );
};
