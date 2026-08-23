"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePatchProfile } from "@/hooks/usePatchProfile";
import { safeHttpUrl } from "@/lib/safe-url";
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
import { ProfilePhotoModal } from "@/components/security/ProfilePhotoModal";
import {
  uploadProfilePicture,
  deleteProfilePicture,
  getUserAttachments,
  uploadAttachment,
  deleteAttachment,
  updateUserSettings,
  getUploadSignature,
  uploadDirectToCloudinary,
} from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { AuthGuard } from "@/components/auth/AuthGuard";
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
    state_province: "",
    country: "",
  });

  // ─── Edit Public Profile form data ────────────────────────────────────────
  const [publicProfileForm, setPublicProfileForm] = useState({
    full_name: "",
    bio: "",
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
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // ─── Profile Preview state ────────────────────────────────────────────────
  const [showPreview, setShowPreview] = useState(false);

  // Keep persisted profile collections in sync with server data
  useEffect(() => {
    if (userProfile) {
      setLocalExperiences(userProfile.work_experience || []);
      setLocalEducation(userProfile.education || []);
      setLocalSkills(userProfile.skills || []);
    }
  }, [
    userProfile?.work_experience,
    userProfile?.education,
    userProfile?.skills,
  ]);

  // Load attachments from backend
  useEffect(() => {
    let cancelled = false;
    async function loadAttachments() {
      try {
        const docs = await getUserAttachments();
        if (!cancelled) {
          setLocalDocuments(docs as UserDocument[]);
        }
      } catch (err) {
        console.error("Failed to load documents:", err);
      }
    }
    loadAttachments();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Contact handlers ---
  const handleEditContact = useCallback(() => {
    if (userProfile) {
      setContactFormData({
        phone_number: userProfile.phone_number || "",
        city: userProfile.city || "",
        state_province: userProfile.state_province || "",
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
        state_province: contactFormData.state_province,
        country: contactFormData.country,
      });
      setEditSection(null);
    } catch {
      showToast({
        type: "error",
        title: "Update failed",
        description: "Could not update contact info. Please try again.",
      });
    }
  };

  // --- Edit Public Profile handlers ---
  const handleEditPublicProfile = useCallback(() => {
    if (userProfile) {
      setPublicProfileForm({
        full_name: userProfile.full_name || "",
        bio: userProfile.bio || "",
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
      });
      setEditSection(null);
    } catch {
      showToast({
        type: "error",
        title: "Update failed",
        description: "Could not update public profile. Please try again.",
      });
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
    } catch {
      showToast({
        type: "error",
        title: "Update failed",
        description:
          "Could not update professional information. Please try again.",
      });
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
      try {
        await patchProfile({ work_experience: updated });
        setLocalExperiences(updated);
      } catch {
        showToast({
          type: "error",
          title: "Delete failed",
          description: "Could not delete work experience. Please try again.",
        });
      }
    },
    [localExperiences, patchProfile, showToast],
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

    try {
      await patchProfile({ work_experience: updatedList });
      setLocalExperiences(updatedList);
      setEditSection(null);
      setEditingIndex(null);
    } catch {
      showToast({
        type: "error",
        title: "Save failed",
        description: "Could not save work experience. Please try again.",
      });
    }
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
      try {
        await patchProfile({ education: updated });
        setLocalEducation(updated);
      } catch {
        showToast({
          type: "error",
          title: "Delete failed",
          description: "Could not delete education. Please try again.",
        });
      }
    },
    [localEducation, patchProfile, showToast],
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

    try {
      await patchProfile({ education: updatedList });
      setLocalEducation(updatedList);
      setEditSection(null);
      setEditingIndex(null);
    } catch {
      showToast({
        type: "error",
        title: "Save failed",
        description: "Could not save education. Please try again.",
      });
    }
  };

  // --- Document handlers ---
  const handleUploadDocument = useCallback(() => {
    setUploadedFile(null);
    setEditSection("upload-document");
  }, []);

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) return;

    setIsUploadingDoc(true);
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempDoc: UserDocument = {
        _id: tempId,
        name: uploadedFile.name,
        url: URL.createObjectURL(uploadedFile),
        file_type: uploadedFile.name.split(".").pop() || "pdf",
        file_size: uploadedFile.size,
        upload_date: new Date().toISOString(),
      };
      setLocalDocuments((prev) => [...prev, tempDoc]);
      setEditSection(null);

      // Call the API service passing the binary File object directly
      const res = await uploadAttachment(uploadedFile);

      setLocalDocuments(res.user_attachments as UserDocument[]);
      showToast({
        type: "success",
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
    } catch (err) {
      console.error(err);
      try {
        const docs = await getUserAttachments();
        setLocalDocuments(docs as UserDocument[]);
      } catch {}
      showToast({
        type: "error",
        title: "Upload failed",
        description: "Could not upload document. Please try again.",
      });
    } finally {
      setUploadedFile(null);
      setIsUploadingDoc(false);
    }
  };

  const handleDownloadDocument = useCallback((doc: UserDocument) => {
    const url = safeHttpUrl(doc.url);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleViewDocument = useCallback((doc: UserDocument) => {
    const url = safeHttpUrl(doc.url);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleDeleteDocument = useCallback(async (doc: UserDocument) => {
    if (!doc._id) return;

    setDeletingDocId(doc._id);
    const originalDocs = [...localDocuments];
    setLocalDocuments((prev) => prev.filter((d) => d._id !== doc._id));

    try {
      const updated = await deleteAttachment(doc._id);
      setLocalDocuments(updated as UserDocument[]);
      showToast({
        type: "success",
        title: "Document deleted",
        description: "Your document has been deleted successfully.",
      });
    } catch (err) {
      console.error(err);
      setLocalDocuments(originalDocs);
      showToast({
        type: "error",
        title: "Delete failed",
        description: "Could not delete document. Please try again.",
      });
    } finally {
      setDeletingDocId(null);
    }
  }, [localDocuments, showToast]);

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
    setEditSection("photo");
  }, []);

  const handlePhotoSave = async (croppedFile: File) => {
    setIsUploadingPhoto(true);
    try {
      const signatureData = await getUploadSignature("profile_picture");
      const uploadRes = await uploadDirectToCloudinary(croppedFile, signatureData);
      await uploadProfilePicture(uploadRes.secure_url);
      mutateProfile();
      setEditSection(null);
      showToast({
        type: "success",
        title: "Photo updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Upload failed",
        description: err.message || "Failed to upload photo. Please check your connection and try again.",
      });
      throw new Error("Failed to upload photo.");
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
    } catch {
      showToast({
        type: "error",
        title: "Delete failed",
        description: "Failed to remove photo. Please try again.",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleVisibilityChange = async (visibility: "everyone" | "employers-only" | "private") => {
    try {
      await updateUserSettings({ profileVisibility: visibility });
      mutateProfile();
      showToast({
        type: "success",
        title: "Visibility updated",
        description: `Your profile photo visibility is now set to ${
          visibility === "everyone" ? "Anyone" : visibility === "employers-only" ? "Employers only" : "Private"
        }.`,
      });
    } catch {
      showToast({
        type: "error",
        title: "Update failed",
        description: "Failed to update photo visibility. Please try again.",
      });
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
    } catch {
      showToast({
        type: "error",
        title: "Update failed",
        description: "Could not update skills. Please try again.",
      });
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
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main content */}
          <div className="space-y-4 md:space-y-6 lg:col-span-2">
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
          <div className="space-y-4 md:space-y-6 lg:col-span-1 hidden lg:block">
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
    );
  }

  // Error state
  if (isError || !userProfile) {
    return (
      <div className="max-w-screen-xl mx-auto">
        <ErrorState
          title="Unable to load profile"
          message="There was an error loading your profile. Please try again."
          onRetry={() => mutateProfile()}
        />
      </div>
    );
  }

  // Build the API user profile from our mapped profile
  const email = userProfile.email || "";

  // "Toronto, ON, Canada" — the province is what distinguishes the several
  // Londons and Hamiltons a Canadian board actually has to deal with.
  const displayLocation = [
    userProfile.city,
    userProfile.state_province,
    userProfile.country,
  ]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(", ");

  return (
    <AuthGuard>
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
          {/* Main content */}
          <div className="space-y-4 md:space-y-6 lg:col-span-2">
            {/* Profile Header */}
            <div id="profile-header">
              <ProfileHeader
                name={userProfile.full_name}
                avatar={userProfile.picture}
                location={displayLocation}
                bio={userProfile.bio || undefined}
                jobTitle={userProfile.job_title || undefined}
                jobSeekingStatus={userProfile.job_seeking_settings?.status}
                completionPercentage={profileCompletion.percentage}
                onEditProfile={handleEditPublicProfile}
                onPreview={() => setShowPreview(true)}
                onChangePhoto={handleChangePhoto}
              />
            </div>

            {/* Professional Info Card */}
            <div id="professional-info-card">
              <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HiOutlineBriefcase className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      Professional Information
                    </h3>
                  </div>
                  <button
                    onClick={handleEditProfessionalInfo}
                    className="flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 min-h-[44px] bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm md:text-base"
                    aria-label="Edit professional info"
                  >
                    <HiOutlinePencilSquare className="text-base md:text-lg" />
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
                onView={handleViewDocument}
                isUploading={isUploadingDoc}
                deletingDocId={deletingDocId || undefined}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6 lg:col-span-1">
            {profileCompletion.percentage <= 75 && (
              <ProfileCompletionCard
                completion={profileCompletion}
                onSectionClick={handleSectionClick}
              />
            )}
            <QuickActionsCard
              appliedJobsCount={userProfile.applied_jobs_count ?? 0}
              savedJobsCount={userProfile.saved_jobs?.length ?? 0}
            />
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
          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
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
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
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
          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
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
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
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
                <option value="Defence & Military">
                  Defence &amp; Military
                </option>
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
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
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

        {/* Photo Upload & Edit Dialog */}
        <ProfilePhotoModal
          isOpen={editSection === "photo"}
          currentPhotoUrl={userProfile.picture || undefined}
          userName={userProfile.full_name}
          currentVisibility={userProfile?.privacy_preferences?.profile_visibility}
          onClose={handleCloseDialog}
          onSave={handlePhotoSave}
          onDelete={handleDeletePhoto}
          onVisibilityChange={handleVisibilityChange}
          isSubmitting={isUploadingPhoto}
        />

        {/* Skills Edit Dialog */}
        <EditDialog
          isOpen={editSection === "skills"}
          title="Edit Skills"
          onClose={handleCloseDialog}
          onSubmit={handleSkillsSubmit}
          isSubmitting={isPatching}
        >
          <SkillsEditForm
            skills={localSkills}
            onSkillsChange={setLocalSkills}
          />
        </EditDialog>

        {/* Profile Preview Dialog */}
        <ProfilePreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          profile={{
            name: userProfile.full_name,
            avatar: userProfile.picture,
            bio: userProfile.bio || undefined,
            job_title: userProfile.job_title || undefined,
            location: displayLocation,
            job_seeking_status: userProfile.job_seeking_settings?.status,
            skills: localSkills,
            work_experience: localExperiences,
            education: localEducation,
            industry: userProfile.industry || undefined,
            years_of_experience: userProfile.years_of_experience || undefined,
          }}
        />
      </div>
    </AuthGuard>
  );
}
