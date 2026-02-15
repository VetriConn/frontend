"use client";

import React, { useState } from "react";
import Image from "next/image";
import { HiOutlineLocationMarker } from "react-icons/hi";
import {
  HiOutlinePencilSquare,
  HiOutlineCamera,
  HiOutlineEye,
} from "react-icons/hi2";
import { CheckCircleIcon } from "@/components/ui/CheckCircleIcon";

export type JobSeekingStatus =
  | "none"
  | "actively_looking"
  | "open_to_offers"
  | "not_looking";

const JOB_SEEKING_STATUS_CONFIG: Record<
  JobSeekingStatus,
  { label: string; badge: string; icon: string }
> = {
  none: {
    label: "",
    badge: "",
    icon: "",
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

export interface ProfileHeaderProps {
  name: string;
  avatar?: string;
  location?: string;
  bio?: string;
  jobTitle?: string;
  jobSeekingStatus?: JobSeekingStatus;
  completionPercentage: number;
  onEditProfile: () => void;
  onPreview?: () => void;
  onChangePhoto?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatar,
  location,
  bio,
  jobTitle,
  jobSeekingStatus,
  completionPercentage,
  onEditProfile,
  onPreview,
  onChangePhoto,
}) => {
  const [imageError, setImageError] = useState(false);

  // Calculate initials from name (first letter of first and last name)
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const initials = getInitials(name);
  const hasValidAvatar = avatar && avatar.trim() !== "" && !imageError;

  // Color-coded badge based on completion
  const badgeColor =
    completionPercentage === 100
      ? "bg-emerald-50 text-emerald-700"
      : completionPercentage >= 60
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-gray-700";
  const badgeIconColor =
    completionPercentage === 100
      ? "green"
      : completionPercentage >= 60
        ? "orange"
        : "red";

  return (
    <div className="space-y-6">
      {/* Page Title Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
        <p className="text-gray-500 text-sm">
          Review and update your professional information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar with camera overlay */}
          <div className="shrink-0 flex justify-center sm:justify-start">
            <button
              type="button"
              onClick={onChangePhoto}
              className="group relative w-20 h-20 rounded-full overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Change profile photo"
            >
              <div className="w-full h-full flex items-center justify-center bg-red-50 border-2 border-red-100 rounded-full overflow-hidden">
                {hasValidAvatar ? (
                  <Image
                    src={avatar!}
                    alt={name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-2xl font-bold text-red-600">
                    {initials}
                  </span>
                )}
              </div>
              {/* Camera hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-full flex items-center justify-center transition-all duration-200">
                <HiOutlineCamera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            {/* Name Row with Completion Badge */}
            <div className="flex justify-between flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {name}
              </h2>

              {/* Completion Badge */}
              <div
                className={`inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1 rounded-full ${badgeColor}`}
              >
                <CheckCircleIcon
                  color={badgeIconColor as "red" | "green" | "orange"}
                  size={16}
                  className="shrink-0"
                />
                <span className="text-sm font-medium">
                  {completionPercentage === 100
                    ? "Profile complete"
                    : `Profile ${completionPercentage}% complete`}
                </span>
              </div>
            </div>

            {/* Job-Seeking Status Badge */}
            {jobSeekingStatus && jobSeekingStatus !== "none" && (
              <div className="flex justify-center sm:justify-start mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${JOB_SEEKING_STATUS_CONFIG[jobSeekingStatus].badge}`}
                >
                  <span className="text-[10px]">
                    {JOB_SEEKING_STATUS_CONFIG[jobSeekingStatus].icon}
                  </span>
                  {JOB_SEEKING_STATUS_CONFIG[jobSeekingStatus].label}
                </span>
              </div>
            )}

            {/* Job Title */}
            {jobTitle && (
              <p className="text-gray-600 text-sm font-medium mb-1.5">
                {jobTitle}
              </p>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-gray-500 text-sm mb-3">
                <HiOutlineLocationMarker className="w-4 h-4 shrink-0" />
                <span>{location}</span>
              </div>
            )}

            {/* Bio */}
            {bio ? (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {bio}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic mb-4">
                No bio yet — tell employers about yourself.
              </p>
            )}

            {/* Profile Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onEditProfile}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                aria-label="Edit profile"
              >
                <HiOutlinePencilSquare className="w-4 h-4" />
                Edit profile
              </button>
              {onPreview && (
                <button
                  onClick={onPreview}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                  aria-label="Preview profile as employer"
                >
                  <HiOutlineEye className="w-4 h-4" />
                  Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
