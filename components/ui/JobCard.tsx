"use client";
import React from "react";
import clsx from "clsx";
import { FaRegStar } from "react-icons/fa";
import { Tag } from "@/types/tag";
import { FaArrowRight } from "react-icons/fa6";
import { BsBuildings } from "react-icons/bs";
import { JOB_TAG_CLASS, formatTagLabel } from "@/lib/job-display";

interface JobCardProps {
  role: string;
  name: string;
  description: string;
  tags: Tag[] | string[];
  logo?: string;
  variant?: "default" | "sidebar";
  onSelect?: () => void;
  selected?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ role, name, description, tags, variant = "default", onSelect, selected = false }) => {
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={clsx(
        "bg-white rounded-lg md:rounded-xl p-4 md:p-6 w-full transition-all duration-200 border border-gray-100",
        !isSidebar && "max-w-sm shadow-sm hover:-translate-y-0.5 hover:shadow-md",
        isSidebar && "max-w-sm shadow-none cursor-pointer relative hover:bg-red-50 tablet:min-w-64 sm:min-w-60 xs:min-w-56",
        isSidebar && "before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:h-[calc(100%-24px)] before:bg-transparent hover:before:bg-red-600",
        selected && isSidebar && "bg-red-50 before:bg-red-600"
      )}
      {...(isSidebar ? { onClick: () => onSelect?.(), role: "button", tabIndex: 0, "aria-pressed": selected } : {})}
    >
      <div className="flex items-center mb-3 tablet:mb-2">
        <BsBuildings className="rounded-lg mr-3 shrink-0 overflow-visible" />
        <div className="flex-1">
          <h3 className="font-open-sans text-sm md:text-base font-semibold m-0 mb-1 text-text">{role}</h3>
          <p className="font-open-sans text-xs md:text-sm text-gray-500 m-0">{name}</p>
        </div>
        <button className="bg-transparent border-none cursor-pointer p-2 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-black/5 group">
          <FaRegStar className="text-lg text-gray-300 transition-colors duration-200 group-hover:text-primary" />
        </button>
      </div>
      <p className="font-open-sans text-xs md:text-sm leading-relaxed text-text m-0 mb-4 overflow-hidden text-ellipsis line-clamp-2">{description}</p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 tablet:gap-1.5 sm:gap-1 xs:gap-1">
          {tags.map((tag, index) => {
            const tagName = typeof tag === "string" ? tag : tag.name;
            return <span key={index} className={clsx("font-open-sans", JOB_TAG_CLASS)}>{formatTagLabel(tagName)}</span>;
          })}
        </div>
        {isSidebar && <button className="bg-transparent border-none cursor-pointer p-2 flex items-center justify-center rounded-full ml-2 transition-colors duration-200 hover:bg-gray-100 group xs:p-1.5" onClick={(e) => e.stopPropagation()} aria-label="Select job"><FaArrowRight className="text-lg text-gray-400 transition-colors duration-200 group-hover:text-primary xs:text-base" /></button>}
      </div>
    </div>
  );
};

export default JobCard;
