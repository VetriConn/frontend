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
import { type JobSeekingStatus } from "@/components/pages/profile/ProfileHeader";
import type { WorkExperience, Education } from "@/types/api";

// ─── Status config (reuse from ProfileHeader) ──────────────────────────────────

const STATUS_CONFIG: Record<
  JobSeekingStatus,
  { label: string; badge: string; icon: string }
> = {
  none: {
    label: "Not Set",
    badge: "bg-gray-100 text-gray-400 border border-gray-200",
    icon: "⚪",
  },
  actively_looking: {
    label: "Open to Work",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: "🟢",
  },
  open_to_offers: {
    label: "Open to Offers",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: "🔵",
  },
  not_looking: {
    label: "Not Looking",
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    icon: "⚫",
  },
};

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

  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const statusConfig = profile.job_seeking_status
    ? STATUS_CONFIG[profile.job_seeking_status]
    : null;

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
        <div className="bg-white rounded-2xl shadow-xl max-w-[600px] w-full max-h-[85vh] overflow-y-auto">
          {/* Header bar */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Profile Preview
              </h2>
              <p className="text-xs text-gray-500">
                How employers and recruiters see your profile
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close preview"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-red-50 border-2 border-red-100 flex items-center justify-center shrink-0">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-red-600">
                    {getInitials(profile.name)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-xl font-bold text-gray-900 truncate">
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

                  {statusConfig && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.badge}`}
                    >
                      <span className="text-[10px]">{statusConfig.icon}</span>
                      {statusConfig.label}
                    </span>
                  )}
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
                  <HiOutlineBuildingOffice2 className="w-4 h-4 text-red-500" />
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
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
