"use client";
import { useState, useEffect } from "react";
import Logo from "@/public/images/logo_1.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinkClass = (isActive: boolean) =>
    clsx(
      "font-open-sans text-[17px] text-text transition-colors relative pb-1.5 cursor-pointer",
      "before:content-[''] before:block before:absolute before:left-0 before:bottom-0 before:w-1 before:h-1 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity",
      "after:content-[''] after:block after:absolute after:left-2 after:bottom-px after:w-[85%] after:h-px after:bg-primary after:rounded-sm after:opacity-0 after:transition-opacity",
      "hover:text-primary hover:before:opacity-100 hover:after:opacity-100",
      isActive && "text-primary before:opacity-100 after:opacity-100",
    );

  const handleScrollTo = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="flex justify-between items-center py-2 max-w-[1340px] mx-auto px-6 shadow-[0_6px_4px_-4px_#e8e8e8]">
      <Logo className="w-[180px] h-auto block overflow-visible mobile:w-[140px]" />
      <button
        className={clsx(
          "hidden mobile:block bg-transparent border-none cursor-pointer z-20 py-4 px-2.5 relative",
        )}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span
          className={clsx(
            "block w-[25px] h-[3px] bg-text rounded-sm relative transition-all duration-300",
            "before:content-[''] before:absolute before:w-[25px] before:h-[3px] before:bg-text before:rounded-sm before:transition-all before:duration-300 before:left-0 before:-top-2",
            "after:content-[''] after:absolute after:w-[25px] after:h-[3px] after:bg-text after:rounded-sm after:transition-all after:duration-300 after:left-0 after:-bottom-2",
            isMenuOpen &&
              "bg-transparent before:rotate-45 before:top-0 after:-rotate-45 after:bottom-0",
          )}
        />
      </button>
      <div className="flex gap-10 ml-auto mr-8 mobile:hidden">
        <Link href="/" className={navLinkClass(pathname === "/")}>
          Home
        </Link>
        <Link href="/jobs" className={navLinkClass(pathname === "/jobs")}>
          Jobs
        </Link>
        <Link href="/about" className={navLinkClass(pathname === "/about")}>
          About
        </Link>
        <Link href="/faq" className={navLinkClass(pathname === "/faq")}>
          FAQ
        </Link>
        <a
          href="/#contact-section"
          className={navLinkClass(false)}
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              handleScrollTo("contact-section");
            }
          }}
        >
          Contact Us
        </a>
      </div>
      <div className="flex items-center gap-4 mobile:hidden">
        <Link
          href="/signin"
          className="font-open-sans text-[15px] bg-primary text-white border-none py-2.5 px-7 rounded-full cursor-pointer transition-all hover:bg-primary-hover font-semibold inline-block text-center"
        >
          Sign In
        </Link>
      </div>
      <div
        className={clsx(
          "hidden",
          isMenuOpen &&
            "mobile:flex mobile:flex-col mobile:fixed mobile:inset-0 mobile:w-full mobile:h-screen mobile:bg-white mobile:z-10 mobile:pt-24 mobile:pb-15 mobile:justify-between",
        )}
      >
        <div
          className={clsx(
            "hidden",
            isMenuOpen &&
              "mobile:flex mobile:flex-col mobile:items-center mobile:justify-start mobile:m-0 mobile:px-8 mobile:pt-4 mobile:pb-4 mobile:flex-1 mobile:gap-2",
          )}
        >
          <Link
            href="/"
            className={clsx(
              navLinkClass(pathname === "/"),
              "mobile:py-6 mobile:text-2xl mobile:font-semibold",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className={clsx(
              navLinkClass(pathname === "/jobs"),
              "mobile:py-6 mobile:text-2xl mobile:font-semibold",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Jobs
          </Link>
          <Link
            href="/about"
            className={clsx(
              navLinkClass(pathname === "/about"),
              "mobile:py-6 mobile:text-2xl mobile:font-semibold",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/faq"
            className={clsx(
              navLinkClass(pathname === "/faq"),
              "mobile:py-6 mobile:text-2xl mobile:font-semibold",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            FAQ
          </Link>
          <a
            href="/#contact-section"
            className={clsx(
              navLinkClass(false),
              "mobile:py-6 mobile:text-2xl mobile:font-semibold",
            )}
            onClick={() => {
              setIsMenuOpen(false);
              if (pathname === "/") {
                handleScrollTo("contact-section");
              }
            }}
          >
            Contact Us
          </a>
        </div>
        <div
          className={clsx(
            "hidden",
            isMenuOpen &&
              "mobile:flex mobile:flex-col mobile:items-center mobile:justify-center mobile:mt-auto mobile:mb-12 mobile:px-8",
          )}
        >
          <Link
            href="/signin"
            className="font-open-sans text-lg bg-primary text-white border-none py-4 px-10 rounded-full cursor-pointer transition-all hover:bg-primary-hover inline-block text-center mobile:w-[220px] mobile:font-semibold shadow-lg"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign In
          </Link>
        </div>
      </div>
      {isMenuOpen && (
        <div
          className="hidden mobile:block mobile:fixed mobile:inset-0 mobile:bg-black/50 mobile:z-[9]"
          onClick={toggleMenu}
        />
      )}
    </nav>
  );
};
