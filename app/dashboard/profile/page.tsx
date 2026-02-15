"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePatchProfile } from "@/hooks/usePatchProfile";
import { ProfileHeader } from "@/components/pages/profile/ProfileHeader";
import { ContactInfoCard } from "@/components/ui/ContactInfoCard";
import { WorkExperienceCard } from "@/components/ui/WorkExperienceCard";
import { EducationCard } from "@/components/ui/EducationCard";
import { DocumentsCard } from "@/components/ui/DocumentsCard";
import { SkillsCard, SkillsEditForm } from "@/components/ui/SkillsCard";
import { ProfileCompletionCard } from "@/components/ui/ProfileCompletionCard";
import { QuickActionsCard } from "@/components/ui/QuickActionsCard";
import { EditDialog } from "@/components/ui/EditDialog";
import {
  ContactInfoEditForm,
  ContactInfoFormData,
} from "@/components/pages/profile/ContactInfoEditForm";
import { AddExperienceForm } from "@/components/pages/profile/AddExperienceForm";
import { AddEducationForm } from "@/components/pages/profile/AddEducationForm";
import { UploadDocumentForm } from "@/components/pages/profile/UploadDocumentForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProfilePreviewDialog } from "@/components/ui/ProfilePreviewDialog";
import { uploadProfilePicture, deleteProfilePicture } from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { WorkExperience, Education, UserDocument } from "@/types/api";
import { HiOutlineBriefcase, HiOutlinePencilSquare } from "react-icons/hi2";

type EditSection =
  | "contact"
  | "add-experience"
  | "edit-experience"
  | "add-education"
  | "edit-education"
  | "upload-document"
  | "photo"
  | "public-profile"
  | "professional-info"
  | "skills"
  | null;

