"use client";

import React, { useState, useCallback } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePatchProfile } from "@/hooks/usePatchProfile";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineGlobeAlt,
  HiOutlineUserGroup,
  HiOutlinePhoto,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

// ─── Constants ───────────────────────────────────────────────────────────────

const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology & Consulting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance & Banking" },
  { value: "education", label: "Education" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail & E-Commerce" },
  { value: "construction", label: "Construction" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "media", label: "Media & Entertainment" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "agriculture", label: "Agriculture" },
  { value: "legal", label: "Legal Services" },
  { value: "nonprofit", label: "Nonprofit & NGO" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "50-200", label: "50-200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1001-5000", label: "1,001–5,000 employees" },
  { value: "5001+", label: "5,001+ employees" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface CompanyFormData {
  company_name: string;
  industry: string;
  location: string;
  description: string;
  website: string;
  company_email: string;
  phone_number: string;
  company_size: string;
  established_year: string;
}

interface FormErrors {
  [key: string]: string;
}

// ─── Shared styles ───────────────────────────────────────────────────────────

const inputClasses =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white";

const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

// ─── Component ───────────────────────────────────────────────────────────────

const CompanyProfileSetup = () => {
  const { userProfile, isLoading } = useUserProfile();
  const { patchProfile, isLoading: isSaving } = usePatchProfile();

  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: "",
    industry: "",
    location: "",
    description: "",
    website: "",
    company_email: "",
    phone_number: "",
    company_size: "",
    established_year: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  React.useEffect(() => {
    const employerProfile = userProfile?.employer_profile;
    if (userProfile && employerProfile) {
      const location = [employerProfile.city, employerProfile.country]
        .filter(Boolean)
        .join(", ");

      setFormData((prev) => ({
        ...prev,
        company_name: employerProfile.company_name || "",
        industry: employerProfile.industry || "",
        location,
        description: employerProfile.about_company || "",
        website: employerProfile.website || "",
        company_email: employerProfile.company_email || userProfile.email || "",
        phone_number:
          employerProfile.phone_number || userProfile.phone_number || "",
        company_size: employerProfile.company_size || "",
      }));
    } else if (userProfile) {
      setFormData((prev) => ({
        ...prev,
        company_email: userProfile.email || "",
        phone_number: userProfile.phone_number || "",
      }));
    }
  }, [userProfile]);

  const handleFieldChange = useCallback(
    (field: keyof CompanyFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.company_name.trim())
      newErrors.company_name = "Company name is required";
    if (
      formData.company_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)
    )
      newErrors.company_email = "Please enter a valid email";
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website))
      newErrors.website = "Please enter a valid URL";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    const [city = "", country = ""] = formData.location
      .split(",")
      .map((part) => part.trim());

    try {
      await patchProfile({
        employer_profile: {
          ...(userProfile?.employer_profile || {}),
          company_name: formData.company_name.trim(),
          industry: formData.industry,
          city,
          country,
          phone_number: formData.phone_number,
          company_email: formData.company_email,
          website: formData.website,
          company_size: formData.company_size,
          about_company: formData.description,
          notification_preferences: {
            email_notifications:
              userProfile?.employer_profile?.notification_preferences
                ?.email_notifications ?? true,
            job_approved_rejected:
              userProfile?.employer_profile?.notification_preferences
                ?.job_approved_rejected ?? true,
            new_applications:
              userProfile?.employer_profile?.notification_preferences
                ?.new_applications ?? true,
            messages:
              userProfile?.employer_profile?.notification_preferences
                ?.messages ?? true,
          },
          company_preferences: {
            public_company_profile:
              userProfile?.employer_profile?.company_preferences
                ?.public_company_profile ?? true,
            show_contact_information:
              userProfile?.employer_profile?.company_preferences
                ?.show_contact_information ?? true,
          },
        },
      });
    } catch {
      // Toast is handled in usePatchProfile
    }
  }, [
    formData.company_email,
    formData.company_name,
    formData.company_size,
    formData.description,
    formData.industry,
    formData.location,
    formData.phone_number,
    formData.website,
    patchProfile,
    userProfile?.employer_profile,
    validate,
  ]);

  if (isLoading) return <DashboardSkeleton />;

  const displayIndustry =
    INDUSTRY_OPTIONS.find((o) => o.value === formData.industry)?.label ||
    "Industry";
  const displaySize =
    COMPANY_SIZE_OPTIONS.find((o) => o.value === formData.company_size)
      ?.label || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-275 mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Company Profile
          </h1>
          <p className="text-sm text-gray-500">
            Manage how your company appears to job seekers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Form Card ── */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Company Details
            </h2>

            <div className="space-y-5">
              {/* Logo & Banner uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Company Logo</label>
                  <button
                    type="button"
                    className="w-full h-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <HiOutlinePhoto className="w-6 h-6" />
                    <span className="text-xs">Click to upload</span>
                  </button>
                </div>
                <div>
                  <label className={labelClasses}>Banner Image</label>
                  <button
                    type="button"
                    className="w-full h-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <HiOutlinePhoto className="w-6 h-6" />
                    <span className="text-xs">Click to upload</span>
                  </button>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className={labelClasses}>Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) =>
                    handleFieldChange("company_name", e.target.value)
                  }
                  className={`${errors.company_name ? "border-red-500" : "border-gray-200"} ${inputClasses}`}
                />
                {errors.company_name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.company_name}
                  </p>
                )}
              </div>

              {/* Industry / Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) =>
                      handleFieldChange("industry", e.target.value)
                    }
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleFieldChange("location", e.target.value)
                    }
                    placeholder="e.g., Dallas, TX"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* About */}
              <div>
                <label className={labelClasses}>About</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  rows={4}
                  maxLength={2000}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              {/* Website / Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      handleFieldChange("website", e.target.value)
                    }
                    className={`${errors.website ? "border-red-500" : "border-gray-200"} ${inputClasses}`}
                  />
                  {errors.website && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.website}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>Email</label>
                  <input
                    type="email"
                    value={formData.company_email}
                    onChange={(e) =>
                      handleFieldChange("company_email", e.target.value)
                    }
                    className={`${errors.company_email ? "border-red-500" : "border-gray-200"} ${inputClasses}`}
                  />
                  {errors.company_email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.company_email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone / Company Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      handleFieldChange("phone_number", e.target.value)
                    }
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Company Size</label>
                  <select
                    value={formData.company_size}
                    onChange={(e) =>
                      handleFieldChange("company_size", e.target.value)
                    }
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    <option value="">Select company size</option>
                    {COMPANY_SIZE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* ── Live Preview Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Live Preview
              </h3>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Banner area */}
                <div className="h-24 bg-primary" />

                {/* Logo */}
                <div className="px-5 -mt-6">
                  <div className="w-12 h-12 bg-primary/90 rounded-lg flex items-center justify-center border-2 border-white">
                    <HiOutlineBuildingOffice2 className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 pt-3 pb-5">
                  <h4 className="text-base font-bold text-gray-900 mb-1">
                    {formData.company_name || "Company Name"}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineBuildingOffice2 className="w-3 h-3" />
                      {displayIndustry}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineMapPin className="w-3 h-3" />
                      {formData.location || "Location"}
                    </span>
                    {displaySize && (
                      <span className="inline-flex items-center gap-1">
                        <HiOutlineUserGroup className="w-3 h-3" />
                        {displaySize}
                      </span>
                    )}
                    {formData.established_year && (
                      <span className="inline-flex items-center gap-1">
                        <HiOutlineCalendarDays className="w-3 h-3" />
                        Est. {formData.established_year}
                      </span>
                    )}
                  </div>

                  {formData.description && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-4">
                      {formData.description}
                    </p>
                  )}

                  {/* Contact links */}
                  <div className="space-y-1.5 text-xs text-gray-500">
                    {formData.website && (
                      <div className="flex items-center gap-1.5">
                        <HiOutlineGlobeAlt className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{formData.website}</span>
                      </div>
                    )}
                    {formData.company_email && (
                      <div className="flex items-center gap-1.5">
                        <HiOutlineEnvelope className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">
                          {formData.company_email}
                        </span>
                      </div>
                    )}
                    {formData.phone_number && (
                      <div className="flex items-center gap-1.5">
                        <HiOutlinePhone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formData.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileSetup;
