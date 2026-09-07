"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useUserProfile } from "@/hooks/useUserProfile";
import { readAuthHint, setAuthHint } from "@/lib/auth-hint";

/**
 * The public header's one call to action.
 *
 * It offered "Sign In" to everybody, including people already signed in — who
 * do not need it and whose actual destination is their dashboard. The
 * signed-out pair is the server-rendered default (most public-page visitors
 * are signed out, and holding the slot blank cost a visible pop-in); a
 * localStorage hint corrects returning signed-in users on the first client
 * tick, and the resolved profile is authoritative when it lands.
 */
/**
 * Remembers whether the last resolved profile was signed in, so a reload can
 * paint the right label immediately instead of waiting on the network. Only a
 * label hint — never an authorisation decision: the destination is guarded
 * server-side either way, and the real answer overwrites this as soon as it
 * lands.
 */
function AuthCta({
  className,
  onNavigate,
}: {
  className: string;
  onNavigate?: () => void;
}) {
  const { userProfile, isLoading, isError } = useUserProfile();
  const [hint, setHint] = useState<boolean | null>(null);

  // Read after mount: touching localStorage during render would desync
  // hydration, since the server has no way to know it.
  useEffect(() => {
    const stored = readAuthHint();
    if (stored !== null) setHint(stored);
  }, []);

  // Record the truth once it arrives, for the next load.
  const resolved = !isLoading || isError || !!userProfile;
  useEffect(() => {
    if (!resolved) return;
    setAuthHint(!!userProfile);
  }, [resolved, userProfile]);

  // Signed-out is the render-now default: no placeholder, no timer. The hint
  // flips returning signed-in users on the first client tick; the profile
  // response settles it for everyone else.
  const signedIn = resolved ? !!userProfile : hint === true;

  return (
    <>
      {!signedIn && (
        <Link
          href="/signup"
          className="font-open-sans text-sm md:text-base text-text font-semibold no-underline hover:text-primary transition-colors whitespace-nowrap"
          onClick={onNavigate}
        >
          Create account
        </Link>
      )}
      <Link
        href={signedIn ? "/dashboard" : "/signin"}
        // The fixed minimum keeps the pill's width stable when the label swaps
        // between "Sign in" and "Dashboard", so a late resolve can't shift
        // the nav.
        className={clsx(className, "min-w-[7.5rem]")}
        onClick={onNavigate}
      >
        {signedIn ? "Dashboard" : "Sign in"}
      </Link>
    </>
  );
}

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

  // The stray dot is gone: it sat at left-0 while the line started at left-2 and
  // spanned only 85% of the word, so neither aligned with the label or with each
  // other. One mark now, spanning the whole word.
  const navLinkClass = (isActive: boolean) =>
    clsx(
      // Colour is exclusive-or: text-text and text-primary tie on specificity,
      // so stacking both let the base win and the active label never went red.
      "nav-brush font-open-sans text-base md:text-lg transition-colors cursor-pointer inline-block no-underline",
      "hover:text-primary focus-visible:outline-none focus-visible:text-primary",
      isActive ? "is-active text-primary" : "text-text",
    );

  const handleScrollTo = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="flex justify-between items-center py-2 max-w-[1600px] mx-auto px-6 shadow-[0_6px_4px_-4px_#e8e8e8]">
      <Link href="/" aria-label="Vetriconn home" className="shrink-0">
        <Image
          src="/images/logo.png"
          alt="Vetriconn"
          width={360}
          height={164}
          priority
          sizes="180px"
          className="w-[180px] h-auto mobile:w-[140px]"
        />
      </Link>
      <button
        className={clsx(
          "hidden mobile:block bg-transparent border-none cursor-pointer z-[60] py-4 px-2.5 relative",
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
      <div className="flex gap-4 md:gap-6 ml-auto mr-8 mobile:hidden">
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
        <AuthCta className="font-open-sans text-sm md:text-base bg-primary text-white border-none py-2.5 px-7 rounded-full cursor-pointer transition-all hover:bg-primary-hover font-semibold inline-block text-center no-underline" />
      </div>
      <div
        className={clsx(
          "hidden",
          isMenuOpen &&
            "mobile:flex mobile:flex-col mobile:fixed mobile:inset-0 mobile:w-full mobile:h-dvh mobile:bg-white mobile:z-50 mobile:pt-16 mobile:pb-6 mobile:justify-between",
        )}
      >
        <div
          className={clsx(
            "hidden",
            isMenuOpen &&
              "mobile:flex mobile:flex-col mobile:items-stretch mobile:justify-start mobile:m-0 mobile:px-5 mobile:pt-2 mobile:flex-1 mobile:gap-0 mobile:overflow-y-auto",
          )}
        >
          <Link
            href="/"
            className={clsx(
              navLinkClass(pathname === "/"),
              "mobile:py-3.5 mobile:text-lg mobile:font-semibold mobile:min-h-[48px] mobile:flex mobile:items-center mobile:justify-start mobile:border-b mobile:border-gray-100",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className={clsx(
              navLinkClass(pathname === "/jobs"),
              "mobile:py-3.5 mobile:text-lg mobile:font-semibold mobile:min-h-[48px] mobile:flex mobile:items-center mobile:justify-start mobile:border-b mobile:border-gray-100",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Jobs
          </Link>
          <Link
            href="/about"
            className={clsx(
              navLinkClass(pathname === "/about"),
              "mobile:py-3.5 mobile:text-lg mobile:font-semibold mobile:min-h-[48px] mobile:flex mobile:items-center mobile:justify-start mobile:border-b mobile:border-gray-100",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/faq"
            className={clsx(
              navLinkClass(pathname === "/faq"),
              "mobile:py-3.5 mobile:text-lg mobile:font-semibold mobile:min-h-[48px] mobile:flex mobile:items-center mobile:justify-start mobile:border-b mobile:border-gray-100",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            FAQ
          </Link>
          <a
            href="/#contact-section"
            className={clsx(
              navLinkClass(false),
              "mobile:py-3.5 mobile:text-lg mobile:font-semibold mobile:min-h-[48px] mobile:flex mobile:items-center mobile:justify-start mobile:border-b mobile:border-gray-100",
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
              "mobile:flex mobile:flex-col mobile:items-stretch mobile:justify-center mobile:px-5 mobile:pt-4 mobile:pb-2",
          )}
        >
          {/* Same auth-aware control as the desktop nav. This was a hardcoded
              "Sign In", so a signed-in visitor opening the mobile menu was sent
              back to the login page instead of their dashboard. */}
          <AuthCta
            className="font-open-sans text-base bg-primary text-white border-none py-3 px-10 rounded-full cursor-pointer transition-colors hover:bg-primary-hover text-center mobile:w-full mobile:font-semibold shadow-md min-h-[48px] flex items-center justify-center no-underline"
            onNavigate={() => setIsMenuOpen(false)}
          />
        </div>
      </div>
      {isMenuOpen && (
        <div
          className="hidden mobile:block mobile:fixed mobile:inset-0 mobile:bg-black/50 mobile:z-40"
          onClick={toggleMenu}
        />
      )}
    </nav>
  );
};

export default Header;
