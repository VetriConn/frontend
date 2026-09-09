"use client";
import React from "react";
import { HiOutlinePhone } from "react-icons/hi2";
import {
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

interface ContactInfoCardProps {
  phoneNumber?: string;
  location?: string;
  email: string;
  onEdit: () => void;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  phoneNumber,
  location,
  email,
  onEdit,
}) => {
  return (
    <div
      id="contact-info-card"
      className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineEnvelope className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Contact Information
          </h2>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 min-h-[44px] bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm md:text-base"
          aria-label="Edit contact information"
        >
          <HiOutlinePencilSquare className="w-4 h-4 md:w-5 md:h-5" />
          Edit
        </button>
      </div>

      <div className="space-y-4">
        {/* Phone Number */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <HiOutlinePhone className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Phone number
            </label>
            <p className="text-base text-gray-900 font-medium">
              {phoneNumber || "Not provided"}
            </p>
          </div>
        </div>

        {/* Email (Read-only with tooltip) */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <HiOutlineEnvelope className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Email address
            </label>
            <p className="text-base text-gray-900 font-medium">{email}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <HiOutlineMapPin className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-500 block mb-1">
              Location
            </label>
            <p className="text-base text-gray-900 font-medium">
              {location || "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
