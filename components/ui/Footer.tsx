import Image from "next/image";
// One family for both, matching the contact section. These were Line Awesome
// and Feather respectively — two weights, two corner radii, and neither of
// them the official mark.
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa6";

const LINK =
  "font-open-sans text-sm md:text-base text-text opacity-80 no-underline " +
  "transition-colors duration-200 hover:text-primary min-h-[44px] flex items-center";

const HEADING = "font-open-sans text-sm md:text-base font-bold text-text mb-1";

const SOCIAL =
  "text-primary text-lg md:text-xl transition-colors duration-200 " +
  "hover:text-primary-hover min-h-[44px] min-w-[44px] flex items-center justify-center";

const Footer = () => {
  return (
    <footer className="bg-[#f2f2f2] pt-6 pb-4 rounded-b-lg box-border w-full mobile:pt-4 mobile:pb-3">
      {/* The tint runs the full width; the content inside it does not. Without
          this the footer spanned the whole viewport while the header stopped at
          1600px, so the two logos sat at different distances from the edge on
          any wide screen. Same cap and same px-6 as the header's nav, so the
          columns line up down the page. */}
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-8 items-start">
          {/* Brand */}
          <div className="flex flex-col items-start gap-3">
            <Image
              src="/images/logo.png"
              alt="Vetriconn"
              width={360}
              height={164}
              sizes="162px"
              className="w-[162px] h-auto mobile:w-[110px]"
            />
            {/* Explicit width at both sizes. w-auto lost to the global img rule,
                so the box stretched to the full column and object-fit: fill
                squashed the artwork inside it — which read as a badge floating
                in the middle of the column rather than sitting under the logo. */}
            <Image
              src="/badge.svg"
              alt="Committed to PIPEDA-compliant privacy practices"
              height={40}
              width={140}
              className="block w-[140px] h-auto object-contain mobile:w-[98px]"
              loading="lazy"
            />
          </div>

          {/* Two items each, so two columns at every width. Stacked, these ran
              to nearly 500px of footer on a phone with most of it empty. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:gap-x-12">
            <div className="flex flex-col">
              <div className={HEADING}>Privacy &amp; Policies</div>
              <a
                target="_blank"
                href="https://vetriconntandc.notion.site/VETRICONN-INC-TERMS-AND-CONDITIONS-22ac6380202c807fa63ef48c7ca69815"
                className={LINK}
              >
                Terms &amp; Conditions
              </a>
              <a
                target="_blank"
                href="https://vetriconntandc.notion.site/VETRICONN-INC-TERMS-AND-CONDITIONS-22ac6380202c807fa63ef48c7ca69815"
                className={LINK}
              >
                Privacy Guide
              </a>
            </div>
            <div className="flex flex-col">
              <div className={HEADING}>Company</div>
              <a href="/jobs" className={LINK}>
                Jobs
              </a>
              <a href="/about" className={LINK}>
                About
              </a>
              <a href="/faq" className={LINK}>
                FAQ
              </a>
            </div>
          </div>
        </div>

        {/* Copyright and social */}
        <div className="mt-6 md:mt-8 bg-[#e8e8e8] rounded-lg py-2 px-4 md:px-6 flex flex-col-reverse md:flex-row items-center justify-between gap-1 md:gap-0">
          <div className="font-open-sans text-xs md:text-sm font-normal text-primary text-center">
            Vetriconn © {new Date().getFullYear()}. All rights reserved.
          </div>
          <div className="flex gap-2 md:gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61580233844003"
              aria-label="Vetriconn on Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className={SOCIAL}
            >
              <FaFacebookF aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/company/vetriconn-inc/"
              aria-label="Vetriconn on LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className={SOCIAL}
            >
              <FaLinkedinIn aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
