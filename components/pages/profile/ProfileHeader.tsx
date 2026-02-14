"use client";

import React, { useState } from "react";
import Image from "next/image";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { CheckCircleIcon } from "@/components/ui/CheckCircleIcon";

export interface ProfileHeaderProps {
  name: string;
  avatar?: string;
  location?: string;
  bio?: string;
  completionPercentage: number;
  onEditPhoto: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatar,
  location,
  bio,
  completionPercentage,
  onEditPhoto,
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
          {/* Avatar */}
          <div className="shrink-0 flex justify-center sm:justify-start">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-red-50 border-2 border-red-100">
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
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            {/* Name Row with Completion Badge */}
            <div className="flex justify-between flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {name}
              </h2>

              {/* Completion Badge */}
              <div className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1 bg-red-50 rounded-full">
                <CheckCircleIcon color="red" size={16} className="shrink-0" />
                <span className="text-sm text-gray-700">
                  Profile {completionPercentage}% complete
                </span>
              </div>
            </div>

            {/* Location */}
            {location && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-gray-500 text-sm mb-3">
                <HiOutlineLocationMarker className="w-4 h-4 shrink-0" />
                <span>{location}</span>
              </div>
            )}

            {/* Bio */}
            {bio && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {bio}
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime
                accusantium earum, est culpa veniam fuga neque recusandae
                placeat corporis. Sapiente dignissimos animi possimus quam
                placeat. Nesciunt, commodi optio! Veniam velit nihil eum magnam
                itaque adipisci ipsum iste praesentium nam non ut sint harum
                cupiditate maiores, enim facilis rem quia? Sed.
              </p>
            )}
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime
              accusantium earum, est culpa veniam fuga neque recusandae placeat
              corporis. Sapiente dignissimos animi possimus quam placeat.
              Nesciunt, commodi optio! Veniam velit nihil eum magnam itaque
              adipisci ipsum iste praesentium nam non ut sint harum cupiditate
              maiores, enim facilis rem quia? Sed.
            </p>

            {/* Edit Profile Photo Button */}
            <button
              onClick={onEditPhoto}
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              aria-label="Edit profile photo"
            >
              Edit profile photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