export default function ProfilePage() {
  const { userProfile, profileCompletion, isLoading, isError, mutateProfile } =
    useUserProfile();
  const { patchProfile, isLoading: isPatching } = usePatchProfile(() => {
    mutateProfile();
  });
  const { showToast } = useToaster();

  const [editSection, setEditSection] = useState<EditSection>(null);

  // Local state for experiences, education, and documents
  const [localExperiences, setLocalExperiences] = useState<WorkExperience[]>(
    [],
  );
  const [localEducation, setLocalEducation] = useState<Education[]>([]);
  const [localDocuments, setLocalDocuments] = useState<UserDocument[]>([]);
  const [localSkills, setLocalSkills] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Editing index (null = adding new, number = editing existing)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form data for current add/edit operation
  const [experienceFormData, setExperienceFormData] = useState<WorkExperience>({
    position: "",
    company: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [educationFormData, setEducationFormData] = useState<Education>({
    institution: "",
    degree: "",
    field_of_study: "",
    start_year: "",
    end_year: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Contact info form data
  const [contactFormData, setContactFormData] = useState<ContactInfoFormData>({
    phone_number: "",
    city: "",
    country: "",
  });

  // ─── Edit Public Profile form data ────────────────────────────────────────
  const [publicProfileForm, setPublicProfileForm] = useState({
    full_name: "",
    bio: "",
    job_title: "",
  });

  // ─── Edit Professional Info form data ─────────────────────────────────────
  const [professionalInfoForm, setProfessionalInfoForm] = useState({
    job_title: "",
    industry: "",
    years_of_experience: "",
  });

  // ─── Photo upload state ───────────────────────────────────────────────────
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // ─── Profile Preview state ────────────────────────────────────────────────
  const [showPreview, setShowPreview] = useState(false);

  // Initialize local state from profile data
  useEffect(() => {
    if (userProfile && !isInitialized) {
      setLocalExperiences(userProfile.work_experience || []);
      setLocalEducation(userProfile.education || []);
      setLocalDocuments(userProfile.documents || []);
      setLocalSkills(userProfile.skills || []);
      setIsInitialized(true);
    }
  }, [userProfile, isInitialized]);

  // --- Contact handlers ---
  const handleEditContact = useCallback(() => {
    if (userProfile) {
      setContactFormData({
        phone_number: userProfile.phone_number || "",
        city: userProfile.city || "",
        country: userProfile.country || "",
      });
    }
    setEditSection("contact");
  }, [userProfile]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patchProfile({
        phone_number: contactFormData.phone_number,
        city: contactFormData.city,
        country: contactFormData.country,
      });
      setEditSection(null);
    } catch (error) {
      console.error("Failed to update contact info:", error);
    }
  };

  // --- Edit Public Profile handlers ---
  const handleEditPublicProfile = useCallback(() => {
    if (userProfile) {
      setPublicProfileForm({
        full_name: userProfile.name || "",
        bio: userProfile.bio || "",
        job_title: userProfile.job_title || "",
      });
    }
    setEditSection("public-profile");
  }, [userProfile]);

  const handlePublicProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicProfileForm.full_name.trim()) return;
    try {
      await patchProfile({
        full_name: publicProfileForm.full_name,
        bio: publicProfileForm.bio,
        job_title: publicProfileForm.job_title,
      });
      setEditSection(null);
    } catch (error) {
      console.error("Failed to update public profile:", error);
    }
  };

  // --- Edit Professional Info handlers ---
  const handleEditProfessionalInfo = useCallback(() => {
    if (userProfile) {
      setProfessionalInfoForm({
        job_title: userProfile.job_title || "",
        industry: userProfile.industry || "",
        years_of_experience: userProfile.years_of_experience || "",
      });
    }
    setEditSection("professional-info");
  }, [userProfile]);

  const handleProfessionalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patchProfile({
        job_title: professionalInfoForm.job_title,
        industry: professionalInfoForm.industry,
        years_of_experience: professionalInfoForm.years_of_experience,
      });
      setEditSection(null);
    } catch (error) {
      console.error("Failed to update professional info:", error);
    }
  };

  // --- Work Experience handlers ---
  const handleAddExperience = useCallback(() => {
    setEditingIndex(null);
    setExperienceFormData({
      position: "",
      company: "",
      start_date: "",
      end_date: "",
      description: "",
    });
    setEditSection("add-experience");
  }, []);

  const handleEditExperience = useCallback(
    (index: number) => {
      setEditingIndex(index);
      setExperienceFormData({ ...localExperiences[index] });
      setEditSection("edit-experience");
    },
    [localExperiences],
  );

  const handleDeleteExperience = useCallback(
    async (index: number) => {
      const updated = localExperiences.filter((_, i) => i !== index);
      setLocalExperiences(updated);
      try {
        await patchProfile({ work_experience: updated });
      } catch (error) {
        console.error("Failed to delete experience:", error);
      }
    },
    [localExperiences, patchProfile],
  );

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !experienceFormData.position.trim() ||
      !experienceFormData.company.trim()
    )
      return;

    const updatedList =
      editingIndex !== null
        ? localExperiences.map((exp, i) =>
            i === editingIndex ? experienceFormData : exp,
          )
        : [...localExperiences, experienceFormData];

    setLocalExperiences(updatedList);

    try {
      await patchProfile({ work_experience: updatedList });
    } catch (error) {
      console.error("Failed to save work experience:", error);
    }

    setEditSection(null);
    setEditingIndex(null);
  };

  // --- Education handlers ---
  const handleAddEducation = useCallback(() => {
    setEditingIndex(null);
    setEducationFormData({
      institution: "",
      degree: "",
      field_of_study: "",
      start_year: "",
      end_year: "",
    });
    setEditSection("add-education");
  }, []);

  const handleEditEducation = useCallback(
    (index: number) => {
      setEditingIndex(index);
      setEducationFormData({ ...localEducation[index] });
      setEditSection("edit-education");
    },
    [localEducation],
  );

  const handleDeleteEducation = useCallback(
    async (index: number) => {
      const updated = localEducation.filter((_, i) => i !== index);
      setLocalEducation(updated);
      try {
        await patchProfile({ education: updated });
      } catch (error) {
        console.error("Failed to delete education:", error);
      }
    },
    [localEducation, patchProfile],
  );

  const handleEducationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !educationFormData.institution.trim() ||
      !educationFormData.degree.trim()
    )
      return;

    const updatedList =
      editingIndex !== null
        ? localEducation.map((edu, i) =>
            i === editingIndex ? educationFormData : edu,
          )
        : [...localEducation, educationFormData];

    setLocalEducation(updatedList);

    try {
      await patchProfile({ education: updatedList });
    } catch (error) {
      console.error("Failed to save education:", error);
    }

    setEditSection(null);
    setEditingIndex(null);
  };

  // --- Document handlers ---
  const handleUploadDocument = useCallback(() => {
    setUploadedFile(null);
    setEditSection("upload-document");
  }, []);

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) return;

    const newDoc: UserDocument = {
      _id: `doc-${Date.now()}`,
      name: uploadedFile.name,
      url: URL.createObjectURL(uploadedFile),
      file_type: uploadedFile.name.split(".").pop() || "pdf",
      file_size: uploadedFile.size,
      upload_date: new Date().toISOString(),
    };

    setLocalDocuments((prev) => [...prev, newDoc]);

    // TODO: Upload to backend (Cloudinary) when API is ready
    console.log("Document uploaded locally:", newDoc.name);

    setEditSection(null);
    setUploadedFile(null);
  };

  const handleDownloadDocument = useCallback((doc: UserDocument) => {
    if (doc.url && doc.url !== "#") {
      window.open(doc.url, "_blank");
    }
  }, []);

  const handleDeleteDocument = useCallback((doc: UserDocument) => {
    setLocalDocuments((prev) => prev.filter((d) => d._id !== doc._id));
  }, []);

  const handleCloseDialog = useCallback(() => {
    setEditSection(null);
    setEditingIndex(null);
    // Clean up photo preview
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    setPhotoFile(null);
  }, [photoPreview]);

  // --- Photo handlers ---
  const handleChangePhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditSection("photo");
  }, []);

  const handlePhotoFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        alert("Please select a JPEG, PNG, or WebP image.");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB.");
        return;
      }

      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    },
    [],
  );

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) return;

    setIsUploadingPhoto(true);
    try {
      await uploadProfilePicture(photoFile);
      mutateProfile();
      setEditSection(null);
      setPhotoFile(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      showToast({
        type: "error",
        title: "Upload failed",
        description:
          "Failed to upload photo. Please check your connection and try again.",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      await deleteProfilePicture();
      mutateProfile();
      setEditSection(null);
    } catch (error) {
      console.error("Failed to delete profile picture:", error);
      showToast({
        type: "error",
        title: "Delete failed",
        description: "Failed to remove photo. Please try again.",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // --- Skills handlers ---
  const handleEditSkills = useCallback(() => {
    setEditSection("skills");
  }, []);

  const handleSkillsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patchProfile({ skills: localSkills });
      setEditSection(null);
    } catch (error) {
      console.error("Failed to update skills:", error);
    }
  };

  // Handle section click from profile completion card
  const handleSectionClick = useCallback(
    (section: string) => {
      const sectionMap: Record<string, () => void> = {
        full_name: handleEditPublicProfile,
        picture: handleChangePhoto,
        bio: handleEditPublicProfile,
        phone_number: handleEditContact,
        location: handleEditContact,
        job_title: handleEditProfessionalInfo,
        industry: handleEditProfessionalInfo,
        years_of_experience: handleEditProfessionalInfo,
        work_experience: handleAddExperience,
        education: handleAddEducation,
        documents: handleUploadDocument,
        skills: handleEditSkills,
      };

      const handler = sectionMap[section];
      if (handler) handler();
    },
    [
      handleEditPublicProfile,
      handleChangePhoto,
      handleEditContact,
      handleEditProfessionalInfo,
      handleAddExperience,
      handleAddEducation,
      handleUploadDocument,
      handleEditSkills,
    ],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Main content */}
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-6 tablet:flex-col">
                  <div className="w-[120px] h-[120px] rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-7 w-48 bg-gray-200 rounded-md" />
                    <div className="h-5 w-36 bg-gray-200 rounded" />
                    <div className="h-4 w-44 bg-gray-200 rounded" />
                    <div className="flex gap-2 mt-1">
                      <div className="w-6 h-6 bg-gray-200 rounded" />
                      <div className="w-6 h-6 bg-gray-200 rounded" />
                      <div className="w-6 h-6 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="h-9 w-32 bg-gray-200 rounded-lg shrink-0 tablet:w-full" />
                </div>
              </div>

              {/* Professional Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded" />
                      <div className="h-4 w-40 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[80, 60, 100, 70, 50, 90].map((w, i) => (
                    <div
                      key={i}
                      className="h-7 bg-gray-200 rounded-full"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border-l-2 border-gray-200 pl-4">
                      <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-28 bg-gray-200 rounded mb-1" />
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                  <div className="h-5 w-28 bg-gray-200 rounded" />
                </div>
                <div className="border-l-2 border-gray-200 pl-4">
                  <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-32 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 rounded" />
                  <div className="h-5 w-28 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-52 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 hidden lg:block">
              {/* Profile Completion */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
                <div className="h-2 w-full bg-gray-200 rounded-full mb-3" />
                <div className="h-4 w-16 bg-gray-200 rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded-full" />
                      <div className="h-3 w-28 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <ErrorState
            title="Unable to load profile"
            message="There was an error loading your profile. Please try again."
            onRetry={() => mutateProfile()}
          />
        </div>
      </div>
    );
  }

  // Build the API user profile from our mapped profile
  const email = userProfile.email || "";

  // Format location for display
  const displayLocation =
    userProfile.city && userProfile.country
      ? `${userProfile.city}, ${userProfile.country}`
      : userProfile.location || "";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Main content */}
          <div className="space-y-6">
            {/* Profile Header */}
            <div id="profile-header">
              <ProfileHeader
                name={userProfile.name}
                avatar={userProfile.avatar}
                location={displayLocation}
                bio={userProfile.bio || undefined}
                jobTitle={userProfile.job_title || undefined}
                jobSeekingStatus={userProfile.job_seeking_status}
                completionPercentage={profileCompletion.percentage}
                onEditProfile={handleEditPublicProfile}
                onPreview={() => setShowPreview(true)}
                onChangePhoto={handleChangePhoto}
              />
            </div>

            {/* Professional Info Card */}
            <div id="professional-info-card">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HiOutlineBriefcase className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Professional Information
                    </h3>
                  </div>
                  <button
                    onClick={handleEditProfessionalInfo}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                    aria-label="Edit professional info"
                  >
                    <HiOutlinePencilSquare className="text-base" />
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Job Title</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {userProfile.job_title || (
                        <span className="text-gray-400 italic font-normal">
                          Not set
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Industry</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {userProfile.industry || (
                        <span className="text-gray-400 italic font-normal">
                          Not set
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Years of Experience
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {userProfile.years_of_experience || (
                        <span className="text-gray-400 italic font-normal">
                          Not set
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info Card */}
            <div id="contact-info-card">
              <ContactInfoCard
                phoneNumber={userProfile.phone_number}
                location={displayLocation}
                email={email}
                onEdit={handleEditContact}
              />
            </div>

            {/* Skills Card */}
            <div id="skills-card">
              <SkillsCard skills={localSkills} onEdit={handleEditSkills} />
            </div>

            {/* Work Experience Card */}
            <div id="work-experience-card">
              <WorkExperienceCard
                experiences={localExperiences}
                onAdd={handleAddExperience}
                onEdit={handleEditExperience}
                onDelete={handleDeleteExperience}
              />
            </div>

            {/* Education Card */}
            <div id="education-card">
              <EducationCard
                education={localEducation}
                onAdd={handleAddEducation}
                onEdit={handleEditEducation}
                onDelete={handleDeleteEducation}
              />
            </div>

            {/* Documents Card */}
            <div id="documents-card">
              <DocumentsCard
                documents={localDocuments}
                onUpload={handleUploadDocument}
                onDownload={handleDownloadDocument}
                onDelete={handleDeleteDocument}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileCompletionCard
              completion={profileCompletion}
              onSectionClick={handleSectionClick}
            />
            <QuickActionsCard
              savedJobsCount={userProfile.saved_jobs?.length ?? 0}
            />
          </div>
        </div>
      </div>

      {/* ─── Edit Public Profile Dialog ─── */}
      <EditDialog
        isOpen={editSection === "public-profile"}
        title="Edit Public Profile"
        onClose={handleCloseDialog}
        onSubmit={handlePublicProfileSubmit}
        isSubmitting={isPatching}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={publicProfileForm.full_name}
              onChange={(e) =>
                setPublicProfileForm((p) => ({
                  ...p,
                  full_name: e.target.value,
                }))
              }
              className="form-input"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={publicProfileForm.job_title}
              onChange={(e) =>
                setPublicProfileForm((p) => ({
                  ...p,
                  job_title: e.target.value,
                }))
              }
              className="form-input"
              placeholder="e.g. Operations Manager"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Professional Bio
            </label>
            <textarea
              value={publicProfileForm.bio}
              onChange={(e) =>
                setPublicProfileForm((p) => ({ ...p, bio: e.target.value }))
              }
              rows={5}
              className="form-input resize-none"
              placeholder="Tell employers about your background, skills, and what you're looking for..."
            />
            <p className="text-xs text-gray-400 mt-1.5">
              {publicProfileForm.bio.length}/500 characters
            </p>
          </div>
        </div>
      </EditDialog>

      {/* ─── Edit Professional Info Dialog ─── */}
      <EditDialog
        isOpen={editSection === "professional-info"}
        title="Edit Professional Info"
        onClose={handleCloseDialog}
        onSubmit={handleProfessionalInfoSubmit}
        isSubmitting={isPatching}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={professionalInfoForm.job_title}
              onChange={(e) =>
                setProfessionalInfoForm((p) => ({
                  ...p,
                  job_title: e.target.value,
                }))
              }
              className="form-input"
              placeholder="e.g. Operations Manager, Logistics Supervisor"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Industry
            </label>
            <select
              value={professionalInfoForm.industry}
              onChange={(e) =>
                setProfessionalInfoForm((p) => ({
                  ...p,
                  industry: e.target.value,
                }))
              }
              className="form-input"
            >
              <option value="">Select industry</option>
              <option value="Government & Public Administration">
                Government &amp; Public Administration
              </option>
              <option value="Defence & Military">Defence &amp; Military</option>
              <option value="Healthcare & Medical">
                Healthcare &amp; Medical
              </option>
              <option value="Information Technology">
                Information Technology
              </option>
              <option value="Engineering">Engineering</option>
              <option value="Logistics & Supply Chain">
                Logistics &amp; Supply Chain
              </option>
              <option value="Education & Training">
                Education &amp; Training
              </option>
              <option value="Construction & Trades">
                Construction &amp; Trades
              </option>
              <option value="Finance & Accounting">
                Finance &amp; Accounting
              </option>
              <option value="Law Enforcement & Security">
                Law Enforcement &amp; Security
              </option>
              <option value="Transportation">Transportation</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Non-profit & Community">
                Non-profit &amp; Community
              </option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Years of Experience
            </label>
            <select
              value={professionalInfoForm.years_of_experience}
              onChange={(e) =>
                setProfessionalInfoForm((p) => ({
                  ...p,
                  years_of_experience: e.target.value,
                }))
              }
              className="form-input"
            >
              <option value="">Select experience</option>
              <option value="0-2 years">0–2 years</option>
              <option value="3-5 years">3–5 years</option>
              <option value="6-10 years">6–10 years</option>
              <option value="11-15 years">11–15 years</option>
              <option value="16-20 years">16–20 years</option>
              <option value="20+ years">20+ years</option>
            </select>
          </div>
        </div>
      </EditDialog>

      {/* Contact Info Edit Dialog */}
      <EditDialog
        isOpen={editSection === "contact"}
        title="Edit Contact Information"
        onClose={handleCloseDialog}
        onSubmit={handleContactSubmit}
        isSubmitting={isPatching}
      >
        <ContactInfoEditForm
          initialData={contactFormData}
          onDataChange={setContactFormData}
        />
      </EditDialog>

      {/* Add Work Experience Dialog */}
      <EditDialog
        isOpen={editSection === "add-experience"}
        title="Add Work Experience"
        onClose={handleCloseDialog}
        onSubmit={handleExperienceSubmit}
        isSubmitting={isPatching}
        submitLabel="Add Experience"
      >
        <AddExperienceForm onDataChange={setExperienceFormData} />
      </EditDialog>

      {/* Edit Work Experience Dialog */}
      <EditDialog
        isOpen={editSection === "edit-experience"}
        title="Edit Work Experience"
        onClose={handleCloseDialog}
        onSubmit={handleExperienceSubmit}
        isSubmitting={isPatching}
      >
        <AddExperienceForm
          initialData={experienceFormData}
          onDataChange={setExperienceFormData}
        />
      </EditDialog>

      {/* Add Education Dialog */}
      <EditDialog
        isOpen={editSection === "add-education"}
        title="Add Education"
        onClose={handleCloseDialog}
        onSubmit={handleEducationSubmit}
        isSubmitting={isPatching}
        submitLabel="Add Education"
      >
        <AddEducationForm onDataChange={setEducationFormData} />
      </EditDialog>

      {/* Edit Education Dialog */}
      <EditDialog
        isOpen={editSection === "edit-education"}
        title="Edit Education"
        onClose={handleCloseDialog}
        onSubmit={handleEducationSubmit}
        isSubmitting={isPatching}
      >
        <AddEducationForm
          initialData={educationFormData}
          onDataChange={setEducationFormData}
        />
      </EditDialog>

      {/* Upload Document Dialog */}
      <EditDialog
        isOpen={editSection === "upload-document"}
        title="Upload Document"
        onClose={handleCloseDialog}
        onSubmit={handleDocumentSubmit}
        isSubmitting={false}
        submitLabel="Upload"
      >
        <UploadDocumentForm onFileSelected={setUploadedFile} />
      </EditDialog>

      {/* Photo Upload Dialog */}
      <EditDialog
        isOpen={editSection === "photo"}
        title="Change Profile Photo"
        onClose={handleCloseDialog}
        onSubmit={handlePhotoUpload}
        isSubmitting={isUploadingPhoto}
        submitLabel={photoFile ? "Upload Photo" : "Save"}
      >
        <div className="space-y-5">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="Current photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-400">
                  {userProfile.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* File picker */}
          <div>
            <label
              htmlFor="photo-upload"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-primary hover:text-primary cursor-pointer transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              {photoFile ? photoFile.name : "Choose a photo"}
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoFileSelect}
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              JPEG, PNG, or WebP — max 5 MB
            </p>
          </div>

          {/* Delete current photo */}
          {userProfile.avatar && !photoFile && (
            <button
              type="button"
              onClick={handleDeletePhoto}
              disabled={isUploadingPhoto}
              className="w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Remove current photo
            </button>
          )}
        </div>
      </EditDialog>

      {/* Skills Edit Dialog */}
      <EditDialog
        isOpen={editSection === "skills"}
        title="Edit Skills"
        onClose={handleCloseDialog}
        onSubmit={handleSkillsSubmit}
        isSubmitting={isPatching}
      >
        <SkillsEditForm skills={localSkills} onSkillsChange={setLocalSkills} />
      </EditDialog>

      {/* Profile Preview Dialog */}
      <ProfilePreviewDialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        profile={{
          name: userProfile.name,
          avatar: userProfile.avatar,
          bio: userProfile.bio || undefined,
          job_title: userProfile.job_title || undefined,
          location: displayLocation,
          job_seeking_status: userProfile.job_seeking_status,
          skills: localSkills,
          work_experience: localExperiences,
          education: localEducation,
          industry: userProfile.industry || undefined,
          years_of_experience: userProfile.years_of_experience || undefined,
        }}
      />
    </div>
  );
}
