"use client";

import React from "react";
import Image from "next/image";
import {
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineXMark,
  HiOutlineBuildingOffice2,
  HiOutlineEnvelope,
} from "react-icons/hi2";
import { PiTreeStructureLight } from "react-icons/pi";
import {
  JobSeekingStatusBadge,
  type JobSeekingStatus,
} from "@/components/ui/JobSeekingStatusBadge";
import type { WorkExperience, Education } from "@/types/api";
import { getInitials } from "@/lib/initials";

// ─── Status config (reuse from ProfileHeader) ──────────────────────────────────

// ─── Props ──────────────────────────────────────────────────────────────────────

interface ProfilePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    avatar?: string;
    bio?: string;
    job_title?: string;
    location?: string;
    job_seeking_status?: JobSeekingStatus;
    skills?: string[];
    work_experience?: WorkExperience[];
    education?: Education[];
    industry?: string;
    years_of_experience?: string;
  };
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ProfilePreviewDialog({
  isOpen,
  onClose,
  profile,
}: ProfilePreviewDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Profile preview — how employers see your profile"
      >
        <div className="bg-white rounded-2xl shadow-xl w-[95%] md:w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header bar */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10 shrink-0">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-gray-900">
                Profile Preview
              </h2>
              <p className="text-xs text-gray-500">
                How employers and recruiters see your profile
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close preview"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="px-4 md:px-6 py-6 space-y-6 overflow-y-auto flex-1">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-red-50 border-2 border-red-100 flex items-center justify-center shrink-0">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 64px, 80px"
                  />
                ) : (
                  <span className="text-xl md:text-2xl font-bold text-red-600">
                    {getInitials(profile.name)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
            {profile.name}
          </h3>

                {profile.job_title && (
                  <p className="text-sm text-gray-600 font-medium">
                    {profile.job_title}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                      <HiOutlineMapPin className="w-3.5 h-3.5" />
                      {profile.location}
                    </span>
                  )}

                  <JobSeekingStatusBadge
                    status={profile.job_seeking_status}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  About
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Professional Info */}
            {(profile.industry || profile.years_of_experience) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                  <HiOutlineBriefcase className="w-4 h-4 text-red-500" />
                  Professional Information
                </h4>
                <div className="flex flex-wrap gap-3">
                  {profile.industry && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400" />
                      {profile.industry}
                    </span>
                  )}
                  {profile.years_of_experience && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <HiOutlineBriefcase className="w-4 h-4 text-gray-400" />
                      {profile.years_of_experience} years experience
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                  <PiTreeStructureLight className="w-4 h-4 text-red-500" />
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-red-50 text-primary text-sm font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {profile.work_experience && profile.work_experience.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                  <HiOutlineBriefcase className="w-4 h-4 text-red-500" />
                  Experience
                </h4>
                <div className="space-y-4">
                  {profile.work_experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-gray-200 pl-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {exp.position}
                      </p>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {exp.start_date}
                        {exp.end_date ? ` — ${exp.end_date}` : " — Present"}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                  <HiOutlineAcademicCap className="w-4 h-4 text-red-500" />
                  Education
                </h4>
                <div className="space-y-4">
                  {profile.education.map((edu, i) => (
                    <div key={i} className="border-l-2 border-gray-200 pl-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {edu.degree}
                        {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                      </p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {edu.start_year}
                        {edu.end_year ? ` — ${edu.end_year}` : " — Present"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-150 px-4 md:px-6 py-3.5 rounded-b-2xl shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
