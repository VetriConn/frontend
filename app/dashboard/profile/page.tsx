"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePatchProfile } from "@/hooks/usePatchProfile";
import { ProfileHeader } from "@/components/pages/profile/ProfileHeader";
import { ContactInfoCard } from "@/components/ui/ContactInfoCard";
import { WorkExperienceCard } from "@/components/ui/WorkExperienceCard";
import { EducationCard } from "@/components/ui/EducationCard";
import { DocumentsCard } from "@/components/ui/DocumentsCard";
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
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  UserProfile,
  WorkExperience,
  Education,
  UserDocument,
} from "@/types/api";

// Dummy data for development — replace with real API data later
const DUMMY_WORK_EXPERIENCES: WorkExperience[] = [
  {
    position: "Operations Manager",
    company: "Canadian Armed Forces",
    start_date: "1995-01-01",
    end_date: "2020-12-01",
    description:
      "Led strategic planning and logistics operations for teams of up to 200 personnel. Managed equipment worth over $50M and coordinated multi-national training exercises.",
  },
  {
    position: "Logistics Supervisor",
    company: "Veterans Affairs Canada",
    start_date: "2021-01-01",
    end_date: "2024-08-01",
    description:
      "Oversaw supply chain operations and mentored junior staff. Implemented process improvements that reduced processing times by 30%.",
  },
];

const DUMMY_EDUCATION: Education[] = [
  {
    institution: "Royal Military College of Canada",
    degree: "Bachelor",
    field_of_study: "Military Arts and Science",
    start_year: "1991",
    end_year: "1995",
  },
  {
    institution: "Canadian Forces Leadership Academy",
    degree: "Advanced Leadership Certificate",
    field_of_study: "",
    start_year: "2010",
    end_year: "2011",
  },
];

const DUMMY_DOCUMENTS: UserDocument[] = [
  {
    _id: "doc1",
    name: "Resume_MagaretThompson.pdf",
    url: "#",
    file_type: "pdf",
    file_size: 245 * 1024,
    upload_date: "2024-12-15",
  },
];

type EditSection =
  | "contact"
  | "add-experience"
  | "edit-experience"
  | "add-education"
  | "edit-education"
  | "upload-document"
  | "photo"
  | null;

