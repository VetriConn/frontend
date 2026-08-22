"use client";

import { StepProps } from "@/types/signup";
import { FileUploadZone } from "@/components/ui/FileUploadZone";
import { WizardNav } from "../WizardNav";
import { StepHeader } from "../StepHeader";

/**
 * Step 5: Resume Upload (Optional)
 * Allows users to upload their resume
 * Requirements: 6.1, 6.2, 6.9, 6.10, 6.11, 6.12
 */
export const ResumeUploadStep = ({
  formData,
  errors,
  onFieldChange,
  onNext,
  onBack,
  onSkip,
  isBusy = false,
  currentStep,
  totalSteps,
}: StepProps) => {
  const handleFileSelect = (file: File | null) => {
    onFieldChange("resumeFile", file);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <StepHeader
        title="Upload your resume"
        subtitle="Adding a resume helps employers understand your experience. You can always add one later."
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      {/* File Upload Zone */}
      <div className="mb-8">
        <FileUploadZone
          acceptedFormats={["PDF", "DOCX"]}
          maxSizeMB={10}
          file={formData.resumeFile}
          onFileSelect={handleFileSelect}
          error={errors.resumeFile}
        />
      </div>

      <WizardNav
        onBack={onBack}
        onNext={onNext}
        onSkip={onSkip}
        skipLabel="upload later"
        busy={isBusy}
      />
    </div>
  );
};
