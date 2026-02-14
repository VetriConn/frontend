import Image from "next/image";
import Logo from "@/public/images/logo_1.svg";
import { FiLinkedin } from "react-icons/fi";
import { LiaFacebookF } from "react-icons/lia";

const Footer = () => {
  return (
    <footer className="bg-[#f2f2f2] px-[5%] pt-10 pb-6 rounded-b-lg box-border w-full mobile:pt-6 mobile:pb-4">
      <div className="flex justify-between items-start gap-8 flex-wrap mobile:gap-4">
        <div className="flex-[1_1_300px] min-w-[220px] mobile:min-w-0 mobile:flex-[1_1_120px]">
          <div className="flex items-center gap-2 mb-2">
            <Logo className="w-[162px] h-auto block overflow-visible mobile:w-[110px]" />
          </div>
          <Image
            src="/badge.svg"
            alt="Pipeda Certification Badge"
            height={40}
            width={140}
            className="mobile:h-[28px] mobile:w-auto"
          />
        </div>
        <div className="flex gap-12 mobile:gap-4">
          <div className="flex flex-col gap-2 mobile:gap-1">
            <div className="font-open-sans text-base font-bold text-text mb-1 mobile:text-[14px] mobile:mb-0">
              Privacy & Policies
            </div>
            <a
              target="_blank"
              href="https://vetriconntandc.notion.site/VETRICONN-INC-TERMS-AND-CONDITIONS-22ac6380202c807fa63ef48c7ca69815"
              className="font-open-sans text-[15px] text-text opacity-80 no-underline transition-colors duration-200 hover:text-primary mobile:text-[14px]"
            >
              Terms & Conditions
            </a>
            <a
              href="#"
              className="font-open-sans text-[15px] text-text opacity-80 no-underline transition-colors duration-200 hover:text-primary mobile:text-[14px]"
            >
              Privacy Guide
            </a>
          </div>
          <div className="flex flex-col gap-2 mobile:gap-1">
            <div className="font-open-sans text-base font-bold text-text mb-1 mobile:text-[14px] mobile:mb-0">
              Company
            </div>
            <a
              href="/about"
              className="font-open-sans text-[15px] text-text opacity-80 no-underline transition-colors duration-200 hover:text-primary mobile:text-[14px]"
            >
              About Us
            </a>
            <a
              href="/faq"
              className="font-open-sans text-[15px] text-text opacity-80 no-underline transition-colors duration-200 hover:text-primary mobile:text-[14px]"
            >
              FAQs
            </a>
          </div>
        </div>
      </div>
      <div className="mt-10 bg-[#e8e8e8] rounded-lg py-3 px-6 flex items-center justify-between mobile:mt-4 mobile:py-2 mobile:px-3">
        <div className="font-open-sans text-sm font-normal text-primary mobile:text-[10px]">
          Vetriconn © 2025 All rights Reserved.
        </div>
        <div className="flex gap-5 mobile:gap-3">
          <a
            href="https://www.facebook.com/profile.php?id=61580233844003"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-[1.7rem] transition-colors duration-200 hover:text-primary-hover mobile:text-xl"
          >
            <LiaFacebookF />
          </a>
          <a
            href="https://www.linkedin.com/company/vetriconn-inc/?viewAsMember=true"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-[1.7rem] transition-colors duration-200 hover:text-primary-hover mobile:text-xl"
          >
            <FiLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