export default function ProfilePage() {
  const { userProfile, profileCompletion, isLoading, isError, mutateProfile } =
    useUserProfile();
  const { patchProfile, isLoading: isPatching } = usePatchProfile();

  const [editSection, setEditSection] = useState<EditSection>(null);

  // Local state for experiences, education, and documents
  const [localExperiences, setLocalExperiences] = useState<WorkExperience[]>(
    [],
  );
  const [localEducation, setLocalEducation] = useState<Education[]>([]);
  const [localDocuments, setLocalDocuments] = useState<UserDocument[]>([]);
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

  // Initialize local state from profile or dummy data
  useEffect(() => {
    if (userProfile && !isInitialized) {
      setLocalExperiences(
        userProfile.work_experience && userProfile.work_experience.length > 0
          ? userProfile.work_experience
          : DUMMY_WORK_EXPERIENCES,
      );
      setLocalEducation(
        userProfile.education && userProfile.education.length > 0
          ? userProfile.education
          : DUMMY_EDUCATION,
      );
      setLocalDocuments(
        userProfile.documents && userProfile.documents.length > 0
          ? userProfile.documents
          : DUMMY_DOCUMENTS,
      );
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
      mutateProfile();
      setEditSection(null);
    } catch (error) {
      console.error("Failed to update contact info:", error);
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

  const handleDeleteExperience = useCallback((index: number) => {
    setLocalExperiences((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !experienceFormData.position.trim() ||
      !experienceFormData.company.trim()
    )
      return;

    if (editingIndex !== null) {
      // Editing existing
      setLocalExperiences((prev) =>
        prev.map((exp, i) => (i === editingIndex ? experienceFormData : exp)),
      );
    } else {
      // Adding new
      setLocalExperiences((prev) => [...prev, experienceFormData]);
    }

    // Persist to backend
    try {
      const updatedList =
        editingIndex !== null
          ? localExperiences.map((exp, i) =>
              i === editingIndex ? experienceFormData : exp,
            )
          : [...localExperiences, experienceFormData];
      await patchProfile({ work_experience: updatedList });
      mutateProfile();
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

  const handleDeleteEducation = useCallback((index: number) => {
    setLocalEducation((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleEducationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !educationFormData.institution.trim() ||
      !educationFormData.degree.trim()
    )
      return;

    if (editingIndex !== null) {
      setLocalEducation((prev) =>
        prev.map((edu, i) => (i === editingIndex ? educationFormData : edu)),
      );
    } else {
      setLocalEducation((prev) => [...prev, educationFormData]);
    }

    // Persist to backend
    try {
      const updatedList =
        editingIndex !== null
          ? localEducation.map((edu, i) =>
              i === editingIndex ? educationFormData : edu,
            )
          : [...localEducation, educationFormData];
      await patchProfile({ education: updatedList });
      mutateProfile();
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

  // --- Photo handler ---
  const handleEditPhoto = useCallback(() => {
    setEditSection("photo");
  }, []);

  const handleCloseDialog = useCallback(() => {
    setEditSection(null);
    setEditingIndex(null);
  }, []);

  // Handle section click from profile completion card
  const handleSectionClick = useCallback(
    (section: string) => {
      const sectionMap: Record<string, () => void> = {
        phone_number: handleEditContact,
        location: handleEditContact,
        work_experience: handleAddExperience,
        education: handleAddEducation,
      };

      const handler = sectionMap[section];
      if (handler) handler();
    },
    [handleEditContact, handleAddExperience, handleAddEducation],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              <Skeleton className="h-[200px] rounded-xl" />
              <Skeleton className="h-[180px] rounded-xl" />
              <Skeleton className="h-[200px] rounded-xl" />
              <Skeleton className="h-[200px] rounded-xl" />
              <Skeleton className="h-[150px] rounded-xl" />
            </div>
            <div className="space-y-6 hidden lg:block">
              <Skeleton className="h-[300px] rounded-xl" />
              <Skeleton className="h-[200px] rounded-xl" />
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
  const apiUserProfile: UserProfile = {
    full_name: userProfile.name || "",
    role: userProfile.role || "job_seeker",
    email: "",
    phone_number: userProfile.phone_number,
    city: userProfile.city,
    country: userProfile.country,
    location: userProfile.location,
    job_title: userProfile.job_title,
    bio: userProfile.bio || undefined,
  };

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
                completionPercentage={profileCompletion.percentage}
                onEditPhoto={handleEditPhoto}
              />
            </div>

            {/* Contact Info Card */}
            <ContactInfoCard
              phoneNumber={userProfile.phone_number}
              location={displayLocation}
              email={email}
              onEdit={handleEditContact}
            />

            {/* Work Experience Card */}
            <WorkExperienceCard
              experiences={localExperiences}
              onAdd={handleAddExperience}
              onEdit={handleEditExperience}
              onDelete={handleDeleteExperience}
            />

            {/* Education Card */}
            <EducationCard
              education={localEducation}
              onAdd={handleAddEducation}
              onEdit={handleEditEducation}
              onDelete={handleDeleteEducation}
            />

            {/* Documents Card */}
            <DocumentsCard
              documents={localDocuments}
              onUpload={handleUploadDocument}
              onDownload={handleDownloadDocument}
              onDelete={handleDeleteDocument}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileCompletionCard
              userProfile={apiUserProfile}
              onSectionClick={handleSectionClick}
            />
            <QuickActionsCard
              savedJobsCount={userProfile.saved_jobs?.length ?? 0}
            />
          </div>
        </div>
      </div>

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

      {/* Photo Edit Dialog - placeholder for now */}
      <EditDialog
        isOpen={editSection === "photo"}
        title="Edit Profile Photo"
        onClose={handleCloseDialog}
        onSubmit={(e) => {
          e.preventDefault();
          handleCloseDialog();
        }}
        isSubmitting={false}
      >
        <p className="text-gray-600 text-center py-8">
          Profile photo editing coming soon...
        </p>
      </EditDialog>
    </div>
  );
}
